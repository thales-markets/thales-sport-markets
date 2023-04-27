import {
    CombinedMarket,
    CombinedMarketsPositionName,
    CombinedParlayMarket,
    ParlayMarketWithQuotes,
    ParlaysMarket,
    ParlaysMarketPosition,
    PositionData,
    SportMarketInfo,
} from 'types/markets';
import { POSITION_TO_ODDS_OBJECT_PROPERTY_NAME, Position } from 'constants/options';
import { BetType, COMBINED_MARKETS_SGP, MARKETS_COMBINATION, SPORTS_TAGS_MAP } from 'constants/tags';
import { isEqual } from 'lodash';
import {
    convertFinalResultToResultType,
    convertPositionNameToPositionType,
    isParentMarketSameForSportMarkets,
} from './markets';

export const isSpecificCombinedPositionAddedToParlay = (
    parlayData: ParlaysMarketPosition[],
    markets: SportMarketInfo[],
    positions: Position[]
): boolean => {
    const firstMarket = {
        parentMarketAddress: markets[0].parentMarket == null ? markets[0].address : markets[0].parentMarket,
        sportMarketAddress: markets[0].address,
        position: positions[0],
    };

    const secondMarket = {
        parentMarketAddress: markets[1].parentMarket == null ? markets[1].address : markets[1].parentMarket,
        sportMarketAddress: markets[1].address,
        position: positions[1],
    };

    let firstMarketFlag = false;
    let secondMarketFlag = false;

    parlayData.forEach((data) => {
        if (
            data.parentMarket == firstMarket.parentMarketAddress &&
            data.sportMarketAddress == firstMarket.sportMarketAddress &&
            data.position == firstMarket.position
        ) {
            firstMarketFlag = true;
        }

        if (
            data.parentMarket == secondMarket.parentMarketAddress &&
            data.sportMarketAddress == secondMarket.sportMarketAddress &&
            data.position == secondMarket.position
        ) {
            secondMarketFlag = true;
        }
    });

    if (firstMarketFlag && secondMarketFlag) return true;
    return false;
};

export const isAllowedToCombineMarketsForTagId = (tags: number[]): boolean => {
    let isAllowed = false;

    tags.forEach((tag) => {
        if (
            SPORTS_TAGS_MAP.Football.includes(Number(tag)) ||
            SPORTS_TAGS_MAP.Basketball.includes(Number(tag)) ||
            SPORTS_TAGS_MAP.Soccer.includes(Number(tag)) ||
            SPORTS_TAGS_MAP.Hockey.includes(Number(tag))
        ) {
            isAllowed = true;
        }
    });

    return isAllowed;
};

export const calculateCombinedMarketOdds = (markets: SportMarketInfo[], positions: Position[]) => {
    const firstPositionOdds = markets[0][POSITION_TO_ODDS_OBJECT_PROPERTY_NAME[positions[0]]];
    const secondPositionOdds = markets[1][POSITION_TO_ODDS_OBJECT_PROPERTY_NAME[positions[1]]];

    if (!firstPositionOdds || !secondPositionOdds) return 0;

    if (markets[0].tags.find((tag) => SPORTS_TAGS_MAP.Football.includes(Number(tag)))) {
        return (firstPositionOdds * secondPositionOdds) / COMBINED_MARKETS_SGP.Football;
    }

    if (markets[0].tags.find((tag) => SPORTS_TAGS_MAP.Soccer.includes(Number(tag)))) {
        return (firstPositionOdds * secondPositionOdds) / COMBINED_MARKETS_SGP.Soccer;
    }

    if (markets[0].tags.find((tag) => SPORTS_TAGS_MAP.Basketball.includes(Number(tag)))) {
        return (firstPositionOdds * secondPositionOdds) / COMBINED_MARKETS_SGP.Basketball;
    }

    if (markets[0].tags.find((tag) => SPORTS_TAGS_MAP.Hockey.includes(Number(tag)))) {
        return (firstPositionOdds * secondPositionOdds) / COMBINED_MARKETS_SGP.Hockey;
    }

    return firstPositionOdds * secondPositionOdds;
};

export const calculateCombinedMarketOddBasedOnHistoryOdds = (odds: number[], market: SportMarketInfo) => {
    const firstPositionOdd = odds[0];
    const secondPositionOdd = odds[1];

    if (!firstPositionOdd || !secondPositionOdd) return 0;

    if (market.tags.find((tag) => SPORTS_TAGS_MAP.Football.includes(Number(tag)))) {
        return (firstPositionOdd * firstPositionOdd) / COMBINED_MARKETS_SGP.Football;
    }

    if (market.tags.find((tag) => SPORTS_TAGS_MAP.Soccer.includes(Number(tag)))) {
        return (firstPositionOdd * secondPositionOdd) / COMBINED_MARKETS_SGP.Soccer;
    }

    if (market.tags.find((tag) => SPORTS_TAGS_MAP.Basketball.includes(Number(tag)))) {
        return (firstPositionOdd * secondPositionOdd) / COMBINED_MARKETS_SGP.Basketball;
    }

    if (market.tags.find((tag) => SPORTS_TAGS_MAP.Hockey.includes(Number(tag)))) {
        return (firstPositionOdd * secondPositionOdd) / COMBINED_MARKETS_SGP.Hockey;
    }

    return firstPositionOdd * secondPositionOdd;
};

