import { getLeagueLabel, isInternationalLeague, League, LeagueMap } from 'overtime-utils';
import { fixOneSideMarketCompetitorName } from './formatters/string';

export const getTeamImageSource = (team: string, league: League) => {
    const leagueLabel = getLeagueLabel(league);
    return league == League.TENNIS_WTA ||
        league == League.TENNIS_GS ||
        league == League.TENNIS_MASTERS ||
        league == League.SUMMER_OLYMPICS_TENNIS ||
        league == League.TENNIS_ATP_CHALLENGER
        ? `/logos/Tennis/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : league == League.FORMULA1 || league == League.MOTOGP
        ? `/logos/${leagueLabel}/${fixOneSideMarketCompetitorName(team).replaceAll(' ', '-').toLowerCase()}.webp`
        : league == League.GOLF_H2H
        ? `/logos/PGA/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : league == League.GOLF_WINNER
        ? `/logos/PGA/${fixOneSideMarketCompetitorName(team).replaceAll(' ', '-').toLowerCase()}.webp`
        : league == League.BRAZIL_1
        ? `/logos/Brazil-Serie-A/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : isInternationalLeague(Number(league))
        ? `/logos/Countries/${team
              .trim()
              .replaceAll(' 7s', '')
              .replaceAll(' U21', '')
              .replaceAll(' U23', '')
              .replaceAll(' 3x3', '')
              .replaceAll(' ', '-')
              .toLowerCase()}.svg`
        : league == League.ENGLAND_FA_CUP
        ? `/logos/EPL/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : league == League.FRANCE_CUP || league == League.FRANCE_SUPER_CUP
        ? `/logos/Ligue 1/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : league == League.SPAIN_CUP || league == League.SPAIN_SUPER_CUP
        ? `/logos/La Liga/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : league == League.ITALY_CUP || league == League.ITALY_SUPER_CUP
        ? `/logos/Serie A/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : league == League.GERMANY_CUP || league == League.GERMANY_SUPER_CUP
        ? `/logos/Bundesliga/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : league == League.PORTUGAL_LEAGUE_CUP || league == League.PORTUGAL_CUP
        ? `/logos/Primeira Liga/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : league == League.BRAZIL_CUP
        ? `/logos/Brazil-Serie-A/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : league == League.NBA_SUMMER_LEAGUE
        ? `/logos/NBA/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : league == League.US_ELECTION
        ? `/logos/Countries/united-states-of-america.svg`
        : league == League.NFL_FUTURES
        ? `/logos/NFL/nfl.webp`
        : league == League.NBA_FUTURES
        ? `/logos/NBA/nba.webp`
        : league == League.EPL_FUTURES
        ? `/logos/EPL/epl.webp`
        : league == League.ATP_FUTURES || league == League.WTA_FUTURES
        ? `/logos/Countries/wimbledon.webp`
        : league == League.NETHERLANDS_CUP
        ? `/logos/Eredivisie/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : league == League.NCAAB ||
          league == League.NCAAB_FUTURES ||
          league == League.NCAAF ||
          league == League.NCAAW ||
          league == League.COLLEGE_BASEBALL
        ? `/logos/NCAA/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : league == League.PGA_FUTURES
        ? `/logos/leagueLogos/pga.webp`
        : league == League.FIFA_CLUB_WORLD_CUP_FUTURES
        ? `/logos/Countries/fifa-club-world-cup.webp`
        : `/logos/${leagueLabel}/${team.trim().replaceAll(' ', '-').replaceAll('/', '-').toLowerCase()}.webp`;
};

const OVERTIME_LOGO = '/logos/overtime-logo.png';
const OVERTIME_LOGO_DARK = '/logos/overtime-logo-dark.svg';
const PROFILE_SILHOUETTE = '/profile-silhouette.svg';

export const getOnImageError = (setSrc: (src: string) => void, league: League, isDark = false) => () => {
    setSrc(LeagueMap[league]?.logo || (isDark ? OVERTIME_LOGO_DARK : OVERTIME_LOGO));
};

export const getOnPlayerImageError = (setSrc: (src: string) => void) => () => {
    setSrc(PROFILE_SILHOUETTE);
};

export const getErrorImage = (league: League) => {
    return LeagueMap[league]?.logo || OVERTIME_LOGO;
};

export const getLeagueLogoClass = (league: League) => {
    return LeagueMap[league]?.logoClass || 'icon-homepage league--overtime';
};

export const getLeagueFlagSource = (tagId: number | any, country?: string) => {
    if (country) {
        return `/logos/Countries/${country.trim().replaceAll(' ', '-').toLowerCase()}.svg`;
    }
    switch (tagId) {
        case League.NCAAF:
        case League.NFL:
        case League.MLB:
        case League.NBA:
        case League.NBA_SUMMER_LEAGUE:
        case League.NCAAB:
        case League.NHL:
        case League.WNBA:
        case League.MLS:
        case League.US_ELECTION:
        case League.NFL_FUTURES:
        case League.NBA_FUTURES:
        case League.NHL_FUTURES:
        case League.USA_NWSL:
        case League.NCAAB_FUTURES:
        case League.NCAAW:
        case League.COLLEGE_BASEBALL:
        case League.USA_AHL:
        case League.USA_MAJOR_LEAGUE_CRICKET:
        case League.MLB_FUTURES:
        case League.USA_OPEN_CUP:
        case League.USA_MLB_ALL_STAR:
        case League.USA_NATIONAL_LACROSSE_LEAGUE:
        case League.USA_PREMIER_LACROSSE_LEAGUE:
        case League.UFL:
        case League.USA_USL_CHAMPIONSHIP:
            return `/logos/Countries/united-states-of-america.svg`;
        case League.EPL:
        case League.ENGLAND_CHAMPIONSHIP:
        case League.ENGLAND_EFL_CUP:
        case League.ENGLAND_LEGAUE_1:
        case League.EPL_FUTURES:
        case League.ENGLAND_FA_CUP:
        case League.ENGLAND_SUPER_LEAGUE_WOMEN:
        case League.ENGLAND_SUPER_LEAGUE:
        case League.ENGLAND_PREMIER_LEAGUE_DARTS:
            return `/logos/Countries/england.svg`;
        case League.ESTONIA_PREMIUM_LIIGA:
            return `/logos/Countries/estonia.svg`;
        case League.LIGUE_ONE:
        case League.LIGUE_2:
        case League.FRANCE_LNB_PRO_A:
        case League.LIGUE_ONE_FUTURES:
        case League.FRANCE_SUPER_CUP:
        case League.FRANCE_CUP:
        case League.FRANCE_PREMIERE_LIGUE_WOMEN:
        case League.FRANCE_LNH_DIVISION_1:
        case League.FRANCE_CUP:
        case League.FRANCE_LIGUE_A:
        case League.FRANCE_LIGUE_A_WOMEN:
            return `/logos/Countries/france.svg`;
        case League.BUNDESLIGA:
        case League.BUNDESLIGA_2:
        case League.GERMANY_BBL:
        case League.BUNDESLIGA_FUTURES:
        case League.GERMANY_SUPER_CUP:
        case League.GERMANY_BUNDESLIGA_WOMEN:
        case League.GERMANY_DEL:
        case League.GERMANY_HBL:
        case League.GERMANY_CUP:
        case League.GERMANY_1ST_BUNDESLIGA:
        case League.GERMANY_1ST_BUNDESLIGA_WOMEN:
            return `/logos/Countries/germany.svg`;
        case League.LA_LIGA:
        case League.LA_LIGA_2:
        case League.SPAIN_LIGA_ACB:
        case League.LA_LIGA_FUTURES:
        case League.SPAIN_SUPER_CUP:
        case League.SPAIN_LIGA_F_WOMEN:
        case League.SPAIN_ASOBAL:
        case League.SPAIN_CUP:
            return `/logos/Countries/spain.svg`;
        case League.SERIE_A:
        case League.SERIE_B:
        case League.ITALY_LEGA_BASKET_SERIE_A:
        case League.SERIE_A_FUTURES:
        case League.ITALY_SUPER_CUP:
        case League.ITALY_SERIE_A_WOMEN:
        case League.ITALY_CUP:
        case League.ITALY_COPPA_ITALIA_A1_WOMEN:
        case League.ITALY_COPPA_ITALIA_SUPERLEGA:
        case League.ITALY_SERIE_A1_WOMEN:
        case League.ITALY_SUPERLEGA:
            return `/logos/Countries/italy.svg`;
        case League.J1_LEAGUE:
        case League.NPB:
        case League.JAPAN_SV_LEAGUE:
        case League.JAPAN_SV_LEAGUE_WOMEN:
            return `/logos/Countries/japan.svg`;
        case League.IPL:
            return `/logos/Countries/india.svg`;
        case League.EREDIVISIE:
        case League.NETHERLANDS_CUP:
        case League.NETHERLANDS_EREDIVISIE_WOMEN:
            return `/logos/Countries/netherlands.svg`;
        case League.PRIMEIRA_LIGA:
        case League.PORTUGAL_LEAGUE_CUP:
        case League.PORTUGAL_CUP:
            return `/logos/Countries/portugal.svg`;
        case League.T20_BLAST:
            return `/logos/Countries/united-kingdom.svg`;
        case League.SAUDI_PROFESSIONAL_LEAGUE:
            return `/logos/Countries/saudi-arabia.svg`;
        case League.BRAZIL_1:
        case League.BRAZIL_CUP:
        case League.BRAZIL_SUPERLIGA:
        case League.BRAZIL_SUPERLIGA_WOMEN:
        case League.BRAZIL_SERIE_B:
            return `/logos/Countries/brazil.svg`;
        case League.LIGA_MX:
            return `/logos/Countries/mexico.svg`;
        case League.SCOTLAND_PREMIERSHIP:
            return `/logos/Countries/scotland.svg`;
        case League.BELGIUM_LEAGUE:
        case League.BELGIUM_SUPER_LEAGUE_WOMEN:
        case League.BELGIUM_LIGA_HEREN:
        case League.BELGIUM_LIGA_DAMES:
            return `/logos/Countries/belgium.svg`;
        case League.CZECH_LEAGUE:
        case League.CZECH_REPUBLIC_FIRST_LEAGUE:
        case League.CZECH_REPUBLIC_EXTRALIGA:
            return `/logos/Countries/czech-republic.svg`;
        case League.CHILE_PRIMERA_DIVISION:
            return `/logos/Countries/chile.svg`;
        case League.FINLAND_VEIKKAUSLIIGA:
        case League.FINLAND_SM_LIIGA:
        case League.FINLAND_MESTARUUSLIIGA:
        case League.FINLAND_MESTARUUSLIIGA_WOMEN:
            return `/logos/Countries/finland.svg`;
        case League.ARGENTINA_PRIMERA:
        case League.ARGENTINA_LIGA_ARGENTINA:
        case League.ARGENTINA_LIGA_ARGENTINA_WOMEN:
            return `/logos/Countries/argentina.svg`;
        case League.RUSSIA_PREMIER:
        case League.RUSSIA_KHL:
        case League.RUSSIA_SUPER_LEAGUE:
        case League.RUSSIA_SUPERLIGA:
        case League.RUSSIA_SUPERLIGA_WOMEN:
        case League.RUSSIA_CUP:
            return `/logos/Countries/russia.svg`;
        case League.TURKEY_SUPER_LEAGUE:
        case League.TURKEY_BSL:
            return `/logos/Countries/turkey.svg`;
        case League.SERBIA_SUPER_LEAGUE:
        case League.SERBIA_SUPERLIGA:
            return `/logos/Countries/serbia.svg`;
        case League.GREECE_SUPER_LEAGUE:
        case League.GREECE_A1_LEAGUE:
            return `/logos/Countries/greece.svg`;
        case League.INDIA_PREMIER:
        case League.INDIA_SUPER_LEAGUE:
            return `/logos/Countries/india.svg`;
        case League.CHINA_SUPER_LEAGUE:
        case League.CHINA_FA_CUP:
            return `/logos/Countries/china.svg`;
        case League.AUSTRALIA_A_LEAGUE:
        case League.AUSTRALIA_NBL:
        case League.AUSTRALIA_A_LEAGUE_WOMEN:
        case League.AUSTRALIA_NRL:
        case League.AUSTRALIA_BIG_BASH_LEAGUE:
        case League.AUSTRALIA_BIG_BASH_LEAGUE_WOMEN:
        case League.AFL:
        case League.AUSTRALIA_CUP:
            return `/logos/Countries/australia.svg`;
        case League.SWITZERLAND_SUPER_LEAGUE:
        case League.SWITZETLAND_NATIONAL_LEAGUE:
            return `/logos/Countries/switzerland.svg`;
        case League.AUSTRIA_BUNDESLIGA:
        case League.AUSTRIA_ICE_HOCKEY_LEAGUE:
        case League.AUSTRIA_AVL:
        case League.AUSTRIA_WVL:
            return `/logos/Countries/austria.svg`;
        case League.DENMARK_SUPER_LEAGUE:
        case League.DENMARK_VOLLEYLIGAEN:
        case League.DENMARK_VOLLEYLIGAEN_WOMEN:
            return `/logos/Countries/denmark.svg`;
        case League.POLAND_LEAGUE:
        case League.POLAND_SUPERLIGA:
        case League.POLAND_TT_ELITE_SERIES_MEN:
        case League.POLAND_PLUSLIGA:
            return `/logos/Countries/poland.svg`;
        case League.SWEDEN_LEAGUE:
        case League.SWEDEN_SHL:
        case League.SWEDEN_HANDBOLLSLIGAN:
            return `/logos/Countries/sweden.svg`;
        case League.COLOMBIA_PRIMERA_A:
            return `/logos/Countries/colombia.svg`;
        case League.URUGUAY_PRIMERA_DIVISION:
            return `/logos/Countries/uruguay.svg`;
        case League.UEFA_CL:
        case League.UEFA_EL:
        case League.UEFA_EURO:
        case League.UEFA_EURO_U21:
        case League.UEFA_NATIONS_LEAGUE:
        case League.UEFA_CONFERENCE_LEAGUE:
        case League.UEFA_CHAMPIONS_LEAGUE_QUALIFICATION:
        case League.UEFA_EUROPA_LEAGUE_QUALIFICATION:
        case League.UEFA_CONFERENCE_LEAGUE_QUALIFICATION:
        case League.UEFA_SUPER_CUP:
        case League.UEFA_CHAMPIONS_LEAGUE_FUTURES:
        case League.UEFA_CHAMPIONS_LEAGUE_WOMEN:
        case League.FIBA_CHAMPIONS_LEAGUE:
        case League.EUROCUP:
        case League.EHF_CHAMPIONS_LEAGUE:
        case League.EHF_CHAMPIONS_LEAGUE_WOMEN:
        case League.EHF_EUROPEAN_LEAGUE:
        case League.CEV_CHAMPIONS_LEAGUE:
        case League.CEV_CHAMPIONS_LEAGUE_WOMEN:
        case League.CEV_CUP:
        case League.CEV_CUP_WOMEN:
        case League.UEFA_EUROPEAN_CHAMPIONSHIP_WOMEN:
            return `/logos/Countries/europe.svg`;
        case League.EUROLEAGUE:
        case League.EUROLEAGUE_FUTURES:
            return `/logos/leagueLogos/euroleague.webp`;
        case League.SUMMER_OLYMPICS_BASKETBALL:
        case League.SUMMER_OLYMPICS_BASKETBALL_WOMEN:
        case League.SUMMER_OLYMPICS_BASKETBALL_3X3:
        case League.SUMMER_OLYMPICS_BASKETBALL_3X3_WOMEN:
        case League.SUMMER_OLYMPICS_SOCCER:
        case League.SUMMER_OLYMPICS_SOCCER_WOMEN:
        case League.SUMMER_OLYMPICS_RUGBY:
        case League.SUMMER_OLYMPICS_RUGBY_WOMEN:
        case League.SUMMER_OLYMPICS_VOLLEYBALL:
        case League.SUMMER_OLYMPICS_VOLLEYBALL_WOMEN:
        case League.SUMMER_OLYMPICS_HANDBALL:
        case League.SUMMER_OLYMPICS_HANDBALL_WOMEN:
        case League.SUMMER_OLYMPICS_WATERPOLO:
        case League.SUMMER_OLYMPICS_BEACH_VOLLEYBALL:
        case League.SUMMER_OLYMPICS_BEACH_VOLLEYBALL_WOMEN:
        case League.SUMMER_OLYMPICS_HOCKEY:
        case League.SUMMER_OLYMPICS_HOCKEY_WOMEN:
        case League.SUMMER_OLYMPICS_TENNIS:
        case League.SUMMER_OLYMPICS_TABLE_TENNIS:
            return `/logos/Countries/paris2024.png`;
        case League.COPA_LIBERTADORES:
            return '/logos/Countries/south-america.webp';
        case League.CHINA_CBA:
        case League.CHINA_CVL:
        case League.CHINA_CVL_WOMEN:
            return `/logos/Countries/china.svg`;
        case League.AFC_CHAMPIONS_LEAGUE:
            return `/logos/Countries/afc-champions-league.webp`;
        case League.THAILAND_LEAGUE_1:
            return `/logos/Countries/thailand.svg`;
        case League.ATP_FUTURES:
            return `/logos/Countries/atp.png`;
        case League.WTA_FUTURES:
            return `/logos/Countries/wta.png`;
        case League.FIBA_EUROBASKET_QUALIFIERS:
            return `/logos/Countries/eurobasket.png`;
        case League.FIBA_AMERICUP_QUALIFIERS:
        case League.FIBA_AMERICUP_WOMEN:
            return `/logos/Countries/americup.png`;
        case League.FIBA_ASIA_CUP_QUALIFIERS:
            return `/logos/Countries/asia-cup.png`;
        case League.FIBA_WORLD_CUP_QUALIFIERS:
        case League.FIBA_WORLD_CUP_U19:
            return `/logos/Countries/fiba-world-cup.png`;
        case League.FIBA_AFRO_BASKET_QUALIFIERS:
            return `/logos/Countries/afrobasket.jpg`;
        case League.CPBL:
            return `/logos/Countries/taiwan.svg`;
        case League.KBO:
        case League.SOUTH_KOREA_V_LEAGUE:
        case League.SOUTH_KOREA_V_LEAGUE_WOMEN:
        case League.KOREA_K1_LEAGUE:
            return `/logos/Countries/south-korea.svg`;
        case League.KAZAKHSTAN_PREMIER_LEAGUE:
            return `/logos/Countries/kazakhstan.svg`;
        case League.CANADA_PREMIER_LEAGUE:
        case League.CFL:
            return `/logos/Countries/canada.svg`;
        case League.COSTA_RICA_PRIMERA_DIVISION:
            return `/logos/Countries/costa-rica.svg`;
        case League.SIX_NATIONS:
            return `/logos/Countries/six-nations.png`;
        case League.SUPER_RUGBY:
            return `/logos/Countries/super-rugby.png`;
        case League.DOTA2:
            return `/logos/Countries/dota2.png`;
        case League.CSGO:
            return `/logos/Countries/cs2.webp`;
        case League.LOL:
            return `/logos/Countries/lol.png`;
        case League.VALORANT:
            return `/logos/Countries/valorant.png`;
        case League.STARCRAFT:
            return `/logos/Countries/starcraft.png`;
        case League.STARCRAFT_2:
            return `/logos/Countries/starcraft.png`;
        case League.ROCKET_LEAGUE:
            return `/logos/Countries/rocket-league.png`;
        case League.CALL_OF_DUTY:
            return `/logos/Countries/call-of-duty.png`;
        case League.OVERWATCH:
            return `/logos/Countries/overwatch.webp`;
        case League.RAINBOW_SIX_SIEGE:
            return `/logos/Countries/rainbow-six-siege.png`;
        case League.MOBILE_LEGENDS:
            return `/logos/Countries/mobile-legends.png`;
        case League.FORMULA1_FUTURES:
            return `/logos/leagueLogos/f1.webp`;
        case League.PGA_FUTURES:
            return `/logos/leagueLogos/pga.webp`;
        case League.PAKISTAN_SUPER_LEAGUE:
            return `/logos/Countries/pakistan.svg`;
        case League.NORTH_MACEDONIA_SUPER_LIGA:
            return `/logos/Countries/north-macedonia.svg`;
        case League.CROATIA_HB_PREMIJER_LIGA:
        case League.CROATIA_1_HNL:
            return `/logos/Countries/croatia.svg`;
        case League.SLOVAKIA_HB_EXTRALIGA:
        case League.SLOVAKIA_SUPERLIGA:
            return `/logos/Countries/slovakia.svg`;
        case League.SLOVENIA_1_LIGA:
        case League.SLOVENIA_PRVALIGA:
            return `/logos/Countries/slovenia.svg`;
        case League.HUNGARY_HNB_I:
        case League.HUNGARY_NB_I:
            return `/logos/Countries/hungary.svg`;
        case League.NORWAY_HB_1_DIVISJON:
        case League.NORWAY_ELITESERIEN:
        case League.NORWAY_NVBF:
            return `/logos/Countries/norway.svg`;
        case League.ICELAND_URVALSDEILD:
        case League.ICELAND_BESTA_DEILD_KARLA:
            return `/logos/Countries/iceland.svg`;
        case League.CZECH_REPUBLIC_TT_CUP_MEN:
        case League.CZECH_REPUBLIC_TT_LIGA_PRO_MEN:
        case League.CZECH_REPUBLIC_VEL:
        case League.CZECH_REPUBLIC_VEL_WOMEN:
            return `/logos/Countries/czech-republic.svg`;
        case League.TENNIS_MASTERS:
            return `/logos/Countries/atp.png`;
        case League.TENNIS_WTA:
            return `/logos/Countries/wta.png`;
        case League.TENNIS_ATP_CHALLENGER:
            return `/logos/Countries/atp-challenger.jpg`;
        case League.IIHF_WORLD_CHAMPIONSHIP:
            return `/logos/Countries/iihf.png`;
        case League.FIFA_CLUB_WORLD_CUP:
        case League.FIFA_CLUB_WORLD_CUP_FUTURES:
            return `/logos/Countries/fifa-club-world-cup.webp`;
        case League.PHILIPPINES_PVL_WOMEN:
        case League.PBA_PHILIPPINE_CUP:
            return `/logos/Countries/philippines.svg`;
        case League.IRAN_SUPER_LEAGUE:
            return `/logos/Countries/iran.svg`;
        case League.FIVB_NATIONS_LEAGUE:
        case League.FIVB_NATIONS_LEAGUE_WOMEN:
            return `/logos/Countries/volleyball-nations-league.webp`;
        case League.PERU_PRIMERA_DIVISION:
            return `/logos/Countries/peru.svg`;
        case League.ECUADOR_SERIE_A:
            return `/logos/Countries/ecuador.svg`;
        case League.CONCACAF_GOLD_CUP:
            return `/logos/Countries/concacaf-gold-cup.webp`;
        case League.COSAFA_CUP:
            return `/logos/Countries/cosafa-cup.webp`;
        case League.UFC:
            return `/logos/Countries/ufc.webp`;
        case League.PFL:
            return `/logos/Countries/pfl.webp`;
        case League.UEFA_EUROPEAN_CHAMPIONSHIP_U21:
            return `/logos/Countries/uefa-under21-championship.webp`;
        case League.PDC_WORLD_CUP_OF_DARTS:
            return `/logos/Countries/pdc.webp`;
        case League.BIG3:
            return `/logos/Countries/big3.webp`;
        case League.FIBA_EUROBASKET_WOMEN:
            return `/logos/Countries/fiba-womens-eurobasket.webp`;
        case League.BULGARIA_PARVA_LIGA:
            return `/logos/Countries/bulgaria.svg`;
        case League.IRELAND_PREMIER_LEAGUE:
            return `/logos/Countries/ireland.svg`;
        case League.LATVIA_VIRSLIGA:
            return `/logos/Countries/latvia.svg`;
        case League.LITHUANIA_A_LYGA:
            return `/logos/Countries/lithuania.svg`;
        case League.ROMANIA_LIGA_I:
            return `/logos/Countries/romania.svg`;
        default:
            return `/logos/Countries/world.svg`;
    }
};
