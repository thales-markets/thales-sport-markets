#!/usr/bin/env pwsh

Write-Host "Moving team sports to individual sport folders..."

$logosPath = "c:\Projects\thales\thales-sport-markets\public\logos"

# Define sport mappings
$sportMappings = @{
    'Football' = @('NFL', 'NCAA', 'CFL', 'UFL')
    'Baseball' = @('MLB')  
    'Hockey' = @('NHL')
    'AussieRules' = @('AFL')
}

# Function to move files to individual sport folder
function Move-ToIndividualSportFolder {
    param(
        [string]$SportFolder,
        [string[]]$LeagueFolders
    )
    
    $sportPath = Join-Path $logosPath $SportFolder
    
    # Create sport folder if it doesn't exist
    if (-not (Test-Path $sportPath)) {
        New-Item -ItemType Directory -Path $sportPath -Force | Out-Null
        Write-Host "Created folder: $SportFolder"
    }
    
    $totalMoved = 0
    
    foreach ($leagueFolder in $LeagueFolders) {
        $sourcePath = Join-Path $logosPath $leagueFolder
        
        if (Test-Path $sourcePath) {
            $files = Get-ChildItem $sourcePath -File
            Write-Host "`nMoving $($files.Count) files from $leagueFolder to $SportFolder..."
            
            foreach ($file in $files) {
                $destPath = Join-Path $sportPath $file.Name
                Move-Item $file.FullName $destPath -Force
                $totalMoved++
            }
            
            # Remove empty league folder
            Remove-Item $sourcePath -Force
            Write-Host "Removed empty folder: $leagueFolder"
        } else {
            Write-Host "Source folder not found: $leagueFolder"
        }
    }
    
    Write-Host "Total files moved to $SportFolder: $totalMoved"
}

# Move each sport
foreach ($sportName in $sportMappings.Keys) {
    Write-Host "`n=== Processing $sportName ==="
    Move-ToIndividualSportFolder -SportFolder $sportName -LeagueFolders $sportMappings[$sportName]
}

Write-Host "`n=== FINAL SUMMARY ==="
foreach ($sportName in $sportMappings.Keys) {
    $sportPath = Join-Path $logosPath $sportName
    if (Test-Path $sportPath) {
        $count = (Get-ChildItem $sportPath -File | Measure-Object).Count
        Write-Host "$sportName: $count individual images"
        
        # Show first few files as example
        if ($count -gt 0) {
            Write-Host "  Sample images:"
            Get-ChildItem $sportPath -File | Select-Object Name -First 3 | ForEach-Object {
                Write-Host "    $($_.Name)"
            }
        }
    }
}

Write-Host "`nTeam sports now organized as individual sports!"
Write-Host "Structure: /logos/[Sport]/[individual-name].webp"
