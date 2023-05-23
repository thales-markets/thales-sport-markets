import {
    CombinedMarket,
    CombinedMarketContractData,
    CombinedMarketsContractData,
    CombinedMarketsPositionName,
    CombinedParlayMarket,
    ParlayMarketWithQuotes,
    ParlaysMarket,
    ParlaysMarketPosition,
    PositionData,
    SGPContractData,
    SGPItem,
    SportMarketInfo,
} from 'types/markets';
import { POSITION_TO_ODDS_OBJECT_PROPERTY_NAME, Position } from 'constants/options';
import { BetType, MARKETS_COMBINATION, SPORTS_TAGS_MAP } from 'constants/tags';
import { isEqual } from 'lodash';
import {
    convertFinalResultToResultType,
    convertPositionNameToPositionType,
    isParentMarketSameForSportMarkets,
} from './markets';
import {
    COMBINED_MARKETS_CONTRACT_DATA_TO_POSITIONS,
    ContractSGPOrder,
    SGPCombinationsFromContractOrderMapping,
} from 'constants/markets';
import { bigNumberFormatter, bigNumberFormmaterWithDecimals } from './formatters/ethers';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import localStore from './localStore';

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

export const isMarketCombinationInSGP = (markets: SportMarketInfo[]): SGPItem | undefined => {
    const COMBINED_MARKETS_SGP = localStore.get(LOCAL_STORAGE_KEYS.SGP_FEES) as SGPItem[];

    if (!COMBINED_MARKETS_SGP) return undefined;

    const sgpItem = COMBINED_MARKETS_SGP.find((sgpItem) => {
        if (sgpItem.tags.every((value, index) => value == markets[0].tags[index])) {
            if (sgpItem.combination.includes(markets[0].betType) && sgpItem.combination.includes(markets[1].betType))
                return sgpItem;
        }
    });

    if (sgpItem) return sgpItem;
    return;
};

export const calculateCombinedMarketOdds = (markets: SportMarketInfo[], positions: Position[]) => {
    const firstPositionOdds = markets[0][POSITION_TO_ODDS_OBJECT_PROPERTY_NAME[positions[0]]];
    const secondPositionOdds = markets[1][POSITION_TO_ODDS_OBJECT_PROPERTY_NAME[positions[1]]];

    if (!firstPositionOdds || !secondPositionOdds) return 0;

    const sgpItem = isMarketCombinationInSGP(markets);

    if (sgpItem) {
        return (firstPositionOdds * secondPositionOdds) / sgpItem.SGPFee;
    }

    return firstPositionOdds * secondPositionOdds;
};

