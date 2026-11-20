param([Parameter(Mandatory=$true)][string]$Page)
$ErrorActionPreference='Stop'
$proof=Join-Path $PSScriptRoot '../docs/proof/phase-3'
$fixtures=Join-Path $PSScriptRoot '../dist/validation'
New-Item -ItemType Directory -Force $fixtures | Out-Null
Copy-Item (Join-Path $proof 'results.json') (Join-Path $fixtures 'phase3-results.json')
Copy-Item (Join-Path $proof 'regression/results.json') (Join-Path $fixtures 'phase2-results.json')
Copy-Item (Join-Path $PSScriptRoot 'browser-check-phase2.mjs') $fixtures
$source=Get-Content (Join-Path $PSScriptRoot 'browser-check-phase3.mjs') -Raw -Encoding utf8
$payload=[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($source))
$result=orca eval --page $Page --expression "eval(atob('$payload'))" --json | ConvertFrom-Json
$result | ConvertTo-Json -Depth 40 | Set-Content (Join-Path $proof 'browser-results.json') -Encoding utf8
if(-not $result.ok){throw 'Browser assertions failed'}
$checks=$result.result.result | ConvertFrom-Json
if($checks.status -ne 'PASS'){throw 'Browser did not PASS'}
Write-Output "PASS: $($checks.results.Count) Phase3 checks plus $($checks.regression.results.Count) browser regressions"
