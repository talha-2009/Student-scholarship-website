$rootDir = "C:\Users\Abdullah Ijaz Abbasi\Documents\Student scholarship website"
$allFiles = Get-ChildItem -Path "$rootDir\dist" -Recurse -Include "*.html"
$corruptFiles = @()
$fffdFiles = @()

foreach($f in $allFiles) {
    $data = [System.IO.File]::ReadAllBytes($f.FullName)
    
    # Check for invalid UTF-8
    $i = 0
    $valid = $true
    while($i -lt $data.Length -and $valid) {
        $b = $data[$i]
        if ($b -le 0x7F) { $i++ }
        elseif ($b -ge 0xC2 -and $b -le 0xDF) {
            if ($i+1 -lt $data.Length -and $data[$i+1] -ge 0x80 -and $data[$i+1] -le 0xBF) { $i += 2 }
            else { $valid = $false }
        }
        elseif ($b -ge 0xE0 -and $b -le 0xEF) {
            if ($i+2 -lt $data.Length -and $data[$i+1] -ge 0x80 -and $data[$i+1] -le 0xBF -and $data[$i+2] -ge 0x80 -and $data[$i+2] -le 0xBF) { $i += 3 }
            else { $valid = $false }
        }
        elseif ($b -ge 0xF0 -and $b -le 0xF4) {
            if ($i+3 -lt $data.Length -and $data[$i+1] -ge 0x80 -and $data[$i+1] -le 0xBF -and $data[$i+2] -ge 0x80 -and $data[$i+2] -le 0xBF -and $data[$i+3] -ge 0x80 -and $data[$i+3] -le 0xBF) { $i += 4 }
            else { $valid = $false }
        }
        else { $valid = $false }
    }
    
    if (-not $valid) {
        $rel = $f.FullName.Substring($rootDir.Length + 1)
        $corruptFiles += $rel
    }
    
    # Check for U+FFFD (replacement character)
    for($j=0; $j -lt $data.Length-2; $j++) {
        if ($data[$j] -eq 0xEF -and $data[$j+1] -eq 0xBF -and $data[$j+2] -eq 0xBD) {
            $rel = $f.FullName.Substring($rootDir.Length + 1)
            $fffdFiles += $rel
            break
        }
    }
}

Write-Host "=== Dist Verification ==="
Write-Host "Files with invalid UTF-8 bytes: $($corruptFiles.Count)"
if ($corruptFiles.Count -gt 0) {
    foreach($f in $corruptFiles) { Write-Host "  INVALID: $f" }
}
Write-Host "Files with replacement chars (FFFD): $($fffdFiles.Count)"
if ($fffdFiles.Count -gt 0) {
    foreach($f in $fffdFiles) { Write-Host "  FFFD: $f" }
}
if ($corruptFiles.Count -eq 0 -and $fffdFiles.Count -eq 0) {
    Write-Host "ALL DIST FILES ARE CLEAN!"
}
