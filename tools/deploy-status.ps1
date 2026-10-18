param(
  [int]$MaxWaitSec = 300,
  [int]$IntervalSec = 20,
  [string]$Repository = 'Parama-Guru/Ge',
  [string]$Username = 'Parama-Guru'
)

$ErrorActionPreference = 'Stop'
$env:GCM_INTERACTIVE = 'never'

$credential = "protocol=https`nhost=github.com`nusername=$Username`n`n" | git credential fill
if ($LASTEXITCODE -ne 0) { throw "No saved GitHub login for $Username. Run: git credential-manager github login --username $Username" }
$token = ($credential | Where-Object { $_ -like 'password=*' }) -replace '^password=', ''
if (-not $token) { throw "Git Credential Manager returned no token for $Username." }
$headers = @{ Authorization = "Bearer $token"; Accept = 'application/vnd.github+json' }

$head = (git rev-parse HEAD).Trim()
$deadline = (Get-Date).AddSeconds($MaxWaitSec)
do {
  $run = (Invoke-RestMethod "https://api.github.com/repos/$Repository/actions/runs?per_page=5" -Headers $headers).workflow_runs |
    Where-Object head_sha -eq $head | Select-Object -First 1
  if ($run) {
    Write-Output "$($run.status)/$($run.conclusion) $($run.html_url)"
    if ($run.status -eq 'completed') {
      if ($run.conclusion -ne 'success') { exit 1 }
      exit 0
    }
  } else {
    Write-Output "Waiting for a workflow run for $head"
  }
  Start-Sleep -Seconds $IntervalSec
} while ((Get-Date) -lt $deadline)

Write-Output "Timed out after $MaxWaitSec seconds."
exit 2
