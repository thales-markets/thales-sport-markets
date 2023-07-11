import PositionSymbol from 'components/PositionSymbol';
import SimpleLoader from 'components/SimpleLoader';
import SPAAnchor from 'components/SPAAnchor';
import {
    PARLAY_LEADERBOARD_OPTIMISM_REWARDS_TOP_10,
    PARLAY_LEADERBOARD_ARBITRUM_REWARDS_TOP_10,
    PARLAY_LEADERBOARD_BIWEEKLY_START_DATE,
} from 'constants/markets';
import { SIDEBAR_NUMBER_OF_TOP_USERS } from 'constants/quiz';
import ROUTES from 'constants/routes';
import { differenceInDays } from 'date-fns';
import { getOpacity, getParlayItemStatus, getPositionStatus } from 'pages/ParlayLeaderboard/ParlayLeaderboard';
import { useParlayLeaderboardQuery } from 'queries/markets/useParlayLeaderboardQuery';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getOddsType } from 'redux/modules/ui';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { PositionData } from 'types/markets';
import { truncateAddress } from 'utils/formatters/string';
import {
    convertPositionNameToPositionType,
    formatMarketOdds,
    getOddTooltipText,
    getSpreadTotalText,
    getSymbolText,
} from 'utils/markets';
import { Network } from 'enums/network';
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
    OPLogoWrapper,
    ParlayRow,
    ParlayRowMatch,
    ParlayRowResult,
    ParlayRowTeam,
    Rank,
    ArbitrumLogoWrapper,
    Title,
    TitleLabel,
} from './styled-components';
import { ThemeInterface } from 'types/ui';
import { useTheme } from 'styled-components';

const SidebarLeaderboard: React.FC = () => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const selectedOddsType = useSelector(getOddsType);

    const [expandedRowIndex, setExpandedRowIndex] = useState(-1);

    const latestPeriodBiweekly = Math.trunc(differenceInDays(new Date(), PARLAY_LEADERBOARD_BIWEEKLY_START_DATE) / 14);
    const query = useParlayLeaderboardQuery(networkId, latestPeriodBiweekly, { enabled: isAppReady });

    const parlaysData = useMemo(() => {
        return query.isSuccess ? query.data.slice(0, SIDEBAR_NUMBER_OF_TOP_USERS) : [];
    }, [query.isSuccess, query.data]);

    const rewards =
        networkId !== Network.ArbitrumOne
            ? PARLAY_LEADERBOARD_OPTIMISM_REWARDS_TOP_10
            : PARLAY_LEADERBOARD_ARBITRUM_REWARDS_TOP_10;

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
                            <ColumnLabel style={{ paddingLeft: 5 }}>
                                {t('parlay-leaderboard.sidebar.positions')}
                            </ColumnLabel>
                        </ColumnWrapper>
                        <ColumnWrapper>
                            <ColumnLabel>{t('parlay-leaderboard.sidebar.quote')}</ColumnLabel>
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
                                            <DataLabel>{parlay.numberOfPositions}</DataLabel>
                                        </ColumnWrapper>
                                        <ColumnWrapper>
                                            <DataLabel>
                                                {formatMarketOdds(selectedOddsType, parlay.totalQuote)}
                                            </DataLabel>
                                        </ColumnWrapper>
                                        <ColumnWrapper>
                                            <DataLabel>
                                                {rewards[parlay.rank - 1]}
                                                {networkId !== Network.ArbitrumOne ? (
                                                    <OPLogoWrapper />
                                                ) : (
                                                    <ArbitrumLogoWrapper />
                                                )}
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
                                    {expandedRowIndex === index && (
                                        <ExpandedRow>
                                            {parlay.sportMarketsFromContract.map((market, marketIndex) => {
                                                const position = parlay.positions.find(
                                                    (position: PositionData) => position.market.address == market
                                                );

                                                const positionEnum = convertPositionNameToPositionType(
                                                    position ? position.side : ''
                                                );

                                                const symbolText = position
                                                    ? getSymbolText(positionEnum, position.market)
                                                    : '';
                                                const spreadTotalText = position
                                                    ? getSpreadTotalText(position.market, positionEnum)
                                                    : '';

                                                return (
                                                    position && (
                                                        <ParlayRow
                                                            style={{ opacity: getOpacity(position) }}
                                                            key={'ExpandedRow' + marketIndex}
                                                        >
                                                            <ParlayRowMatch>
                                                                {getPositionStatus(position, theme)}
                                                                <ParlayRowTeam
                                                                    title={
                                                                        position.market.homeTeam +
                                                                        ' vs ' +
                                                                        position.market.awayTeam
                                                                    }
                                                                >
                                                                    {position.market.homeTeam +
                                                                        ' vs ' +
                                                                        position.market.awayTeam}
                                                                </ParlayRowTeam>
                                                            </ParlayRowMatch>
                                                            <PositionSymbol
                                                                symbolAdditionalText={{
                                                                    text: formatMarketOdds(
                                                                        selectedOddsType,
                                                                        parlay.marketQuotes
                                                                            ? parlay.marketQuotes[marketIndex]
                                                                            : 0
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
                                                                    spreadTotalText
                                                                        ? {
                                                                              text: spreadTotalText,
                                                                              textStyle: {
                                                                                  backgroundColor:
                                                                                      theme.oddsGradiendBackground
                                                                                          .tertiary,
                                                                                  fontSize: '10px',
                                                                                  top: '-9px',
                                                                                  left: '10px',
                                                                              },
                                                                          }
                                                                        : undefined
                                                                }
                                                                tooltip={
                                                                    <>
                                                                        {getOddTooltipText(
                                                                            positionEnum,
                                                                            position.market
                                                                        )}
                                                                    </>
                                                                }
                                                            />
                                                            <ParlayRowResult>
                                                                {getParlayItemStatus(position.market)}
                                                            </ParlayRowResult>
                                                        </ParlayRow>
                                                    )
                                                );
                                            })}
                                        </ExpandedRow>
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

export default React.memo(SidebarLeaderboard);
