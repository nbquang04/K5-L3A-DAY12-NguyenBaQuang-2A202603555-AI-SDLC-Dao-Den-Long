# Project-local Specify CLI. Additional arguments are forwarded unchanged.
$speckitExecutable = Join-Path $PSScriptRoot '../.tools/speckit/Scripts/specify.exe'
if (-not (Test-Path -LiteralPath $speckitExecutable)) {
    throw 'Spec Kit CLI is missing. See docs/SPECKIT.md for installation instructions.'
}
& $speckitExecutable @args
exit $LASTEXITCODE
