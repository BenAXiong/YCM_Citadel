# Morpho-Engine Variable Audit Script
# This script scans the codebase for --kilang- variables and outputs a summary.

$SearchPath = "c:\Users\Ben\Documents\LL\6_ycm\YCM_Citadel\portal\components\views\kilang"
$OutputPath = Join-Path $SearchPath "variable_summary.json"

Write-Host "Scanning Morpho-Engine for theme variables..." -ForegroundColor Cyan

$Results = Get-ChildItem $SearchPath -Recurse -Include *.tsx,*.css | Select-String "--kilang-[a-z0-9-]+" | ForEach-Object {
    $matches = [regex]::Matches($_.Line, "--kilang-[a-z0-9-]+")
    foreach ($match in $matches) {
        [PSCustomObject]@{
            File = $_.Path.Replace($SearchPath + "\", "")
            Variable = $match.Value
            Line = $_.LineNumber
        }
    }
}

$Summary = @{}
foreach ($item in $Results) {
    if (-not $Summary.ContainsKey($item.Variable)) {
        $Summary[$item.Variable] = @{
            count = 0
            files = New-Object System.Collections.Generic.HashSet[string]
        }
    }
    $Summary[$item.Variable].count++
    $null = $Summary[$item.Variable].files.Add($item.File)
}

$Final = @{}
foreach ($key in $Summary.Keys) {
    $Final[$key] = @{
        count = $Summary[$key].count
        files = [string[]]($Summary[$key].files | Sort-Object)
    }
}

$Final | ConvertTo-Json -Depth 5 | Out-File $OutputPath -Encoding utf8
Write-Host "Audit complete! Summary saved to: $OutputPath" -ForegroundColor Green
