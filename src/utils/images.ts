import { getLeagueInitialSport, getLeagueSport, isInternationalLeague, League, LeagueMap, Sport } from 'overtime-utils';

export const getTeamImageSource = (team: string, league: League) => {
    const leagueSport = getLeagueSport(league);
    const leagueInitialSport = getLeagueInitialSport(league);
    const sport = leagueSport === Sport.FUTURES ? leagueInitialSport : leagueSport;

    return isInternationalLeague(Number(league))
        ? `/logos/Countries/${team
              .trim()
              .replaceAll(' 7s', '')
              .replaceAll(' U21', '')
              .replaceAll(' U23', '')
              .replaceAll(' 3x3', '')
              .replaceAll(' ', '-')
              .toLowerCase()}.svg`
        : league == League.ATP_FUTURES || league == League.WTA_FUTURES
        ? `/logos/leagueLogos/us-open.webp`
        : league == League.NCAAB ||
          league == League.NCAAF ||
          league == League.NCAAW ||
          league == League.COLLEGE_BASEBALL
        ? `/logos/NCAA/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : `/logos/${sport}/${team.trim().replaceAll(' ', '-').replaceAll('/', '-').toLowerCase()}.webp`;
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
        case League.ENGLAND_COMMUNITY_SHIELD:
        case League.ENGLAND_LEAGUE_2:
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
        case League.GERMANY_BUNDESLIGA_3:
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
        case League.ITALY_SERIE_C:
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
        case League.NETHERLANDS_SUPER_CUP:
        case League.NETHERLANDS_EERSTE_DIVISIE:
            return `/logos/Countries/netherlands.svg`;
        case League.PRIMEIRA_LIGA:
        case League.PORTUGAL_LEAGUE_CUP:
        case League.PORTUGAL_CUP:
        case League.PORTUGAL_SUPER_CUP:
        case League.PORTUGAL_SEGUNDA_LIGA:
        case League.PORTUGAL_LIGA_3:
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
        case League.SCOTLAND_CHAMPIONSHIP:
            return `/logos/Countries/scotland.svg`;
        case League.BELGIUM_LEAGUE:
        case League.BELGIUM_SUPER_LEAGUE_WOMEN:
        case League.BELGIUM_LIGA_HEREN:
        case League.BELGIUM_LIGA_DAMES:
        case League.BELGIUM_CHALLENGER_PRO_LEAGUE:
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
        case League.ARGENTINA_COPA_ARGENTINA:
            return `/logos/Countries/argentina.svg`;
        case League.RUSSIA_PREMIER:
        case League.RUSSIA_KHL:
        case League.RUSSIA_SUPER_LEAGUE:
        case League.RUSSIA_SUPERLIGA:
        case League.RUSSIA_SUPERLIGA_WOMEN:
        case League.RUSSIA_CUP:
        case League.RUSSIA_FIRST_LEAGUE:
            return `/logos/Countries/russia.svg`;
        case League.TURKEY_SUPER_LEAGUE:
        case League.TURKEY_BSL:
        case League.TURKEY_1_LIG:
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
        case League.CHINA_CBA:
        case League.CHINA_CVL:
        case League.CHINA_CVL_WOMEN:
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
        case League.SWITZERLAND_CHALLENGE_LEAGUE:
            return `/logos/Countries/switzerland.svg`;
        case League.AUSTRIA_BUNDESLIGA:
        case League.AUSTRIA_ICE_HOCKEY_LEAGUE:
        case League.AUSTRIA_AVL:
        case League.AUSTRIA_WVL:
        case League.AUSTRIA_2_LIGA:
            return `/logos/Countries/austria.svg`;
        case League.DENMARK_SUPER_LEAGUE:
        case League.DENMARK_VOLLEYLIGAEN:
        case League.DENMARK_VOLLEYLIGAEN_WOMEN:
        case League.DENMARK_1ST_DIVISION:
            return `/logos/Countries/denmark.svg`;
        case League.POLAND_LEAGUE:
        case League.POLAND_SUPERLIGA:
        case League.POLAND_TT_ELITE_SERIES_MEN:
        case League.POLAND_PLUSLIGA:
            return `/logos/Countries/poland.svg`;
        case League.SWEDEN_LEAGUE:
        case League.SWEDEN_SHL:
        case League.SWEDEN_HANDBOLLSLIGAN:
        case League.SWEDEN_SUPERETTAN:
            return `/logos/Countries/sweden.svg`;
        case League.COLOMBIA_PRIMERA_A:
            return `/logos/Countries/colombia.svg`;
        case League.URUGUAY_PRIMERA_DIVISION:
            return `/logos/Countries/uruguay.svg`;
        case League.THAILAND_LEAGUE_1:
            return `/logos/Countries/thailand.svg`;
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
        case League.NORWAY_1_DIVISJON:
            return `/logos/Countries/norway.svg`;
        case League.ICELAND_URVALSDEILD:
        case League.ICELAND_BESTA_DEILD_KARLA:
            return `/logos/Countries/iceland.svg`;
        case League.CZECH_REPUBLIC_TT_CUP_MEN:
        case League.CZECH_REPUBLIC_TT_LIGA_PRO_MEN:
        case League.CZECH_REPUBLIC_VEL:
        case League.CZECH_REPUBLIC_VEL_WOMEN:
            return `/logos/Countries/czech-republic.svg`;
        case League.PHILIPPINES_PVL_WOMEN:
        case League.PBA_PHILIPPINE_CUP:
            return `/logos/Countries/philippines.svg`;
        case League.IRAN_SUPER_LEAGUE:
            return `/logos/Countries/iran.svg`;
        case League.PERU_PRIMERA_DIVISION:
            return `/logos/Countries/peru.svg`;
        case League.ECUADOR_SERIE_A:
            return `/logos/Countries/ecuador.svg`;
        case League.BULGARIA_PARVA_LIGA:
            return `/logos/Countries/bulgaria.svg`;
        case League.IRELAND_PREMIER_LEAGUE:
        case League.IRELAND_DIVISION_1:
            return `/logos/Countries/ireland.svg`;
        case League.LATVIA_VIRSLIGA:
            return `/logos/Countries/latvia.svg`;
        case League.LITHUANIA_A_LYGA:
            return `/logos/Countries/lithuania.svg`;
        case League.ROMANIA_LIGA_I:
        case League.ROMANIA_LIGA_II:
            return `/logos/Countries/romania.svg`;
        case League.WALES_CYMRU_PREMIER:
            return `/logos/Countries/wales.svg`;
        case League.NORTHERN_IRELAND_PREMIERSHIP:
            return `/logos/Countries/northern-ireland.svg`;
        case League.SOUTH_AFRICA_PREMIER_LEAGUE:
            return `/logos/Countries/south-africa.svg`;
        case League.INDONESIA_LIGA_1:
            return `/logos/Countries/indonesia.svg`;
        case League.QATAR_STARS_LEAGUE:
            return `/logos/Countries/qatar.svg`;
        case League.GEORGIA_EROVNULI_LIGA:
            return `/logos/Countries/georgia.svg`;
        case League.MALAYSIA_SUPER_LEAGUE:
            return `/logos/Countries/malaysia.svg`;
        case League.VIETNAM_V_LEAGUE_1:
            return `/logos/Countries/vietnam.svg`;
        case League.EGYPT_PREMIER_LEAGUE:
            return `/logos/Countries/egypt.svg`;
        case League.UZBEKISTAN_SUPER_LEAGUE:
            return `/logos/Countries/uzbekistan.svg`;
        case League.BELARUS_PREMIER_LEAGUE:
            return `/logos/Countries/belarus.svg`;
        case League.UKRAINE_PREMIER_LEAGUE:
            return `/logos/Countries/ukraine.svg`;
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
        case League.COPA_LIBERTADORES:
            return '/logos/Countries/south-america.webp';
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
            return `/logos/leagueLogos/paris2024.webp`;
        case League.EUROLEAGUE:
        case League.EUROLEAGUE_FUTURES:
            return `/logos/leagueLogos/euroleague.webp`;
        case League.AFC_CHAMPIONS_LEAGUE:
            return `/logos/leagueLogos/afc-champions-league.webp`;
        case League.ATP_FUTURES:
        case League.TENNIS_MASTERS:
            return `/logos/leagueLogos/atp.webp`;
        case League.WTA_FUTURES:
        case League.TENNIS_WTA:
            return `/logos/leagueLogos/wta.webp`;
        case League.FIBA_EUROBASKET_QUALIFIERS:
        case League.FIBA_EUROBASKET:
        case League.FIBA_EUROBASKET_FUTURES:
            return `/logos/leagueLogos/eurobasket.webp`;
        case League.FIBA_AMERICUP_QUALIFIERS:
        case League.FIBA_AMERICUP_WOMEN:
            return `/logos/leagueLogos/americup.webp`;
        case League.FIBA_ASIA_CUP_QUALIFIERS:
            return `/logos/leagueLogos/asia-cup.webp`;
        case League.FIBA_WORLD_CUP_QUALIFIERS:
        case League.FIBA_WORLD_CUP_U19:
            return `/logos/leagueLogos/fiba-world-cup.webp`;
        case League.FIBA_AFRO_BASKET_QUALIFIERS:
        case League.FIBA_AFROBASKET:
            return `/logos/leagueLogos/afrobasket.webp`;
        case League.SIX_NATIONS:
            return `/logos/leagueLogos/six-nations.webp`;
        case League.SUPER_RUGBY:
            return `/logos/leagueLogos/super-rugby.webp`;
        case League.DOTA2:
            return `/logos/leagueLogos/dota2.webp`;
        case League.CSGO:
            return `/logos/leagueLogos/cs2.webp`;
        case League.LOL:
            return `/logos/leagueLogos/lol.webp`;
        case League.VALORANT:
            return `/logos/leagueLogos/valorant.webp`;
        case League.STARCRAFT:
        case League.STARCRAFT_2:
            return `/logos/leagueLogos/starcraft.webp`;
        case League.ROCKET_LEAGUE:
            return `/logos/leagueLogos/rocket-league.webp`;
        case League.CALL_OF_DUTY:
            return `/logos/leagueLogos/call-of-duty.webp`;
        case League.OVERWATCH:
            return `/logos/leagueLogos/overwatch.webp`;
        case League.RAINBOW_SIX_SIEGE:
            return `/logos/leagueLogos/rainbow-six-siege.webp`;
        case League.MOBILE_LEGENDS:
            return `/logos/leagueLogos/mobile-legends.webp`;
        case League.FORMULA1_FUTURES:
            return `/logos/leagueLogos/f1.webp`;
        case League.PGA_FUTURES:
            return `/logos/leagueLogos/pga.webp`;
        case League.TENNIS_ATP_CHALLENGER:
            return `/logos/leagueLogos/atp-challenger.webp`;
        case League.IIHF_WORLD_CHAMPIONSHIP:
            return `/logos/leagueLogos/iihf.webp`;
        case League.FIFA_CLUB_WORLD_CUP:
        case League.FIFA_CLUB_WORLD_CUP_FUTURES:
            return `/logos/leagueLogos/fifa-club-world-cup.webp`;
        case League.FIVB_NATIONS_LEAGUE:
        case League.FIVB_NATIONS_LEAGUE_WOMEN:
            return `/logos/leagueLogos/volleyball-nations-league.webp`;
        case League.CONCACAF_GOLD_CUP:
            return `/logos/leagueLogos/concacaf-gold-cup.webp`;
        case League.COSAFA_CUP:
            return `/logos/leagueLogos/cosafa-cup.webp`;
        case League.UFC:
            return `/logos/leagueLogos/ufc.webp`;
        case League.PFL:
            return `/logos/leagueLogos/pfl.webp`;
        case League.UEFA_EUROPEAN_CHAMPIONSHIP_U21:
            return `/logos/leagueLogos/uefa-under21-championship.webp`;
        case League.PDC_WORLD_CUP_OF_DARTS:
            return `/logos/leagueLogos/pdc.webp`;
        case League.BIG3:
            return `/logos/leagueLogos/big3.webp`;
        case League.FIBA_EUROBASKET_WOMEN:
            return `/logos/leagueLogos/fiba-womens-eurobasket.webp`;
        default:
            return `/logos/Countries/world.svg`;
    }
};
