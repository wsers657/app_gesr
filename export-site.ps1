# Export only the application's runtime files. Never publish the repository root.
$ErrorActionPreference = 'Stop'
$siteRoot = $PSScriptRoot
$exportRoot = Join-Path $siteRoot 'dist'
$runtimeFiles = @('index.html','styles.css','script.js','locale-data.js','family-data.js','family.js','demo-data.js','demo.js','pricing-data.js','pricing.js')
$assets = foreach ($file in $runtimeFiles) {
    $source = [IO.File]::ReadAllText((Join-Path $siteRoot $file))
    [regex]::Matches($source, 'images/[a-zA-Z0-9_.-]+\.(?:png|jpg|jpeg|webp|svg)') | ForEach-Object { $_.Value }
}
$allowedFiles = @($runtimeFiles) + @($assets | Sort-Object -Unique)
if (Test-Path -LiteralPath $exportRoot) {
    foreach ($existing in Get-ChildItem -LiteralPath $exportRoot -Recurse -File) {
        $relative = $existing.FullName.Substring($exportRoot.Length + 1).Replace('\','/')
        if ($relative -notin $allowedFiles) { throw "Unexpected file in dist: $relative. Export stopped to avoid publishing it." }
    }
}
foreach ($file in $allowedFiles) {
    $sourcePath = Join-Path $siteRoot $file
    if (!(Test-Path -LiteralPath $sourcePath -PathType Leaf)) { throw "Missing asset: $file" }
    $destination = Join-Path $exportRoot $file
    New-Item -ItemType Directory -Force -Path (Split-Path $destination) | Out-Null
    Copy-Item -LiteralPath $sourcePath -Destination $destination -Force
}
Write-Output "Export ready: $exportRoot ($($allowedFiles.Count) files). Publish only this directory."
