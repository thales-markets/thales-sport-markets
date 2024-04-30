import PositionSymbol from 'components/PositionSymbol';
import SPAAnchor from 'components/SPAAnchor';
import SimpleLoader from 'components/SimpleLoader';
import { USD_SIGN } from 'constants/currency';
import { PARLAY_LEADERBOARD_WEEKLY_START_DATE } from 'constants/markets';
import { SIDEBAR_NUMBER_OF_TOP_USERS } from 'constants/quiz';
import ROUTES from 'constants/routes';
import { BetTypeNameMap } from 'constants/tags';
import { differenceInDays } from 'date-fns';
import { BetType, OddsType } from 'enums/markets';
import {
    getOpacity,
    getParlayItemStatus,
    getPositionStatus,
    getPositionStatusForCombinedMarket,
    getRewardsArray,
    getRewardsCurrency,
} from 'pages/ParlayLeaderboard/ParlayLeaderboard';
import { getOpacityForCombinedMarket } from 'pages/Profile/components/TransactionsHistory/components/ParlayTransactions/ParlayTransactions';
import { useParlayLeaderboardQuery } from 'queries/markets/useParlayLeaderboardQuery';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getOddsType } from 'redux/modules/ui';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { useTheme } from 'styled-components';
import { formatCurrency, formatCurrencyWithSign, truncateAddress } from 'thales-utils';
import { CombinedMarket, ParlayMarket, ParlayMarketWithQuotes, PositionData } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import {
    extractCombinedMarketsFromParlayMarketType,
    getCombinedPositionName,
    removeCombinedMarketsFromParlayMarketType,
} from 'utils/combinedMarkets';
import { fixOneSideMarketCompetitorName } from 'utils/formatters/string';
import {
    convertPositionNameToPositionType,
    fixPlayerPropsLinesFromContract,
    formatMarketOdds,
    getCombinedOddTooltipText,
    getOddTooltipText,
    getSpreadAndTotalTextForCombinedMarket,
    getSpreadTotalText,
    getSymbolText,
    isOneSidePlayerProps,
    isSpecialYesNoProp,
    syncPositionsAndMarketsPerContractOrderInParlay,
} from 'utils/markets';
import { buildHref } from 'utils/routes';
import {
    ArrowIcon,
    ColumnLabel,
    ColumnWrapper,
    Container,
    DataLabel,
    ExpandedRow,
    HeaderRow,
    LeaderboardContainer,
    LeaderboardRow,
    LeaderboardWrapper,
    LoaderContainer,
    NoResultContainer,
    ParlayRow,
    ParlayRowMatch,
    ParlayRowResult,
    ParlayRowTeam,
    Rank,
    Title,
    TitleLabel,
} from './styled-components';

