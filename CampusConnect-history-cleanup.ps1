# CampusConnect Git History Cleanup
# Copyright (C) 2026 Asif Ahamad
#
# Source of truth for this release:
#   CampusConnect(10).zip
#
# Purpose:
#   Purge runtime/user-uploaded files and unused/template artifacts from ALL
#   Git history before publishing the final AGPLv3 release.
#
# IMPORTANT:
#   1. Run from the ROOT of the final CampusConnect Git repository.
#   2. Make a full backup before running.
#   3. This REWRITES HISTORY; commit hashes will change.
#   4. Do NOT push automatically. Review everything first.
#   5. After verification, use --force-with-lease, not plain --force.
#
# This script does NOT decide what source code you own or relicense. It only
# purges the paths listed below. Third-party software/assets keep their
# original licenses.

$ErrorActionPreference = 'Stop'

$RepositoryUrl = 'https://github.com/Ashu-3180/CampusConnect.git'
$Branch = 'main'

# Final-release cleanup targets identified in the latest supplied snapshot.
$PathsToPurge = @(
    'server/uploads/',
    '_patch_tmp/',
    'client/README.md',
    'client/src/assets/vite.svg',
    'client/public/favicon.svg',
    'client/public/icons.svg',
    'client/src/assets/hero.png'
)

function Step([string]$Message) {
    Write-Host "`n$Message" -ForegroundColor Cyan
}

function Require-Command([string]$Name) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "$Name was not found on PATH."
    }
}

Write-Host '=============================================' -ForegroundColor Cyan
Write-Host ' CampusConnect - Final AGPLv3 History Clean' -ForegroundColor Cyan
Write-Host ' Copyright (C) 2026 Asif Ahamad' -ForegroundColor Cyan
Write-Host '=============================================' -ForegroundColor Cyan

Step '1/8 - Repository preflight'

Require-Command 'git'

$repoRoot = git rev-parse --show-toplevel 2>$null
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($repoRoot)) {
    throw 'Run this script from inside the CampusConnect Git repository.'
}
Set-Location $repoRoot

$currentBranch = (git branch --show-current).Trim()
if ($currentBranch -ne $Branch) {
    throw "Current branch is '$currentBranch'. Switch to '$Branch' before rewriting history."
}

Write-Host "Repository : $repoRoot"
Write-Host "Branch     : $currentBranch"
Write-Host "Remote     : $RepositoryUrl"

Step '2/8 - Working tree safety check'

$status = git status --porcelain
if ($status) {
    Write-Host $status
    throw 'Working tree is not clean. Commit the final CampusConnect state first, then rerun this script.'
}

Step '3/8 - Checking git-filter-repo'

if (-not (Get-Command git-filter-repo -ErrorAction SilentlyContinue)) {
    Write-Host 'git-filter-repo is not installed. Installing for the current user...' -ForegroundColor Yellow

    if (Get-Command py -ErrorAction SilentlyContinue) {
        py -m pip install --user git-filter-repo
    }
    elseif (Get-Command python -ErrorAction SilentlyContinue) {
        python -m pip install --user git-filter-repo
    }
    else {
        throw 'Python launcher (py) or python was not found. Install git-filter-repo and rerun.'
    }
}

Require-Command 'git-filter-repo'

Step '4/8 - Creating recovery branch'

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupRef = "backup/pre-agpl-history-cleanup-$timestamp"

git branch $backupRef
if ($LASTEXITCODE -ne 0) {
    throw "Could not create recovery branch: $backupRef"
}
Write-Host "Recovery branch: $backupRef" -ForegroundColor Green

Step '5/8 - Rewriting history'

Write-Host 'Paths to purge from all Git history:' -ForegroundColor Yellow
$PathsToPurge | ForEach-Object { Write-Host "  - $_" }

$args = @('filter-repo', '--force')
foreach ($path in $PathsToPurge) {
    $args += @('--path', $path)
}
$args += '--invert-paths'

& git-filter-repo @args
if ($LASTEXITCODE -ne 0) {
    throw 'git-filter-repo failed. Stop and inspect the repository.'
}

# git-filter-repo commonly removes origin as a safety measure.
$originUrl = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
    if ($originUrl -ne $RepositoryUrl) {
        git remote set-url origin $RepositoryUrl
    }
}
else {
    git remote add origin $RepositoryUrl
}

Step '6/8 - Current-tree verification'

$badCurrent = git ls-files |
    Select-String -Pattern '(^|/)(_patch_tmp/|server/uploads/|client/README\.md$|client/src/assets/vite\.svg$|client/public/(favicon|icons)\.svg$|client/src/assets/hero\.png$|.*\.env$)'

if ($badCurrent) {
    Write-Host $badCurrent
    throw 'Excluded paths remain in the current Git tree. Do not push.'
}

Write-Host 'Current-tree cleanup: PASS' -ForegroundColor Green

Step '7/8 - Historical verification'

$badHistory = git log --all --name-only --pretty=format: |
    Select-String -Pattern '(^|/)(_patch_tmp/|server/uploads/|client/README\.md$|client/src/assets/vite\.svg$|client/public/(favicon|icons)\.svg$|client/src/assets/hero\.png$)'

if ($badHistory) {
    Write-Host $badHistory
    throw 'One or more excluded paths remain in Git history. Do not push.'
}

# Detect historical .env files, but allow .env.example.
$envHistory = git log --all --name-only --pretty=format: |
    Select-String -Pattern '(^|/)\.env($|\.)' |
    Where-Object { $_.Line -notmatch '(^|/)\.env\.example$' } |
    Sort-Object -Unique

if ($envHistory) {
    Write-Host $envHistory
    throw 'A possible real .env file appears in Git history. Review it before pushing.'
}

Write-Host 'Historical path cleanup: PASS' -ForegroundColor Green
Write-Host 'Historical .env check: PASS' -ForegroundColor Green

Step '8/8 - Final review'

Write-Host "`nGit status:"
git status

Write-Host "`nRecent rewritten commits:"
git log --oneline --decorate -10

Write-Host "`nRemote:"
git remote -v

Write-Host "`nRecovery branch:"
Write-Host $backupRef -ForegroundColor Yellow

Write-Host "`nNO REMOTE PUSH WAS PERFORMED." -ForegroundColor Green
Write-Host "After reviewing and testing the application, push with:"
Write-Host "  git push --force-with-lease origin main" -ForegroundColor White
