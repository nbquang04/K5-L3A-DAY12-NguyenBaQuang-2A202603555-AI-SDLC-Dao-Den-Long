param([Parameter(Mandatory=$true)][string]$Page)
$ErrorActionPreference = 'Stop'
$proof = Join-Path $PSScriptRoot '../docs/proof/phase-1'
$fixtures = Join-Path $PSScriptRoot '../dist/validation'
New-Item -ItemType Directory -Path $fixtures -Force | Out-Null
Copy-Item (Join-Path $PSScriptRoot '../tests/scenarios/*.json') $fixtures
Copy-Item (Join-Path $proof 'default-play.inputs.json') $fixtures
Copy-Item (Join-Path $proof 'scenario-results.json') $fixtures
$source = Get-Content (Join-Path $PSScriptRoot 'browser-check.mjs') -Raw -Encoding utf8
$payload = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($source))
$expression = "eval(atob('$payload'))"
$result = orca eval --page $Page --expression $expression --json | ConvertFrom-Json
$result | ConvertTo-Json -Depth 20 | Set-Content (Join-Path $proof 'browser-results.json') -Encoding utf8
if (-not $result.ok) { throw 'Browser assertions failed; see browser-results.json' }
$assertions = $result.result.result | ConvertFrom-Json
if ($assertions.status -ne 'PASS') { throw 'Browser did not report PASS' }
$shot = orca screenshot --page $Page --json | ConvertFrom-Json
if (-not $shot.ok) { throw 'Screenshot failed' }
Copy-Item -LiteralPath $shot.result.path -Destination (Join-Path $proof 'won.png')
$assertions | ConvertTo-Json -Depth 15
