# Design System Color Migration Script
# Replaces old hex codes with new slate/cyan palette

$srcDir = "c:\Users\swizz\Desktop\Emailer\emailer\src"

$replacements = @{
    '#FF6B4A' = '#06B6D4'
    '#ff6b4a' = '#06B6D4'
    '#FF5533' = '#0891B2'
    '#F43F5E' = '#0EA5E9'
    '#1A1D26' = '#0F172A'
    '#F8F9FC' = '#F8FAFC'
    '#4B5563' = '#64748B'
    '#9CA3AF' = '#94A3B8'
    '#E5E7EB' = '#E2E8F0'
    '#F1F3F8' = '#F1F5F9'
    '#0284C7' = '#0891B2'
}

# Second pass to catch #0EA5E9 that was introduced by F43F5E replacement
$pass2 = @{
    '#0EA5E9' = '#06B6D4'
}

$files = Get-ChildItem -Path $srcDir -Recurse -Include "*.tsx","*.ts" | 
    Where-Object { 
        $_.FullName -notlike "*node_modules*" -and 
        $_.FullName -notlike "*(marketing)*" -and 
        $_.FullName -notlike "*opengraph*" -and
        $_.FullName -notlike "*_generated*"
    }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    $original = $content
    
    foreach ($old in $replacements.Keys) {
        $content = $content -replace [regex]::Escape($old), $replacements[$old]
    }
    
    foreach ($old in $pass2.Keys) {
        $content = $content -replace [regex]::Escape($old), $pass2[$old]
    }
    
    if ($content -ne $original) {
        Set-Content $file.FullName $content -NoNewline
        Write-Host "Updated: $($file.Name)"
    }
}

Write-Host "`nDone!"
