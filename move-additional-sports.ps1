#!/usr/bin/env pwsh

Write-Host "Moving additional sports images to sport folders..."

$logosPath = "c:\Projects\thales\thales-sport-markets\public\logos"

# Create additional sport directories if they don't exist
$additionalSportFolders = @(
    'Volleyball', 'Handball', 'Futures', 'Hockey', 'Baseball'
)

foreach ($folder in $additionalSportFolders) {
    $targetPath = Join-Path $logosPath $folder
    if (!(Test-Path $targetPath)) {
        New-Item -ItemType Directory -Path $targetPath -Force
        Write-Host "Created folder: $folder"
    }
}

# Define mappings from league folders to additional sport folders
$additionalLeagueToSportMappings = @{
    # Volleyball
    'Poland Superliga' = 'Volleyball'
    'Brazil Superliga' = 'Volleyball'
    'Brazil Superliga Women' = 'Volleyball'
    'France Ligue A' = 'Volleyball'
    'France Ligue A Women' = 'Volleyball'
    'Poland Plusliga' = 'Volleyball'
    'Italy Superlega' = 'Volleyball'
    'Italy Serie A1 Women' = 'Volleyball'
    'Denmark Volleyligaen' = 'Volleyball'
    'Denmark Volleyligaen Women' = 'Volleyball'
    'Russia Superliga' = 'Volleyball'
    'Russia Superliga Women' = 'Volleyball'
    'Czech Republic VEL' = 'Volleyball'
    'Czech Republic VEL Women' = 'Volleyball'
    'China CVL' = 'Volleyball'
    'China CVL Women' = 'Volleyball'
    'South Korea V League' = 'Volleyball'
    'South Korea V League Women' = 'Volleyball'
    'Japan SV League' = 'Volleyball'
    'Japan SV League Women' = 'Volleyball'
    'Philippines PVL Women' = 'Volleyball'
    'Austria AVL' = 'Volleyball'
    'Austria WVL' = 'Volleyball'
    'Finland Mestaruusliiga' = 'Volleyball'
    'Finland Mestaruusliiga Women' = 'Volleyball'
    'Norway NVBF' = 'Volleyball'
    
    # Handball
    'EHF Champions League' = 'Handball'
    'EHF Champions League Women' = 'Handball'
    'EHF European League' = 'Handball'
    'France LNH Division 1' = 'Handball'
    'Germany HBL' = 'Handball'
    'Germany 1st Bundesliga' = 'Handball'
    'Germany 1st Bundesliga Women' = 'Handball'
    'Spain ASOBAL' = 'Handball'
    'Sweden Handbollsligan' = 'Handball'
    'Norway HB 1 Divisjon' = 'Handball'
    'Croatia HB Premijer Liga' = 'Handball'
    'Slovakia HB Extraliga' = 'Handball'
    'Hungary HNB I' = 'Handball'
    'Belgium Liga Heren' = 'Handball'
    'Belgium Liga Dames' = 'Handball'
    
    # Hockey (Ice Hockey)
    'NHL' = 'Hockey'
    'Russia KHL' = 'Hockey'
    'Sweden SHL' = 'Hockey'
    'Finland SM Liiga' = 'Hockey'
    'Germany DEL' = 'Hockey'
    'Austria Ice Hockey League' = 'Hockey'
    'Czech Republic Extraliga' = 'Hockey'
    'Switzerland National League' = 'Hockey'
    'USA AHL' = 'Hockey'
    
    # Baseball
    'MLB' = 'Baseball'
    'NPB' = 'Baseball'
    'KBO' = 'Baseball'
    'CPBL' = 'Baseball'
    'NCAA' = 'Baseball'  # College Baseball is part of NCAA
    
    # Futures - collect various futures leagues
    # Note: Futures might need special handling as it's a meta-category
}

# Move files from league folders to additional sport folders
foreach ($leagueFolder in $additionalLeagueToSportMappings.Keys) {
    $sportFolder = $additionalLeagueToSportMappings[$leagueFolder]
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
                    Copy-Item -Path $file.FullName -Destination $targetFile -Force
                    Write-Host "  Copied: $($file.Name)"
                } catch {
                    Write-Host "  Error copying $($file.Name): $($_.Exception.Message)"
                }
            }
        }
        
        Write-Host "  Completed moving from $leagueFolder"
    } else {
        Write-Host "Source folder not found: $leagueFolder"
    }
}

Write-Host "Additional sports image organization complete!"

# Show summary of what's in each additional sport folder
Write-Host "`nSummary of additional sport folders:"
foreach ($folder in $additionalSportFolders) {
    $folderPath = Join-Path $logosPath $folder
    if (Test-Path $folderPath) {
        $fileCount = (Get-ChildItem -Path $folderPath -File).Count
        Write-Host "  $folder`: $fileCount files"
    }
}
