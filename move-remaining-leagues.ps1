#!/usr/bin/env pwsh

Write-Host "Moving remaining leagues to sport folders..."

$logosPath = "c:\Projects\thales\thales-sport-markets\public\logos"

# Additional mappings for remaining leagues
$remainingLeagueToSportMappings = @{
    # More Hockey leagues
    'Finland SM Liiga' = 'Hockey'
    'Russia KHL' = 'Hockey'
    'Sweden SHL' = 'Hockey'
    'Austria Ice Hockey League' = 'Hockey'
    'Germany DEL' = 'Hockey'
    
    # More Baseball (already moved but cleaning up any remaining)
    'CPBL' = 'Baseball'
    'KBO' = 'Baseball'
    'NPB' = 'Baseball'
    'MLB' = 'Baseball'
    
    # More Volleyball leagues (if any remain)
    'Brazil Superliga' = 'Volleyball'  # Note: might be handball, needs verification
    'Poland Superliga' = 'Volleyball'  # Note: might be handball, needs verification
    
    # More Fighting
    'PFL' = 'Fighting'  # Should already be in Fighting folder
    
    # More Basketball (team sport, so likely not individual)
    # 'NBA' = 'Basketball'  # Keep as team sport
    # 'WNBA' = 'Basketball'  # Keep as team sport
    
    # Additional team sports - should remain as leagues for now
    # These are team sports so the routing logic should fall through to league-based paths
}

# Check for any leagues that might contain "Futures" content
$futuresPatterns = @(
    '*FUTURES*', '*Futures*', '*futures*'
)

Write-Host "Checking for Futures-related folders..."
foreach ($pattern in $futuresPatterns) {
    $matchingFolders = Get-ChildItem -Path $logosPath -Directory -Name -Filter $pattern
    foreach ($folder in $matchingFolders) {
        Write-Host "Found potential Futures folder: $folder"
        # We could move these, but most futures are league-specific rather than sport-specific
    }
}

# Move remaining files
foreach ($leagueFolder in $remainingLeagueToSportMappings.Keys) {
    $sportFolder = $remainingLeagueToSportMappings[$leagueFolder]
    $sourcePath = Join-Path $logosPath $leagueFolder
    $targetPath = Join-Path $logosPath $sportFolder
    
    if (Test-Path $sourcePath) {
        Write-Host "Moving files from '$leagueFolder' to '$sportFolder'..."
        
        # Get all image files from the source folder
        $imageFiles = Get-ChildItem -Path $sourcePath -File -Include "*.webp", "*.png", "*.jpg", "*.jpeg", "*.svg" -Recurse
        
        if ($imageFiles.Count -gt 0) {
            foreach ($file in $imageFiles) {
                $targetFile = Join-Path $targetPath $file.Name
                
                # Check if file already exists in target
                if (Test-Path $targetFile) {
                    Write-Host "  Warning: $($file.Name) already exists in $sportFolder, skipping..."
                } else {
                    try {
                        Copy-Item -Path $file.FullName -Destination $targetFile -Force
                        Write-Host "  Copied: $($file.Name)"
                    } catch {
                        Write-Host "  Error copying $($file.Name): $($_.Exception.Message)"
                    }
                }
            }
        } else {
            Write-Host "  No image files found in $leagueFolder"
        }
        
        Write-Host "  Completed processing $leagueFolder"
    } else {
        Write-Host "Source folder not found: $leagueFolder"
    }
}

Write-Host "`nFinal summary of all sport folders:"
$allSportFolders = @(
    'Tennis', 'Golf', 'Politics', 'AussieRules', 'Waterpolo', 
    'Motorsport', 'Darts', 'Lacrosse', 'TableTennis', 'Rugby', 
    'Football', 'Fighting', 'Cricket', 'Volleyball', 'Handball', 
    'Futures', 'Hockey', 'Baseball'
)

foreach ($folder in $allSportFolders) {
    $folderPath = Join-Path $logosPath $folder
    if (Test-Path $folderPath) {
        $fileCount = (Get-ChildItem -Path $folderPath -File).Count
        Write-Host "  $folder`: $fileCount files"
    } else {
        Write-Host "  $folder`: folder not found"
    }
}

Write-Host "`nRemaining league folders (team sports and uncategorized):"
$excludeFolders = $allSportFolders + @('Countries', 'leagueLogos', 'logo1024.png', 'overtime-logo-dark.svg', 'overtime-logo.png', 'ufc-logo.png')
$remainingFolders = Get-ChildItem -Path $logosPath -Directory | Where-Object { $_.Name -notin $excludeFolders }
foreach ($folder in $remainingFolders) {
    $fileCount = (Get-ChildItem -Path $folder.FullName -File).Count
    Write-Host "  $($folder.Name): $fileCount files"
}

Write-Host "`nSports organization complete!"