export const getCombinedPositionName = (
    markets: SportMarketInfo[],
    positions: Position[]
): CombinedMarketsPositionName | null => {
    if (markets[0].betType == BetType.WINNER && markets[1].betType == BetType.TOTAL) {
        if (positions[0] == 0 && positions[1] == 0) return '1&O';
        if (positions[0] == 0 && positions[1] == 1) return '1&U';
        if (positions[0] == 1 && positions[1] == 0) return '2&O';
        if (positions[0] == 1 && positions[1] == 1) return '2&U';
        if (positions[0] == 2 && positions[1] == 0) return 'X&O';
        if (positions[0] == 2 && positions[1] == 1) return 'X&U';
    }

    if (markets[0].betType == BetType.SPREAD && markets[1].betType == BetType.TOTAL) {
        if (positions[0] == 0 && positions[1] == 0) return 'H1&O';
        if (positions[0] == 0 && positions[1] == 1) return 'H1&U';
        if (positions[0] == 1 && positions[1] == 0) return 'H2&O';
        if (positions[0] == 1 && positions[1] == 1) return 'H2&U';
    }
    return null;
};

export const getAllCombinationsForTwoMarkets = (markets: SportMarketInfo[]): CombinedMarket[] => {
    if (!isEqual(markets[0].tags, markets[1].tags)) return [];

    const marketsCombinations: CombinedMarket[] = [];

    [0, 1, 2].forEach((firstPosition) => {
        [0, 1, 2].forEach((secondPosition) => {
            const combinationOdds = calculateCombinedMarketOdds(markets, [firstPosition, secondPosition]);
            const positionName = getCombinedPositionName(markets, [firstPosition, secondPosition]);

            if (!combinationOdds) return;

            marketsCombinations.push({
                markets: markets,
                positions: [firstPosition, secondPosition],
                totalOdd: combinationOdds,
                totalBonus: 0,
                positionName: positionName ? positionName : '',
            });
        });
    });

    return marketsCombinations;
};

export const getAllCombinedMarketsForParentMarket = (parentMarket: SportMarketInfo) => {
    const allCombinedMarkets: CombinedMarket[] = [];

    if (!isAllowedToCombineMarketsForTagId(parentMarket.tags)) return [];

    MARKETS_COMBINATION.forEach((combination) => {
        const firstMarket =
            parentMarket.betType == combination[0]
                ? parentMarket
                : parentMarket.childMarkets.find((childMarket) => childMarket.betType == combination[0]);

        if (!firstMarket) return;

        const secondMarket = parentMarket.childMarkets.find((childMarket) => childMarket.betType == combination[1]);

        if (firstMarket && secondMarket) {
            const markets = getAllCombinationsForTwoMarkets([firstMarket, secondMarket]);
            if (markets.length) {
                allCombinedMarkets.push(...markets);
            }
        }
    });

    return allCombinedMarkets;
};

export const getCombinedMarketsFromParlayData = (parlayData: ParlaysMarketPosition[]): ParlaysMarketPosition[] => {
    const combinedMarkets = [];

    for (let i = 0; i < parlayData.length - 1; i++) {
        for (let j = i + 1; j < parlayData.length; j++) {
            if (parlayData[i].parentMarket == parlayData[j].parentMarket) {
                combinedMarkets.push(parlayData[i], parlayData[j]);
            }
        }
    }

    if (combinedMarkets.length > 0) return combinedMarkets;
    return [];
};

export const isCombinedMarketsInParlayData = (parlayData: ParlaysMarketPosition[]): boolean => {
    const markets = getCombinedMarketsFromParlayData(parlayData);

    if (markets.length > 0) return true;
    return false;
};

export const isMarketPartOfCombinedMarketFromParlayData = (
    parlayData: ParlaysMarketPosition[],
    market: SportMarketInfo
): boolean => {
    const combinedMarkets = getCombinedMarketsFromParlayData(parlayData);
    if (combinedMarkets.length > 0) {
        const sameMarkets = combinedMarkets.filter((_market) => _market.sportMarketAddress == market.address);

        if (sameMarkets.length > 0) return true;
    }

    return false;
};

