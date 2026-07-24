param(
    [string]$RootDir = $PWD
)

Add-Type -TypeDefinition @"
using System;
using System.IO;
using System.Text;
using System.Collections.Generic;

public class Utf8Checker
{
    public static bool IsValidUtf8(byte[] data)
    {
        int i = 0;
        while (i < data.Length)
        {
            int b = data[i] & 0xFF;
            if (b <= 0x7F) { i++; }
            else if (b >= 0xC2 && b <= 0xDF)
            {
                if (i + 1 >= data.Length) return false;
                int c = data[i + 1] & 0xFF;
                if (c < 0x80 || c > 0xBF) return false;
                i += 2;
            }
            else if (b >= 0xE0 && b <= 0xEF)
            {
                if (i + 2 >= data.Length) return false;
                int c1 = data[i + 1] & 0xFF;
                int c2 = data[i + 2] & 0xFF;
                if (c1 < 0x80 || c1 > 0xBF || c2 < 0x80 || c2 > 0xBF) return false;
                if (b == 0xE0 && c1 < 0xA0) return false;
                if (b == 0xED && c1 > 0x9F) return false;
                i += 3;
            }
            else if (b >= 0xF0 && b <= 0xF4)
            {
                if (i + 3 >= data.Length) return false;
                int c1 = data[i + 1] & 0xFF;
                int c2 = data[i + 2] & 0xFF;
                int c3 = data[i + 3] & 0xFF;
                if (c1 < 0x80 || c1 > 0xBF || c2 < 0x80 || c2 > 0xBF || c3 < 0x80 || c3 > 0xBF) return false;
                if (b == 0xF0 && c1 < 0x90) return false;
                if (b == 0xF4 && c1 > 0x8F) return false;
                i += 4;
            }
            else
            {
                return false;
            }
        }
        return true;
    }

    public static string CountNonAsciiBytes(byte[] data)
    {
        var counts = new SortedDictionary<int, int>();
        int i = 0;
        bool inMultiByte = false;
        int multiLen = 0;
        while (i < data.Length)
        {
            int b = data[i] & 0xFF;
            if (b <= 0x7F) { i++; continue; }
            
            if (!counts.ContainsKey(b)) counts[b] = 0;
            counts[b]++;
            i++;
        }
        if (counts.Count == 0) return "none";
        var parts = new List<string>();
        foreach (var kv in counts)
            parts.Add(string.Format("0x{0:X2}x{1}", kv.Key, kv.Value));
        return string.Join(", ", parts);
    }

    public static int CountReplacementChars(byte[] data)
    {
        int count = 0;
        for (int i = 0; i <= data.Length - 3; i++)
        {
            if (data[i] == 0xEF && data[i+1] == 0xBF && data[i+2] == 0xBD)
                count++;
        }
        return count;
    }
}
"@

Write-Host "=== Checking files that are still NOT valid UTF-8 ==="
$invalidFiles = 0
Get-ChildItem -Path $RootDir -Recurse -Include "*.html", "*.js", "*.json", "*.csv", "*.md" | Where-Object { 
    $_.FullName -notmatch '\\node_modules\\' -and $_.FullName -notmatch '\\.git\\' 
} | ForEach-Object {
    $data = [System.IO.File]::ReadAllBytes($_.FullName)
    if (![Utf8Checker]::IsValidUtf8($data)) {
        $invalidFiles++
        $rel = $_.FullName.Substring($RootDir.Length + 1)
        Write-Host ("INVALID: {0}" -f $rel)
    }
}
Write-Host ("`nFiles still with invalid UTF-8: {0}" -f $invalidFiles)

Write-Host ""
Write-Host "=== Files containing U+FFFD (replacement char �) ==="
$fffdFiles = 0
Get-ChildItem -Path $RootDir -Recurse -Include "*.html", "*.js", "*.json", "*.csv", "*.md" | Where-Object { 
    $_.FullName -notmatch '\\node_modules\\' -and $_.FullName -notmatch '\\.git\\' 
} | ForEach-Object {
    $data = [System.IO.File]::ReadAllBytes($_.FullName)
    $count = [Utf8Checker]::CountReplacementChars($data)
    if ($count -gt 0) {
        $fffdFiles++
        $rel = $_.FullName.Substring($RootDir.Length + 1)
        Write-Host ("  {0} : {1} occurrences" -f $rel, $count)
    }
}
Write-Host ("`nFiles with � characters: {0}" -f $fffdFiles)
