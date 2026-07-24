param(
    [string]$RootDir = $PWD
)

Add-Type -TypeDefinition @"
using System;
using System.IO;
using System.Text;
using System.Collections.Generic;

public class EncodingFixer
{
    private static Encoding Win1252 = Encoding.GetEncoding(1252);

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

    /// <summary>
    /// Only replace invalid UTF-8 bytes (0x80-0x9F that appear standalone)
    /// while preserving valid multi-byte sequences.
    /// </summary>
    public static byte[] FixCorruptedBytes(byte[] data)
    {
        var result = new List<byte>();
        int i = 0;
        while (i < data.Length)
        {
            int b = data[i] & 0xFF;
            if (b <= 0x7F)
            {
                result.Add(data[i]);
                i++;
            }
            else if (b >= 0xC2 && b <= 0xDF && i + 1 < data.Length)
            {
                int c = data[i + 1] & 0xFF;
                if (c >= 0x80 && c <= 0xBF) { result.Add(data[i]); result.Add(data[i+1]); i += 2; }
                else { ConvertByte(data[i], result); i++; }
            }
            else if (b >= 0xE0 && b <= 0xEF && i + 2 < data.Length)
            {
                int c1 = data[i + 1] & 0xFF;
                int c2 = data[i + 2] & 0xFF;
                if (c1 >= 0x80 && c1 <= 0xBF && c2 >= 0x80 && c2 <= 0xBF
                    && !(b == 0xE0 && c1 < 0xA0) && !(b == 0xED && c1 > 0x9F))
                { result.Add(data[i]); result.Add(data[i+1]); result.Add(data[i+2]); i += 3; }
                else { ConvertByte(data[i], result); i++; }
            }
            else if (b >= 0xF0 && b <= 0xF4 && i + 3 < data.Length)
            {
                int c1 = data[i + 1] & 0xFF;
                int c2 = data[i + 2] & 0xFF;
                int c3 = data[i + 3] & 0xFF;
                if (c1 >= 0x80 && c1 <= 0xBF && c2 >= 0x80 && c2 <= 0xBF && c3 >= 0x80 && c3 <= 0xBF
                    && !(b == 0xF0 && c1 < 0x90) && !(b == 0xF4 && c1 > 0x8F))
                { result.Add(data[i]); result.Add(data[i+1]); result.Add(data[i+2]); result.Add(data[i+3]); i += 4; }
                else { ConvertByte(data[i], result); i++; }
            }
            else
            {
                ConvertByte(data[i], result);
                i++;
            }
        }
        return result.ToArray();
    }

    private static void ConvertByte(byte b, List<byte> output)
    {
        // Decode the single byte as Windows-1252, then re-encode as UTF-8
        string text = Win1252.GetString(new byte[] { b });
        byte[] utf8 = Encoding.UTF8.GetBytes(text);
        foreach (byte ub in utf8) output.Add(ub);
    }

    public static void FixFile(string filePath)
    {
        byte[] data = File.ReadAllBytes(filePath);
        if (IsValidUtf8(data)) return;

        byte[] fixedData = FixCorruptedBytes(data);
        // Remove UTF-8 BOM if present
        if (fixedData.Length >= 3 && fixedData[0] == 0xEF && fixedData[1] == 0xBB && fixedData[2] == 0xBF)
        {
            byte[] noBom = new byte[fixedData.Length - 3];
            Array.Copy(fixedData, 3, noBom, 0, noBom.Length);
            fixedData = noBom;
        }
        // Also check if the result is now valid UTF-8
        if (!IsValidUtf8(fixedData))
        {
            // Last resort: decode entirely as Windows-1252 and re-encode as UTF-8
            string text = Win1252.GetString(data);
            fixedData = Encoding.UTF8.GetBytes(text);
            if (fixedData.Length >= 3 && fixedData[0] == 0xEF && fixedData[1] == 0xBB && fixedData[2] == 0xBF)
            {
                byte[] noBom = new byte[fixedData.Length - 3];
                Array.Copy(fixedData, 3, noBom, 0, noBom.Length);
                fixedData = noBom;
            }
        }
        File.WriteAllBytes(filePath, fixedData);
    }

    public static string GetCorruptedBytesSummary(byte[] data)
    {
        var counts = new SortedDictionary<int, int>();
        int i = 0;
        while (i < data.Length)
        {
            int b = data[i] & 0xFF;
            bool valid = false;
            if (b <= 0x7F) valid = true;
            else if (b >= 0xC2 && b <= 0xDF && i + 1 < data.Length)
            { int c = data[i+1] & 0xFF; if (c >= 0x80 && c <= 0xBF) { valid = true; i++; } }
            else if (b >= 0xE0 && b <= 0xEF && i + 2 < data.Length)
            { int c1 = data[i+1] & 0xFF; int c2 = data[i+2] & 0xFF; if (c1 >= 0x80 && c1 <= 0xBF && c2 >= 0x80 && c2 <= 0xBF && !(b == 0xE0 && c1 < 0xA0) && !(b == 0xED && c1 > 0x9F)) { valid = true; i += 2; } }
            else if (b >= 0xF0 && b <= 0xF4 && i + 3 < data.Length)
            { int c1 = data[i+1] & 0xFF; int c2 = data[i+2] & 0xFF; int c3 = data[i+3] & 0xFF; if (c1 >= 0x80 && c1 <= 0xBF && c2 >= 0x80 && c2 <= 0xBF && c3 >= 0x80 && c3 <= 0xBF && !(b == 0xF0 && c1 < 0x90) && !(b == 0xF4 && c1 > 0x8F)) { valid = true; i += 3; } }
            if (!valid) { if (!counts.ContainsKey(b)) counts[b] = 0; counts[b]++; }
            i++;
        }
        if (counts.Count == 0) return "none";
        var parts = new List<string>();
        foreach (var kv in counts)
            parts.Add(string.Format("0x{0:X2}x{1}", kv.Key, kv.Value));
        return string.Join(", ", parts);
    }
}
"@

$totalFixed = 0
$totalFiles = 0
$fileList = @()
Write-Host "Scanning for files with encoding corruption..."
Write-Host ""

Get-ChildItem -Path $RootDir -Recurse -Include "*.html", "*.js", "*.json", "*.csv", "*.md" | Where-Object { 
    $_.FullName -notmatch '\\node_modules\\' -and $_.FullName -notmatch '\\.git\\' 
} | ForEach-Object {
    $path = $_.FullName
    $data = [System.IO.File]::ReadAllBytes($path)
    
    if ([EncodingFixer]::IsValidUtf8($data)) {
        return
    }
    
    $totalFiles++
    $summary = [EncodingFixer]::GetCorruptedBytesSummary($data)
    $relPath = $_.FullName.Substring($RootDir.Length + 1)
    
    Write-Host ("{0}" -f $relPath)
    Write-Host ("  Corrupted: {0}" -f $summary)
    
    try {
        [EncodingFixer]::FixFile($path)
        $totalFixed++
        Write-Host ("  -> FIXED")
    } catch {
        Write-Host ("  -> ERROR: {0}" -f $_.Exception.Message)
    }
}

Write-Host ""
Write-Host ("=== Summary ===")
Write-Host ("Files with invalid UTF-8: {0}" -f $totalFiles)
Write-Host ("Files fixed: {0}" -f $totalFixed)
