# ABOUTME: Registers the daily Pega QA job digest in Windows Task Scheduler.
# ABOUTME: Runs at 10:00 PM local time for the current Windows user.
$ErrorActionPreference = "Stop"

$projectDirectory = $PSScriptRoot
$entrypoint = Join-Path $projectDirectory "src\index.js"
$environmentFile = Join-Path $projectDirectory ".env"
$dependenciesDirectory = Join-Path $projectDirectory "node_modules"

if (-not (Test-Path $environmentFile)) {
  throw "Create and configure .env before registering the daily task."
}

if (-not (Test-Path $dependenciesDirectory)) {
  throw "Install project dependencies with npm install before registering the daily task."
}

$nodePath = (Get-Command node.exe -ErrorAction Stop).Source
$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$action = New-ScheduledTaskAction `
  -Execute $nodePath `
  -Argument ('"{0}"' -f $entrypoint) `
  -WorkingDirectory $projectDirectory
$trigger = New-ScheduledTaskTrigger -Daily -At "10:00PM"
$principal = New-ScheduledTaskPrincipal `
  -UserId $currentUser `
  -LogonType Interactive `
  -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet `
  -StartWhenAvailable `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries

Register-ScheduledTask `
  -TaskName "Pega QA Job Digest" `
  -Action $action `
  -Trigger $trigger `
  -Principal $principal `
  -Settings $settings `
  -Description "Sends new Pega QA LinkedIn alert jobs every day at 10:00 PM." `
  -Force | Out-Null

Write-Output "Registered Pega QA Job Digest for 10:00 PM local time."
Write-Output "The PC must be awake and this Windows user must be logged in."