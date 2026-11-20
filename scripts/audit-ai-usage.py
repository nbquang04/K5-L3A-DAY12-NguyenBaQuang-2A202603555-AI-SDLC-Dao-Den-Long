"""Aggregate project-scoped Codex usage, without exporting conversation text/secrets."""
import argparse
import hashlib
import json
from datetime import datetime
from pathlib import Path

BOUNDARIES = [
    ("preparation", "2026-11-20T08:12:06.027Z"),
    ("phase-1", "2026-11-20T08:58:04Z"),
    ("phase-2", "2026-11-20T09:32:15.581Z"),
    ("phase-3", "2026-11-20T10:11:09.523Z"),
    ("phase-4", "2026-11-20T10:45:17Z"),
    ("submission-review", "2026-11-20T11:01:36.852Z"),
]
FIELDS = ("input_tokens", "cached_input_tokens", "output_tokens", "reasoning_output_tokens", "total_tokens")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sessions-root", required=True, type=Path)
    parser.add_argument("--project", type=Path, default=Path.cwd())
    parser.add_argument("--out", type=Path, default=Path("docs/notes/ai-usage.json"))
    args = parser.parse_args()
    project = str(args.project.resolve()).replace("\\", "/").casefold()
    rows = {name: {"requests": 0, **dict.fromkeys(FIELDS, 0)} for name, _ in BOUNDARIES}
    seen, events, sources = set(), [], []
    for path in sorted(args.sessions_root.rglob("*.jsonl")):
        with path.open(encoding="utf-8") as handle:
            first = handle.readline()
        try:
            meta = json.loads(first).get("payload", {})
        except (ValueError, TypeError):
            continue
        if str(meta.get("cwd", "")).replace("\\", "/").casefold() != project:
            continue
        # Snapshot once: active log may grow later. Only aggregate fixed pre-audit window.
        raw = path.read_bytes()
        thread_id = meta.get("id")
        sources.append({"thread_hash": hashlib.sha256(thread_id.encode()).hexdigest(),
                        "snapshot_sha256": hashlib.sha256(raw).hexdigest(),
                        "snapshot_bytes": len(raw)})
        for line in raw.splitlines():
            try:
                record = json.loads(line)
            except ValueError:
                continue  # Ignore an incomplete final write, never partial JSON usage.
            payload = record.get("payload", {})
            if record.get("type") != "token_usage_record" or payload.get("thread_id") != thread_id:
                continue  # Exclude inherited parent records in a fork.
            response_id = payload.get("response_id")
            if not response_id:
                raise ValueError("Usage record missing response_id")
            if response_id in seen:
                continue
            seen.add(response_id)
            timestamp = record["timestamp"]
            instant = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
            bucket = next((name for name, end in BOUNDARIES
                           if instant < datetime.fromisoformat(end.replace("Z", "+00:00"))), None)
            if bucket is None:
                continue
            usage = {field: payload["usage"].get(field, 0) for field in FIELDS}
            assert all(isinstance(value, int) and value >= 0 for value in usage.values())
            assert usage["total_tokens"] == usage["input_tokens"] + usage["output_tokens"]
            assert usage["cached_input_tokens"] <= usage["input_tokens"]
            assert usage["reasoning_output_tokens"] <= usage["output_tokens"]
            row = rows[bucket]
            row["requests"] += 1
            for field in FIELDS:
                row[field] += usage[field]
            events.append({"timestamp": timestamp, "bucket": bucket,
                           "response_hash": hashlib.sha256(response_id.encode()).hexdigest(), **usage})
    assert events, "No project usage records found"
    for row in rows.values():
        row["uncached_input_tokens"] = row["input_tokens"] - row["cached_input_tokens"]
    totals = {field: sum(rows[f"phase-{i}"][field] for i in range(1, 5)) for field in rows["phase-1"]}
    result = {"scope": "Exact project cwd, root and matching review subagent; per-response usage only",
              "cutoff_utc": BOUNDARIES[-1][1], "boundaries_exclusive_utc": dict(BOUNDARIES),
              "allocation": "Response completion timestamp; phase1 request to phase1 tag including finalization. Preparation and postrelease review separate.",
              "counting": "cached is subset of input; reasoning is subset of output; do not sum cumulative token_count events",
              "money": "Unavailable: no verified billing rate/invoice; token usage is not subscription charge",
              "sources": sources, "buckets": rows, "four_phase_total": totals,
              "sanitized_response_usage": sorted(events, key=lambda item: item["timestamp"])}
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"buckets": rows, "four_phase_total": totals}, indent=2))


if __name__ == "__main__":
    main()