export const extractCombinedMarketsFromParlayMarkets = (parlayMarkets: ParlaysMarket[]): CombinedParlayMarket[] => {
    const combinedMarkets = [];
    for (let i = 0; i < parlayMarkets.length - 1; i++) {
        for (let j = i + 1; j < parlayMarkets.length; j++) {
            if (parlayMarkets[i].gameId == parlayMarkets[j].gameId) {
                combinedMarkets.push({
                    markets: [parlayMarkets[i], parlayMarkets[j]],
                    positions: [parlayMarkets[i].position, parlayMarkets[j].position],
                    totalOdd: calculateCombinedMarketOdds(
                        [parlayMarkets[i], parlayMarkets[j]],
                        [parlayMarkets[i].position, parlayMarkets[j].position]
                    ),
                    totalBonus: 0,
                    positionName: getCombinedPositionName(
                        [parlayMarkets[i], parlayMarkets[j]],
                        [parlayMarkets[i].position, parlayMarkets[j].position]
                    ),
                });
            }
        }
    }
    return combinedMarkets;
};

export const extractCombinedMarketsFromParlayMarketType = (parlayMarket: ParlayMarketWithQuotes): CombinedMarket[] => {
    const combinedMarkets = [];
    const sportMarkets = parlayMarket.sportMarkets;
    for (let i = 0; i < sportMarkets.length - 1; i++) {
        for (let j = i + 1; j < parlayMarket.sportMarkets.length; j++) {
            if (isParentMarketSameForSportMarkets(sportMarkets[i], sportMarkets[j])) {
                const firstPositionData = parlayMarket.positions[i];
                const secondPositionData = parlayMarket.positions[j];
                const firstPositionOdd = parlayMarket.quotes[i];
                const secondPositionOdd = parlayMarket.quotes[j];

                combinedMarkets.push({
                    markets: [sportMarkets[i], sportMarkets[j]],
                    positions: [
                        convertPositionNameToPositionType(firstPositionData.side),
                        convertPositionNameToPositionType(secondPositionData.side),
                    ],
                    totalOdd: calculateCombinedMarketOddBasedOnHistoryOdds(
                        [firstPositionOdd, secondPositionOdd],
                        sportMarkets[i]
                    ),
                    totalBonus: 0,
                    positionName: getCombinedPositionName(
                        [sportMarkets[i], sportMarkets[j]],
                        [
                            convertPositionNameToPositionType(firstPositionData.side),
                            convertPositionNameToPositionType(secondPositionData.side),
                        ]
                    ),
                });
            }
        }
    }
    return combinedMarkets;
};

export const removeCombinedMarketsFromParlayMarketType = (
    parlayMarket: ParlayMarketWithQuotes
): ParlayMarketWithQuotes => {
    const combinedMarkets = extractCombinedMarketsFromParlayMarketType(parlayMarket);

    if (!combinedMarkets.length) return parlayMarket;

    const _parlay = { ...parlayMarket };

    const _quotes: number[] = [];
    const _markets: SportMarketInfo[] = [];
    const _positions: PositionData[] = [];
    const _sportMarketAddresses: string[] = [];
    const _marketQuotes: number[] = [];

    _parlay.sportMarkets.forEach((market, index) => {
        const sameMarket = combinedMarkets.find(
            (combinedMarket) =>
                combinedMarket.markets[0].address == market.address ||
                combinedMarket.markets[1].address == market.address
        );

        if (!sameMarket) {
            _quotes.push(_parlay.quotes[index]);
            _markets.push(_parlay.sportMarkets[index]);
            _positions.push(_parlay.positions[index]);
            _marketQuotes.push(_parlay.marketQuotes[index]);
            _sportMarketAddresses.push(_parlay.sportMarketsFromContract[index]);
        }
    });

    _parlay.sportMarkets = _markets;
    _parlay.sportMarketsFromContract = _sportMarketAddresses;
    _parlay.positions = _positions;
    _parlay.quotes = _quotes;
    _parlay.marketQuotes = _marketQuotes;

    return _parlay;
};

export const removeCombinedMarketFromParlayMarkets = (parlayMarkets: ParlaysMarket[]): ParlaysMarket[] => {
    const combinedMarkets = extractCombinedMarketsFromParlayMarkets(parlayMarkets);

    if (!combinedMarkets.length) return [];

    const filteredParlayMarkets = parlayMarkets.filter((market) => {
        const marketWithSameGameId = combinedMarkets.find(
            (combinedMarkets) => combinedMarkets.markets[0].gameId == market.gameId
        );
        if (!marketWithSameGameId) return market;
    });

    return filteredParlayMarkets;
};

export const isCombinedMarketWinner = (markets: SportMarketInfo[], positions: Position[]) => {
    if (
        markets[0].isResolved &&
        markets[1].isResolved &&
        convertFinalResultToResultType(markets[0].finalResult) == positions[0] &&
        convertFinalResultToResultType(markets[1].finalResult) == positions[1]
    ) {
        return true;
    }
    return false;
};