const SidebarLeaderboard: React.FC = () => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const selectedOddsType = useSelector(getOddsType);

    const [expandedRowIndex, setExpandedRowIndex] = useState(-1);

    const latestPeriodWeekly = Math.trunc(differenceInDays(new Date(), PARLAY_LEADERBOARD_WEEKLY_START_DATE) / 7);

    const query = useParlayLeaderboardQuery(networkId, latestPeriodWeekly, { enabled: isAppReady });

    const parlaysData = useMemo(() => {
        return query.isSuccess ? query.data.slice(0, SIDEBAR_NUMBER_OF_TOP_USERS) : [];
    }, [query.isSuccess, query.data]);

    const rewards = getRewardsArray(networkId, latestPeriodWeekly);
    const rewardsCurrency = getRewardsCurrency(networkId);

    const exchangeRatesQuery = useExchangeRatesQuery(networkId, {
        enabled: isAppReady,
    });
    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    const rewardCurrencyRate = exchangeRates && exchangeRates !== null ? exchangeRates[rewardsCurrency] : 0;

    return (
        <LeaderboardWrapper>
            <Container>
                <SPAAnchor href={buildHref(ROUTES.Leaderboard)}>
                    <Title>
                        <TitleLabel>{t('parlay-leaderboard.sidebar.title-parlay')}</TitleLabel>
                        <TitleLabel isBold={true}>{t('parlay-leaderboard.sidebar.title-leaderboard')}</TitleLabel>
                    </Title>
                </SPAAnchor>
                <LeaderboardContainer>
                    <HeaderRow>
                        <ColumnWrapper padding={'0 0 0 20px'}>
                            <ColumnLabel>{t('parlay-leaderboard.sidebar.wallet')}</ColumnLabel>
                        </ColumnWrapper>
                        <ColumnWrapper>
                            <ColumnLabel>{t('parlay-leaderboard.sidebar.points')}</ColumnLabel>
                        </ColumnWrapper>
                        <ColumnWrapper>
                            <ColumnLabel>{t('parlay-leaderboard.sidebar.reward')}</ColumnLabel>
                        </ColumnWrapper>
                    </HeaderRow>
                    {query.isLoading ? (
                        <LoaderContainer>
                            <SimpleLoader />
                        </LoaderContainer>
                    ) : parlaysData.length === 0 ? (
                        <NoResultContainer>{t('parlay-leaderboard.no-parlays')}</NoResultContainer>
                    ) : (
                        parlaysData.map((parlay, index) => {
                            const parlayData = syncPositionsAndMarketsPerContractOrderInParlay(parlay as ParlayMarket);

                            const combinedMarkets = extractCombinedMarketsFromParlayMarketType(parlayData);
                            const parlayWithoutCombinedMarkets = removeCombinedMarketsFromParlayMarketType(parlayData);

                            return (
                                <React.Fragment key={index}>
                                    <LeaderboardRow
                                        className={index == 0 ? 'first' : ''}
                                        onClick={() => setExpandedRowIndex(expandedRowIndex !== index ? index : -1)}
                                    >
                                        <ColumnWrapper>
                                            <Rank>{parlay.rank}</Rank>
                                            <DataLabel title={parlay.account} style={{ width: 55 }}>
                                                {truncateAddress(parlay.account, 3, 3)}
                                            </DataLabel>
                                        </ColumnWrapper>
                                        <ColumnWrapper>
                                            <DataLabel>{formatCurrency(parlay.points)}</DataLabel>
                                        </ColumnWrapper>
                                        <ColumnWrapper>
                                            <DataLabel>
                                                {`${
                                                    rewards[parlay.rank - 1]
                                                } ${rewardsCurrency} (${formatCurrencyWithSign(
                                                    USD_SIGN,
                                                    (rewards[parlay.rank - 1] || 0) * rewardCurrencyRate,
                                                    0
                                                )})`}
                                            </DataLabel>
                                        </ColumnWrapper>
                                        <ArrowIcon
                                            className={
                                                expandedRowIndex === index
                                                    ? 'icon icon--arrow-up'
                                                    : 'icon icon--arrow-down'
                                            }
                                        />
                                    </LeaderboardRow>
                                    {expandedRowIndex === index &&
                                        getExpandedRowComponent(
                                            parlayWithoutCombinedMarkets,
                                            theme,
                                            selectedOddsType,
                                            combinedMarkets
                                        )}
                                </React.Fragment>
                            );
                        })
                    )}
                </LeaderboardContainer>
            </Container>
        </LeaderboardWrapper>
    );
};