export const calculateCombinedMarketOddBasedOnHistoryOdds = (odds: number[], markets: SportMarketInfo[]) => {
    const firstPositionOdd = odds[0];
    const secondPositionOdd = odds[1];

    if (!firstPositionOdd || !secondPositionOdd) return 0;

    const sgpItem = isMarketCombinationInSGP(markets);

    if (sgpItem) {
        return (firstPositionOdd * secondPositionOdd) / sgpItem.SGPFee;
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

export const isTwoSportMarketsFromSameParent = (
    firstMarket: SportMarketInfo,
    secondMarket: SportMarketInfo
): boolean => {
    if (firstMarket.gameId && secondMarket.gameId) return firstMarket.gameId == secondMarket.gameId;
    if (!firstMarket.parentMarket && secondMarket.parentMarket)
        return firstMarket.address.toLowerCase() == secondMarket.parentMarket.toLowerCase();
    if (firstMarket.parentMarket && !secondMarket.parentMarket)
        return secondMarket.address.toLowerCase() == firstMarket.parentMarket.toLowerCase();
    if (firstMarket.parentMarket && secondMarket.parentMarket)
        return firstMarket.parentMarket.toLowerCase() == secondMarket.parentMarket.toLowerCase();
    return false;
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
            if (isTwoSportMarketsFromSameParent(parlayMarkets[i], parlayMarkets[j])) {
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

export const isSGPInParlayMarkets = (parlayMarkets: ParlaysMarket[]): boolean => {
    const combinedMarkets = extractCombinedMarketsFromParlayMarkets(parlayMarkets);

    if (combinedMarkets.length) return true;
    return false;
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
                        [sportMarkets[i], sportMarkets[j]]
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
    if (!combinedMarkets.length) return parlayMarkets;

    const parlaysMarkets: ParlaysMarket[] = [];

    parlayMarkets.forEach((parlayMarket) => {
        let inCombinedMarket = false;
        combinedMarkets.forEach((combinedMarket) => {
            const insideCombinedMarket = combinedMarket.markets.find(
                (_market) => parlayMarket.address == _market.address
            );
            if (insideCombinedMarket) inCombinedMarket = true;
        });

        if (!inCombinedMarket) parlaysMarkets.push(parlayMarket);
    });

    return parlaysMarkets;
};

export const isCombinedMarketWinner = (markets: SportMarketInfo[], positions: Position[]) => {
    const canceledMarkets = markets.filter((market) => market.isCanceled);

    if (canceledMarkets.length == 1) {
        let winner = true;
        const canceledMarketIndex = markets.findIndex((market) => market.isCanceled);
        markets.forEach((_market, index) => {
            if (index !== canceledMarketIndex) {
                if (
                    markets[index].isResolved &&
                    convertFinalResultToResultType(markets[index].finalResult) == positions[index]
                ) {
                    return;
                } else {
                    winner = false;
                }
            }
        });

        return winner;
    }

    if (canceledMarkets.length > 1) return true;

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

export const processCombinedOddsFromContract = (
    data: CombinedMarketContractData,
    market: SportMarketInfo
): CombinedMarket[] | false => {
    const nonZeroOdds = data.combinedOdds.map((item) => (item.odds.find((odd) => odd > 0) ? true : false));

    if (!nonZeroOdds.find((item) => item == true)) return false;

    const finalData: CombinedMarket[] = [];

    data.combinedOdds.forEach((item) => {
        const firstMarketBetType = Number(item.tags[0]);
        const secondMarketBetType = Number(item.tags[1]);

        if (!firstMarketBetType && !secondMarketBetType) return;
        const firstMarket =
            market.betType == firstMarketBetType && market.isOpen && !market.isPaused
                ? market
                : market.childMarkets.find((market) => market.betType == firstMarketBetType && market.isOpen);
        const secondMarket = market.childMarkets.find(
            (market) => market.betType == secondMarketBetType && market.isOpen && !market.isPaused
        );

        if (!firstMarket || !secondMarket) return;

        item.odds.forEach((odd, index) => {
            const oddFormatted = bigNumberFormatter(odd);
            if (oddFormatted) {
                if (COMBINED_MARKETS_CONTRACT_DATA_TO_POSITIONS[index]) {
                    finalData.push({
                        markets: [firstMarket, secondMarket],
                        positions: COMBINED_MARKETS_CONTRACT_DATA_TO_POSITIONS[index],
                        totalBonus: 0,
                        totalOdd: oddFormatted,
                        positionName: getCombinedPositionName(
                            [firstMarket, secondMarket],
                            COMBINED_MARKETS_CONTRACT_DATA_TO_POSITIONS[index]
                        ),
                    });
                }
            }
        });
    });

    return finalData;
};

export const insertCombinedMarketsIntoArrayOFMarkets = (
    sportMarkets: SportMarketInfo[],
    combinedMarketsContractData: CombinedMarketsContractData
) => {
    combinedMarketsContractData.forEach((data) => {
        const marketIndex = sportMarkets.findIndex(
            (market) => market.address.toLowerCase() == data.mainMarket.toLowerCase()
        );
        const market = sportMarkets[marketIndex];
        if (marketIndex !== -1) {
            const combinedMarkets = processCombinedOddsFromContract(data, market);
            if (combinedMarkets) sportMarkets[marketIndex].combinedMarketsData = combinedMarkets;
        }
    });
    return sportMarkets;
};

export const convertSGPContractDataToSGPItemType = (sgpContractData: SGPContractData): SGPItem[] => {
    const finalSGPItems: SGPItem[] = [];

    sgpContractData.forEach((item) => {
        const sgpFees = [item[1], item[2], item[3]];
        sgpFees.forEach((sgpContractItem, sgpIndex) => {
            if (bigNumberFormmaterWithDecimals(sgpContractItem.toString()) !== 0) {
                const marketTypeCombination = SGPCombinationsFromContractOrderMapping[sgpIndex as ContractSGPOrder];
                finalSGPItems.push({
                    tags: [Number(item[0])],
                    combination: marketTypeCombination,
                    SGPFee: bigNumberFormmaterWithDecimals(sgpContractItem.toString()),
                });
            }
        });
    });

    return finalSGPItems;
};
