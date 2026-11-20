$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
$stage=Join-Path $root 'artifacts/dao-den-long-v1.0.0'
if(-not (Test-Path (Join-Path $root 'dist/index.html'))){throw 'Run npm run build first'}
New-Item -ItemType Directory -Force (Join-Path $stage 'scripts'),(Join-Path $stage 'src/shared') | Out-Null
Copy-Item (Join-Path $root 'dist') $stage -Recurse -Force
foreach($name in @('serve.mjs','server.mjs','leaderboard-store.mjs')){Copy-Item (Join-Path $PSScriptRoot $name) (Join-Path $stage 'scripts') -Force}
Copy-Item (Join-Path $root 'src/shared/leaderboard.mjs') (Join-Path $stage 'src/shared') -Force
foreach($name in @('LICENSE','CREDITS.md')){Copy-Item (Join-Path $root $name) $stage -Force}
Copy-Item (Join-Path $root 'docs/RELEASE-RUN.md') (Join-Path $stage 'README.md') -Force
'{"private":true,"type":"module","version":"1.0.0"}' | Set-Content (Join-Path $stage 'package.json') -Encoding utf8
$zip=Join-Path $root 'artifacts/dao-den-long-v1.0.0.zip'
Compress-Archive -Path "$stage/*" -DestinationPath $zip -Force
Get-FileHash $zip -Algorithm SHA256 | Format-List
