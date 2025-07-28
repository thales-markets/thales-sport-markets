# PowerShell script to organize Esports, Basketball, and Soccer leagues into sport folders

$logoPath = "c:\Projects\thales\thales-sport-markets\public\logos"
Set-Location $logoPath

# Basketball leagues
$basketballLeagues = @(
    "NBA", "NCAA", "WNBA", "Euroleague", "Eurocup", "FIBA Champions League"
)

# Soccer leagues  
$soccerLeagues = @(
    "EPL", "La Liga", "La Liga 2", "Serie A", "Serie B", "Bundesliga", "Bundesliga 2",
    "Ligue 1", "Ligue 2", "Primeira Liga", "Brazil-Serie-A", "Liga MX", "Eredivisie",
    "Scotland Premiership", "Austria Bundesliga", "Denmark Superliga", "Belgium Pro League",
    "Czech Republic First League", "Finland Veikkausliiga", "Norway Eliteserien",
    "Sweden Allsvenskan", "Poland Ekstraklasa", "Russia Premier League", "Turkey Super League",
    "Greece Super League", "Serbia Super Liga", "Croatia 1. HNL", "Slovakia Superliga",
    "Slovenia PrvaLiga", "Bulgaria - Parva Liga", "Romania Liga I", "Latvia Virsliga",
    "Lithuania A Lyga", "Estonia Premium Liiga", "Ireland Premier League", "Canada Premier League",
    "Ecuador Serie A", "Chile Primera Division", "Colombia Primera A", "Argentina Primera Division",
    "Uruguay Primera Division", "Peru Primera Division", "Thailand League 1", "Australia A-League",
    "Australia A-League Women", "Japan J1 League", "China Super League", "Korea K1 League",
    "Saudi Professional League", "India Super League", "France Premiere Ligue Women",
    "Germany Frauen Bundesliga", "Spain Liga F Women", "Italy Serie A Femminile",
    "England Women's Super League", "Belgium Women's Super League", "Netherlands Eredivisie Women"
)

# Esports leagues
$esportsLeagues = @(
    "CS2", "DOTA 2", "LOL", "Valorant", "Call of Duty", "Overwatch", "Rainbow Six Siege", 
    "Rocket League", "Mobile Legends", "Starcraft", "Starcraft 2"
)

Write-Host "Moving Basketball leagues..." -ForegroundColor Green
foreach ($league in $basketballLeagues) {
    if (Test-Path $league) {
        $fileCount = (Get-ChildItem "$league" -File).Count
        Write-Host "Moving $league ($fileCount files) to Basketball folder..."
        Move-Item "$league\*" "Basketball\" -Force
        Remove-Item $league -Recurse -Force
    }
}

Write-Host "Moving Soccer leagues..." -ForegroundColor Green
foreach ($league in $soccerLeagues) {
    if (Test-Path $league) {
        $fileCount = (Get-ChildItem "$league" -File).Count
        Write-Host "Moving $league ($fileCount files) to Soccer folder..."
        Move-Item "$league\*" "Soccer\" -Force
        Remove-Item $league -Recurse -Force
    }
}

Write-Host "Moving Esports leagues..." -ForegroundColor Green
foreach ($league in $esportsLeagues) {
    if (Test-Path $league) {
        $fileCount = (Get-ChildItem "$league" -File).Count
        Write-Host "Moving $league ($fileCount files) to Esports folder..."
        Move-Item "$league\*" "Esports\" -Force
        Remove-Item $league -Recurse -Force
    }
}

# Count final results
$basketballCount = (Get-ChildItem "Basketball" -File).Count
$soccerCount = (Get-ChildItem "Soccer" -File).Count
$esportsCount = (Get-ChildItem "Esports" -File).Count

Write-Host "`nFinal counts:" -ForegroundColor Yellow
Write-Host "Basketball: $basketballCount files" -ForegroundColor Cyan
Write-Host "Soccer: $soccerCount files" -ForegroundColor Cyan
Write-Host "Esports: $esportsCount files" -ForegroundColor Cyan
