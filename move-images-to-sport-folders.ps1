#!/usr/bin/env pwsh

Write-Host "Moving images to sport folders as organized in images.ts..."

$logosPath = "c:\Projects\thales\thales-sport-markets\public\logos"

# Create sport directories if they don't exist
$sportFolders = @(
    'Tennis', 'Golf', 'Politics', 'AussieRules', 'Waterpolo', 
    'Motorsport', 'Darts', 'Lacrosse', 'TableTennis', 'Rugby', 
    'Football', 'Fighting', 'Cricket'
)

foreach ($folder in $sportFolders) {
    $targetPath = Join-Path $logosPath $folder
    if (!(Test-Path $targetPath)) {
        New-Item -ItemType Directory -Path $targetPath -Force
        Write-Host "Created folder: $folder"
    }
}

# Define mappings from league folders to sport folders
$leagueToSportMappings = @{
    # Tennis (already exists - just verify)
    'Tennis' = 'Tennis'
    
    # Golf
    'PGA' = 'Golf'
    
    # Politics 
    'Countries' = 'Politics'  # Note: This might need special handling as Countries contains many non-political items
    
    # Australian Rules Football
    'AFL' = 'AussieRules'
    
    # Water Polo - need to identify water polo leagues
    # 'FINA' = 'Waterpolo'  # Add when found
    
    # Motorsport
    'Formula 1' = 'Motorsport'
    'MotoGP' = 'Motorsport'
    
    # Darts
    'England Premier League Darts' = 'Darts'
    
    # Lacrosse
    'USA Premier Lacrosse League' = 'Lacrosse'
    
    # Table Tennis
    'WTT Men' = 'TableTennis'
    
    # Rugby
    'Super Rugby' = 'Rugby'
    
    # American Football
    'NFL' = 'Football'
    'UFL' = 'Football'
    'CFL' = 'Football'
    
    # Fighting Sports
    'UFC' = 'Fighting'
    'Boxing' = 'Fighting'
    'PFL' = 'Fighting'
    
    # Cricket
    'Indian Premier League' = 'Cricket'
    'Pakistan Super League' = 'Cricket'
    'T20 Blast' = 'Cricket'
    'England T20 Blast' = 'Cricket'
}

# Move files from league folders to sport folders
foreach ($leagueFolder in $leagueToSportMappings.Keys) {
    $sportFolder = $leagueToSportMappings[$leagueFolder]
    $sourcePath = Join-Path $logosPath $leagueFolder
    $targetPath = Join-Path $logosPath $sportFolder
    
    if (Test-Path $sourcePath) {
        Write-Host "Moving files from '$leagueFolder' to '$sportFolder'..."
        
        # Get all image files from the source folder
        $imageFiles = Get-ChildItem -Path $sourcePath -File -Include "*.webp", "*.png", "*.jpg", "*.jpeg", "*.svg" -Recurse
        
        foreach ($file in $imageFiles) {
            $targetFile = Join-Path $targetPath $file.Name
            
            # Check if file already exists in target
            if (Test-Path $targetFile) {
                Write-Host "  Warning: $($file.Name) already exists in $sportFolder, skipping..."
            } else {
                try {
                    Move-Item -Path $file.FullName -Destination $targetFile -Force
                    Write-Host "  Moved: $($file.Name)"
                } catch {
                    Write-Host "  Error moving $($file.Name): $($_.Exception.Message)"
                }
            }
        }
        
        # Remove empty source folder if it only contained images we moved
        $remainingFiles = Get-ChildItem -Path $sourcePath -Recurse
        if ($remainingFiles.Count -eq 0) {
            Remove-Item -Path $sourcePath -Recurse -Force
            Write-Host "  Removed empty folder: $leagueFolder"
        }
    } else {
        Write-Host "Source folder not found: $leagueFolder"
    }
}

Write-Host "Image organization complete!"

# Show summary of what's in each sport folder
Write-Host "`nSummary of sport folders:"
foreach ($folder in $sportFolders) {
    $folderPath = Join-Path $logosPath $folder
    if (Test-Path $folderPath) {
        $fileCount = (Get-ChildItem -Path $folderPath -File).Count
        Write-Host "  $folder`: $fileCount files"
    }
}
