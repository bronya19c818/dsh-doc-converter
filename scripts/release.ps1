#Requires -Version 5.1
<#
.SYNOPSIS
    doc-converter 一键发版：预检、发 CNB、推代码、网关验证、同步市场清单。

.EXAMPLE
    .\scripts\release.ps1 -Version 0.2.1
    .\scripts\release.ps1 -BumpVersion patch
    .\scripts\release.ps1 -Version 0.2.0 -SkipPublish -SkipGit   # 复跑验证与清单
#>
param(
    [string]$Version,
    [ValidateSet('patch', 'minor', 'major')][string]$BumpVersion,
    [string]$KeysFile = (Join-Path $HOME '.dsh/release-test-keys.json'),
    [string]$Proxy = 'http://127.0.0.1:2080',
    [switch]$SkipPreflight,
    [switch]$SkipPublish,
    [switch]$SkipGit,
    [switch]$SkipVerify,
    [switch]$SkipMarket,
    [switch]$AllowDirty,
    [switch]$NoPush,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$skill = Join-Path $HOME '.agents/skills/cnb-licensed-plugin-dist/scripts/release-plugin.ps1'
if (-not (Test-Path $skill)) { throw "找不到发布脚本：$skill" }

$python = Join-Path $HOME '.dsh/storages/dsh-doc-converter/venv/Scripts/python.exe'
$params = @{
    Path = (Join-Path $PSScriptRoot '..')
    KeysFile = $KeysFile
    Proxy = $Proxy
    ExpectFiles = 'python/doc_converter/paddle_ocr.py',
        'python/doc_converter/ocr_structure.py',
        'client.js'
}
if (Test-Path $python) { $params.TestPython = $python }
if ($Version) { $params.Version = $Version }
if ($BumpVersion) { $params.BumpVersion = $BumpVersion }
if ($SkipPreflight) { $params.SkipPreflight = $true }
if ($SkipPublish) { $params.SkipPublish = $true }
if ($SkipGit) { $params.SkipGit = $true }
if ($SkipVerify) { $params.SkipVerify = $true }
if ($SkipMarket) { $params.SkipMarket = $true }
if ($AllowDirty) { $params.AllowDirty = $true }
if ($NoPush) { $params.NoPush = $true }
if ($DryRun) { $params.DryRun = $true }

& $skill @params
exit $LASTEXITCODE