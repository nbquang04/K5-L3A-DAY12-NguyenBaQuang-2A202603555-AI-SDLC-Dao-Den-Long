param([Parameter(Mandatory=$true)][string]$Page)
$ErrorActionPreference='Stop'
$proof=Join-Path $PSScriptRoot '../docs/proof/phase-2'
$fixtures=Join-Path $PSScriptRoot '../dist/validation'
New-Item -ItemType Directory -Force $fixtures | Out-Null
Copy-Item (Join-Path $proof 'results.json') (Join-Path $fixtures 'phase2-results.json')
$source=Get-Content (Join-Path $PSScriptRoot 'browser-check-phase2.mjs') -Raw -Encoding utf8
$payload=[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($source))
$expression="eval(atob('$payload'))"
$result=orca eval --page $Page --expression $expression --json | ConvertFrom-Json
$result | ConvertTo-Json -Depth 30 | Set-Content (Join-Path $proof 'browser-results.json') -Encoding utf8
if(-not $result.ok){throw 'Browser assertions failed'}
$assertions=$result.result.result | ConvertFrom-Json
if($assertions.status -ne 'PASS'){throw 'Browser did not PASS'}
$assertions | ConvertTo-Json -Depth 20
