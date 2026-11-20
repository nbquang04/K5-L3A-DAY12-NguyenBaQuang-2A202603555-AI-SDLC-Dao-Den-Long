"""Run reviewed argv checks and preserve raw logs plus JSON/Markdown reports."""
from __future__ import annotations

import argparse
import datetime as dt
import json
from pathlib import Path
import platform
import subprocess
import sys
import time
import uuid

ROOT = Path(__file__).resolve().parents[1]


def git_info(args: list[str]) -> str:
    try:
        result = subprocess.run(
            ["git", *args], cwd=ROOT, capture_output=True, text=True,
            encoding="utf-8", errors="replace", timeout=10, check=False,
        )
        return result.stdout.strip() if result.returncode == 0 else "unavailable"
    except (OSError, subprocess.TimeoutExpired):
        return "unavailable"


def load_checks(path: Path) -> list[dict]:
    data = json.loads(path.read_text(encoding="utf-8-sig"))
    if not isinstance(data, dict) or not isinstance(data.get("checks"), list):
        raise ValueError("Config must contain a checks array")
    checks = data["checks"]
    seen = set()
    for item in checks:
        if not isinstance(item, dict):
            raise ValueError("Each check must be an object")
        identifier = item.get("id")
        if not isinstance(identifier, str) or not identifier.strip() or identifier in seen:
            raise ValueError("Check id must be a unique nonempty string")
        seen.add(identifier)
        command = item.get("command")
        if not isinstance(command, list) or not command or any(
            not isinstance(arg, str) or not arg or "\0" in arg for arg in command
        ):
            raise ValueError(f"{identifier}: command must be a nonempty argv array")
        requirements = item.get("requirements")
        if not isinstance(requirements, list) or not requirements or any(
            not isinstance(req, str) or not req.strip() for req in requirements
        ):
            raise ValueError(f"{identifier}: requirements must contain requirement IDs")
        timeout = item.get("timeout_seconds", 120)
        if isinstance(timeout, bool) or not isinstance(timeout, (int, float)) or not 0 < timeout <= 3600:
            raise ValueError(f"{identifier}: timeout_seconds must be in (0, 3600]")
    return checks


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", default="verification/checks.json")
    parser.add_argument("--output-dir", default="verification/runs")
    args = parser.parse_args()
    output_root = (ROOT / args.output_dir).resolve()
    if not output_root.is_relative_to(ROOT):
        parser.error("--output-dir must stay inside the repository")
    run_id = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ") + "-" + uuid.uuid4().hex[:8]
    run_dir = output_root / run_id
    run_dir.mkdir(parents=True, exist_ok=False)
    report = {
        "run_id": run_id,
        "started_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
        "revision": git_info(["rev-parse", "HEAD"]),
        "working_tree_before_run": git_info(["status", "--short"]),
        "environment": {"platform": platform.platform(), "python": sys.version, "cwd": str(ROOT)},
        "config": str((ROOT / args.config).resolve()),
        "scope": "Configured automated commands only; manual checks and phase acceptance are separate.",
        "checks": [],
        "issues": [],
    }
    try:
        checks = load_checks(ROOT / args.config)
    except (OSError, ValueError) as exc:
        checks = []
        report["issues"].append(f"Invalid or unreadable config: {exc}")
    if not checks and not report["issues"]:
        report["issues"].append("No checks configured; gameplay verification has not run.")

    for index, check in enumerate(checks, 1):
        stdout_path = run_dir / f"{index:03d}.stdout.log"
        stderr_path = run_dir / f"{index:03d}.stderr.log"
        result = {
            "id": check["id"], "requirements": check["requirements"],
            "command": check["command"], "timeout_seconds": check.get("timeout_seconds", 120),
            "stdout": stdout_path.name, "stderr": stderr_path.name,
            "status": "NOT_RUN", "exit_code": None,
        }
        started = time.monotonic()
        with stdout_path.open("wb") as stdout, stderr_path.open("wb") as stderr:
            try:
                completed = subprocess.run(
                    check["command"], cwd=ROOT, stdout=stdout, stderr=stderr,
                    timeout=result["timeout_seconds"], check=False, shell=False,
                )
                result["exit_code"] = completed.returncode
                result["status"] = "PASS" if completed.returncode == 0 else "FAIL"
            except subprocess.TimeoutExpired:
                result["status"] = "FAIL"
                result["reason"] = "Check exceeded its timeout"
            except OSError as exc:
                result["status"] = "BLOCKED"
                result["reason"] = str(exc)
        result["duration_seconds"] = round(time.monotonic() - started, 3)
        report["checks"].append(result)

    statuses = [item["status"] for item in report["checks"]]
    if report["issues"] or "BLOCKED" in statuses:
        report["status"], exit_code = "BLOCKED", 2
    elif "FAIL" in statuses:
        report["status"], exit_code = "FAIL", 1
    else:
        report["status"], exit_code = "PASS", 0
    report["counts"] = {state: statuses.count(state) for state in ("PASS", "FAIL", "BLOCKED", "NOT_RUN")}
    report["finished_at_utc"] = dt.datetime.now(dt.timezone.utc).isoformat()
    (run_dir / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Verification report", "", f"Status: **{report['status']}**", "",
        f"Revision: `{report['revision']}`", "", report["scope"], "",
        "| Check | Requirements | Status | Exit | Seconds | Logs |",
        "|---|---|---|---|---|---|",
    ]
    def cell(value: object) -> str:
        return str(value).replace("|", "\\|").replace("\n", " ").replace("\r", " ")

    for item in report["checks"]:
        lines.append(
            f"| {cell(item['id'])} | {cell(', '.join(item['requirements']))} | {item['status']} | "
            f"{item['exit_code']} | {item['duration_seconds']} | "
            f"[stdout]({item['stdout']}) / [stderr]({item['stderr']}) |"
        )
    lines.extend(["", "## Issues", ""])
    lines.extend(f"- {issue}" for issue in report["issues"])
    for item in report["checks"]:
        if "reason" in item:
            lines.append(f"- {item['id']}: {item['reason']}")
    if not report["issues"] and not any("reason" in item for item in report["checks"]):
        lines.append("No runner issues recorded. See raw logs for command details.")
    lines.extend(["", "Commands, environment, dirty working tree and timestamps are recorded in report.json.", ""])
    (run_dir / "report.md").write_text("\n".join(lines), encoding="utf-8")
    print(f"{report['status']}: {run_dir.relative_to(ROOT) / 'report.md'}")
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
