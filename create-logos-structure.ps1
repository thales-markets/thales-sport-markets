#!/usr/bin/env pwsh

Write-Host "Creating logos folder structure..."

$logosPath = "c:\Projects\thales\thales-sport-markets\public\logos"

# Create main logos directory
if (-not (Test-Path $logosPath)) {
    New-Item -ItemType Directory -Path $logosPath -Force | Out-Null
    Write-Host "Created main logos directory: $logosPath"
} else {
    Write-Host "Logos directory already exists: $logosPath"
}

# Individual sport folders (as we planned)
$individualSports = @(
    'Tennis', 'Darts', 'Golf', 'Fighting', 'Motorsport', 
    'Lacrosse', 'Rugby', 'Cricket', 'Table Tennis',
    'Football', 'Baseball', 'Hockey', 'AussieRules'
)

# Team sport league folders (existing structure)
$teamSportLeagues = @(
    'EPL', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'Primeira Liga',
    'Brazil-Serie-A', 'Eredivisie', 'Belgium League', 'Scotland Premiership',
    'NBA', 'NFL', 'MLB', 'NHL', 'NCAA', 'AFL'
)

# Other necessary folders
$otherFolders = @(
    'Countries', 'leagueLogos'
)

Write-Host "`n=== Creating Individual Sport Folders ==="
foreach ($sport in $individualSports) {
    $sportPath = Join-Path $logosPath $sport
    if (-not (Test-Path $sportPath)) {
        New-Item -ItemType Directory -Path $sportPath -Force | Out-Null
        Write-Host "Created: $sport/"
    } else {
        Write-Host "Exists: $sport/"
    }
}

Write-Host "`n=== Creating Team Sport League Folders ==="
foreach ($league in $teamSportLeagues) {
    $leaguePath = Join-Path $logosPath $league
    if (-not (Test-Path $leaguePath)) {
        New-Item -ItemType Directory -Path $leaguePath -Force | Out-Null
        Write-Host "Created: $league/"
    } else {
        Write-Host "Exists: $league/"
    }
}

Write-Host "`n=== Creating Other Folders ==="
foreach ($folder in $otherFolders) {
    $folderPath = Join-Path $logosPath $folder
    if (-not (Test-Path $folderPath)) {
        New-Item -ItemType Directory -Path $folderPath -Force | Out-Null
        Write-Host "Created: $folder/"
    } else {
        Write-Host "Exists: $folder/"
    }
}

Write-Host "`n=== Folder Structure Created ==="
Write-Host "Individual Sports: $($individualSports.Count) folders"
Write-Host "Team Sport Leagues: $($teamSportLeagues.Count) folders" 
Write-Host "Other folders: $($otherFolders.Count) folders"
Write-Host "`nFolder structure ready for logo organization!"
Write-Host "Individual sports: /logos/[Sport]/[individual-name].webp"
Write-Host "Team sports: /logos/[League]/[team-name].webp"
