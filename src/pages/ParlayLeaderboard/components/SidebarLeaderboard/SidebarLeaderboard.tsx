import PositionSymbol from 'components/PositionSymbol';
import SPAAnchor from 'components/SPAAnchor';
import { USD_SIGN } from 'constants/currency';
import { PARLAY_LEADERBOARD_START_DATE, TODAYS_DATE } from 'constants/markets';
import { SIDEBAR_NUMBER_OF_TOP_USERS } from 'constants/quiz';
import ROUTES from 'constants/routes';
import { differenceInCalendarMonths } from 'date-fns';
import { getOpacity, getParlayItemStatus, getPositionStatus, REWARDS } from 'pages/ParlayLeaderboard/ParlayLeaderboard';
import { useParlayLeaderboardQuery } from 'queries/markets/useParlayLeaderboardQuery';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getOddsType } from 'redux/modules/ui';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { PositionData } from 'types/markets';
import { formatCurrency, formatCurrencyWithSign } from 'utils/formatters/number';
import { truncateAddress } from 'utils/formatters/string';
import {
    convertPositionNameToPositionType,
    formatMarketOdds,
    getOddTooltipText,
    getSpreadTotalText,
    getSymbolText,
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
    OPLogoWrapper,
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
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const selectedOddsType = useSelector(getOddsType);

    const [expandedRowIndex, setExpandedRowIndex] = useState(-1);

    const latestPeriod = differenceInCalendarMonths(TODAYS_DATE, PARLAY_LEADERBOARD_START_DATE);
    const query = useParlayLeaderboardQuery(networkId, latestPeriod, { enabled: isAppReady });

    const parlaysData = useMemo(() => {
        return query.isSuccess ? query.data.slice(0, SIDEBAR_NUMBER_OF_TOP_USERS) : [];
    }, [query.isSuccess, query.data]);

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
                            <ColumnLabel>{t('parlay-leaderboard.sidebar.quote')}</ColumnLabel>
                        </ColumnWrapper>
                        <ColumnWrapper>
                            <ColumnLabel>{t('parlay-leaderboard.sidebar.paid')}</ColumnLabel>
                        </ColumnWrapper>
                        <ColumnWrapper>
                            <ColumnLabel>{t('parlay-leaderboard.sidebar.reward')}</ColumnLabel>
                        </ColumnWrapper>
                    </HeaderRow>
                    {parlaysData.map((parlay, index) => {
                        return (
                            <React.Fragment key={index}>
                                <LeaderboardRow
                                    className={index == 0 ? 'first' : ''}
                                    onClick={() => setExpandedRowIndex(expandedRowIndex !== index ? index : -1)}
                                >
                                    <ColumnWrapper>
                                        <Rank>{parlay.rank}</Rank>
                                        <DataLabel title={parlay.account}>
                                            {truncateAddress(parlay.account, 3, 3)}
                                        </DataLabel>
                                    </ColumnWrapper>
                                    <ColumnWrapper>
                                        <DataLabel>{formatMarketOdds(selectedOddsType, parlay.totalQuote)}</DataLabel>
                                    </ColumnWrapper>
                                    <ColumnWrapper>
                                        <DataLabel>{formatCurrencyWithSign(USD_SIGN, parlay.sUSDPaid, 2)}</DataLabel>
                                    </ColumnWrapper>
                                    <ColumnWrapper>
                                        <DataLabel>
                                            {formatCurrency(REWARDS[parlay.rank - 1], 0)}
                                            <OPLogoWrapper />
                                        </DataLabel>
                                    </ColumnWrapper>
                                    <ArrowIcon
                                        className={
                                            expandedRowIndex === index ? 'icon icon--arrow-up' : 'icon icon--arrow-down'
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
                                                ? getSymbolText(positionEnum, position.market.betType)
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
                                                            {getPositionStatus(position)}
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
                                                                              backgroundColor: '#2c3250',
                                                                              fontSize: '10px',
                                                                              top: '-9px',
                                                                              left: '10px',
                                                                          },
                                                                      }
                                                                    : undefined
                                                            }
                                                            tooltip={
                                                                <>{getOddTooltipText(positionEnum, position.market)}</>
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
                    })}
                </LeaderboardContainer>
            </Container>
        </LeaderboardWrapper>
    );
};

export default React.memo(SidebarLeaderboard);
