import { SportMarketInfo } from 'types/markets';

export const truncateAddress = (address: string, first = 5, last = 5) =>
    address ? `${address.slice(0, first)}...${address.slice(-last, address.length)}` : null;

export const truncateText = (text: string, maxLength: number) =>
    text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

export const fixDuplicatedTeamName = (name: string) => {
    const middle = Math.floor(name.length / 2);
    const firstHalf = name.substring(0, middle).trim();
    const secondHalf = name.substring(middle, name.length).trim();

    if (firstHalf === secondHalf) {
        return firstHalf;
    }

    const splittedName = name.split(' ');
    const uniqueWordsInName = new Set(splittedName);
    if (uniqueWordsInName.size !== splittedName.length) {
        return Array.from(uniqueWordsInName).join(' ');
    }

    return name;
};

export const fixLongTeamName = (market: SportMarketInfo) => {
    market.homeTeam.toLowerCase() == 'wolverhampton' ? (market.homeTeam = 'Wolves') : '';
    market.awayTeam.toLowerCase() == 'wolverhampton' ? (market.awayTeam = 'Wolves') : '';
    market.homeTeam.toLowerCase() == 'miami (fl) hurricanes' ? (market.homeTeam = 'Miami Hurricanes') : '';
    market.awayTeam.toLowerCase() == 'miami (fl) hurricanes' ? (market.awayTeam = 'Miami Hurricanes') : '';
    market.homeTeam.toLowerCase() == 'borussia monchengladbach' ? (market.homeTeam = "Borussia M'gladbach") : '';
    market.awayTeam.toLowerCase() == 'borussia monchengladbach' ? (market.awayTeam = "Borussia M'gladbach") : '';
    return market;
};

//TODO : MAP ALL TEAM NAMES MANUALLY - WORK IN PROGRESS
export const mapTeamNamesMobile = (teamName: string) => {
    switch (teamName.toLowerCase()) {
        case 'bayer leverkusen':
            return 'B04';
        case 'bayern munich':
            return 'FCB';
        case 'borussia dortmund':
            return 'BVB';
        case "Borussia M'gladbach":
            return 'BMG';
        case 'fc cologne':
            return 'KOE';
        case 'vfl bochum':
            return 'BOC';
        case 'fc augsburg':
            return 'FCA';
        case 'tsg hoffenheim':
            return 'TSG';
        case 'rb leipzig':
            return 'RBL';
        case 'hertha berlin':
            return 'BSC';
        case 'vfb stuttgart':
            return 'VFB';
        case 'mainz':
            return 'M05';
        case 'vfl wolfsburg':
            return 'WOB';
        case 'werder bremen':
            return 'SVW';
        case 'schalke 04':
            return 'S04';
        case 'fc union berlin':
            return 'FCU';
        case 'sc freiburg':
            return 'SCF';
        case 'eintracht frankfurt':
            return 'SGE';
        case 'manchester city':
            return 'MCI';
        case 'fulham':
            return 'FUL';
        case 'wolves':
            return 'WOL';
        case 'brighton & hove albion':
            return 'BHA';
        case 'nottingham forest':
            return 'NFO';
        case 'brentford fc':
            return 'BRE';
        case 'leeds united':
            return 'LEE';
        case 'bournemouth':
            return 'BOU';
        case 'everton':
            return 'EVE';
        case 'leicester city':
            return 'LEI';
        case 'chelsea':
            return 'CHE';
        case 'arsenal fc':
            return 'ARS';
        case 'aston villa':
            return 'AVL';
        case 'manchester united':
            return 'MUN';
        case 'west ham united':
            return 'WHU';
        case 'crystal palace':
            return 'CRY';
        case 'southampton':
            return 'SOU';
        case 'newcastle united':
            return 'NEW';
        case 'tottenham hotspur':
            return 'TOT';
        case 'liverpool':
            return 'LIV';
        case 'real madrid':
            return 'RMA';
        case 'rayo vallecano':
            return 'RAY';
        case 'sevilla':
            return 'SEV';
        case 'real betis':
            return 'BET';
        case 'mallorca':
            return 'MLL';
        case 'villarreal':
            return 'VIL';
        case 'valencia':
            return 'VAL';
        case 'osasuna':
            return 'OSA';
        case 'real sociedad':
            return 'RSO';
        case 'espanyol':
            return 'ESP';
        case 'atletico madrid':
            return 'ATM';
        case 'almería':
            return 'ALM';
        case 'barcelona':
            return 'BAR';
        case 'celta vigo':
            return 'CEL';
        case 'elche':
            return 'ELC';
        case 'real valladolid':
            return 'VLL';
        case 'cádiz':
            return 'CAD';
        case 'getafe':
            return 'GET';
        case 'athletic bilbao':
            return 'ATH';
        case 'girona':
            return 'GIR';
        case 'aj auxerre':
            return 'AUX';
        case 'troyes':
            return 'TRO';
        case 'ac ajaccio':
            return 'ACA';
        case 'strasbourg':
            return 'STR';
        case 'angers':
            return 'ANG';
        case 'lens':
            return 'LEN';
        case 'lorient':
            return 'LOR';
        case 'paris saint-germain':
            return 'PSG';
        case 'nice':
            return 'NCE';
        case 'brest':
            return 'B29';
        case 'stade de reims':
            return 'REI';
        case 'nantes':
            return 'NAN';
        case 'clermont foot':
            return 'CLE';
        case 'montpellier':
            return 'MPL';
        case 'toulouse':
            return 'TOU';
        case 'as monaco':
            return 'AMO';
        case 'lille':
            return 'LOSC';
        case 'marseille':
            return 'OM';
        case 'lyon':
            return 'LYO';
        case 'stade rennes':
            return 'REN';
        case '':
            return '';
        case '':
            return '';
        case '':
            return '';
        case '':
            return '';
    }
};

export const fixLongTeamNameString = (team: string) => {
    team.toLowerCase() == 'wolverhampton' ? (team = 'Wolves') : '';
    team.toLowerCase() == 'borussia monchengladbach' ? (team = "Borussia M'gladbach") : '';
    return team;
};

export const fixApexName = (team: string) =>
    team !== null
        ? team
              .toLowerCase()
              .split(' ')
              .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
              .join(' ')
        : '';