const getExpandedRowComponent = (
    parlayData: ParlayMarketWithQuotes,
    theme: any,
    selectedOddsType: OddsType,
    combinedMarketsData?: CombinedMarket[]
) => {
    return (
        <ExpandedRow>
            {parlayData.sportMarketsFromContract.map((market, marketIndex) => {
                const position = parlayData.positions.find(
                    (position: PositionData) => position.market.address == market
                );

                position ? fixPlayerPropsLinesFromContract(position.market) : '';

                const positionEnum = convertPositionNameToPositionType(position ? position.side : '');

                const symbolText = position ? getSymbolText(positionEnum, position.market) : '';
                const spreadTotalText = position ? getSpreadTotalText(position.market, positionEnum) : '';

                return (
                    position && (
                        <ParlayRow style={{ opacity: getOpacity(position) }} key={'ExpandedRow' + marketIndex}>
                            <ParlayRowMatch>
                                {getPositionStatus(position, theme)}
                                <ParlayRowTeam
                                    title={
                                        position.market.isOneSideMarket
                                            ? fixOneSideMarketCompetitorName(position.market.homeTeam)
                                            : position.market.playerName === null
                                            ? position.market.homeTeam + ' vs ' + position.market.awayTeam
                                            : `${position.market.playerName} (${
                                                  BetTypeNameMap[position.market.betType as BetType]
                                              }) `
                                    }
                                >
                                    {position.market.isOneSideMarket
                                        ? fixOneSideMarketCompetitorName(position.market.homeTeam)
                                        : position.market.playerName === null
                                        ? position.market.homeTeam + ' vs ' + position.market.awayTeam
                                        : `${position.market.playerName} (${
                                              BetTypeNameMap[position.market.betType as BetType]
                                          }) `}
                                </ParlayRowTeam>
                            </ParlayRowMatch>
                            <PositionSymbol
                                symbolAdditionalText={{
                                    text: formatMarketOdds(
                                        selectedOddsType,
                                        parlayData.marketQuotes ? parlayData.marketQuotes[marketIndex] : 0
                                    ),
                                    textStyle: {
                                        fontSize: '10.5px',
                                        marginLeft: '5px',
                                    },
                                }}
                                additionalStyle={{
                                    width: 23,
                                    height: 23,
                                    fontSize: 10.5,
                                    borderWidth: 2,
                                }}
                                symbolText={symbolText}
                                symbolUpperText={
                                    spreadTotalText &&
                                    !isOneSidePlayerProps(position.market.betType) &&
                                    !isSpecialYesNoProp(position.market.betType)
                                        ? {
                                              text: spreadTotalText,
                                              textStyle: {
                                                  backgroundColor: theme.oddsGradiendBackground.tertiary,
                                                  fontSize: '10px',
                                                  top: '-9px',
                                                  left: '10px',
                                              },
                                          }
                                        : undefined
                                }
                                tooltip={<>{getOddTooltipText(positionEnum, position.market)}</>}
                            />
                            <ParlayRowResult>{getParlayItemStatus(position.market)}</ParlayRowResult>
                        </ParlayRow>
                    )
                );
            })}
            {combinedMarketsData &&
                combinedMarketsData?.length > 0 &&
                combinedMarketsData?.map((combinedMarket, index) => {
                    const opacity = getOpacityForCombinedMarket(combinedMarket);

                    const odd = formatMarketOdds(
                        selectedOddsType,
                        combinedMarket.totalOdd ? combinedMarket.totalOdd : 1
                    );
                    const symbolText = getCombinedPositionName(combinedMarket.markets, combinedMarket.positions);

                    const homeTeam = combinedMarket.markets[0].homeTeam;
                    const awayTeam = combinedMarket.markets[1].awayTeam;

                    const tooltipText = getCombinedOddTooltipText(combinedMarket.markets, combinedMarket.positions);
                    const positionStatus = getPositionStatusForCombinedMarket(combinedMarket, theme);

                    const spreadAndTotalValues = getSpreadAndTotalTextForCombinedMarket(
                        combinedMarket.markets,
                        combinedMarket.positions
                    );
                    const spreadAndTotalText = `${
                        spreadAndTotalValues.spread ? spreadAndTotalValues.spread + '/' : ''
                    }${spreadAndTotalValues.total ? spreadAndTotalValues.total : ''}`;

                    return (
                        <ParlayRow style={{ opacity: opacity }} key={'ExpandedRow-combined' + index}>
                            <ParlayRowMatch>
                                {positionStatus}
                                <ParlayRowTeam title={homeTeam + ' vs ' + awayTeam}>
                                    {homeTeam + ' vs ' + awayTeam}
                                </ParlayRowTeam>
                            </ParlayRowMatch>
                            <PositionSymbol
                                symbolAdditionalText={{
                                    text: odd,
                                    textStyle: {
                                        fontSize: '10.5px',
                                        marginLeft: '5px',
                                    },
                                }}
                                additionalStyle={{
                                    width: 23,
                                    height: 23,
                                    fontSize: 10.5,
                                    borderWidth: 2,
                                }}
                                symbolText={symbolText ? symbolText : ''}
                                symbolUpperText={
                                    spreadAndTotalText
                                        ? {
                                              text: spreadAndTotalText,
                                              textStyle: {
                                                  backgroundColor: theme.oddsGradiendBackground.tertiary,
                                                  fontSize: '10px',
                                                  top: '-9px',
                                                  left: '10px',
                                              },
                                          }
                                        : undefined
                                }
                                tooltip={<>{tooltipText}</>}
                            />
                            <ParlayRowResult>{getParlayItemStatus(combinedMarket.markets[0])}</ParlayRowResult>
                        </ParlayRow>
                    );
                })}
        </ExpandedRow>
    );
};

export default React.memo(SidebarLeaderboard);
