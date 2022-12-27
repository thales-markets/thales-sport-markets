import SPAAnchor from 'components/SPAAnchor';
import { USD_SIGN } from 'constants/currency';
import ROUTES from 'constants/routes';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { formatCurrencyWithKey, formatCurrencyWithSign } from 'utils/formatters/number';
import { truncateAddress } from 'utils/formatters/string';
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
    ParlayRow,
    ParlayRowTeam,
    ParlayRowMatch,
    QuoteText,
    Rank,
    Title,
    TitleLabel,
    ParlayRowSummary,
    QuoteWrapper,
    QuoteLabel,
} from './styled-components';
import { useParlayLeaderboardQuery } from 'queries/markets/useParlayLeaderboardQuery';
import {
    START_DATE,
    END_DATE,
    getPositionStatus,
    getOpacity,
    getParlayItemStatus,
} from 'pages/ParlayLeaderboard/ParlayLeaderboard';
import { getIsAppReady } from 'redux/modules/app';
import {
    convertPositionNameToPositionType,
    convertPositionToSymbolType,
    formatMarketOdds,
    getIsApexTopGame,
} from 'utils/markets';
import { SIDEBAR_NUMBER_OF_TOP_USERS } from 'constants/quiz';
import { PositionData } from 'types/markets';
import PositionSymbol from 'components/PositionSymbol';
import { getOddsType } from 'redux/modules/ui';

const SidebarLeaderboard: React.FC = () => {
    const { t } = useTranslation();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const selectedOddsType = useSelector(getOddsType);

    const [expandedRowIndex, setExpandedRowIndex] = useState(-1);

    const query = useParlayLeaderboardQuery(
        networkId,
        parseInt(START_DATE.getTime() / 1000 + ''),
        parseInt(END_DATE.getTime() / 1000 + ''),
        { enabled: isAppReady }
    );

    const parlaysData = useMemo(() => {
        return query.isSuccess
            ? query.data
                  .sort((a, b) => {
                      return b.totalAmount - a.totalAmount;
                  })
                  .slice(0, SIDEBAR_NUMBER_OF_TOP_USERS)
            : [];
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
                        <ColumnWrapper>
                            <ColumnLabel>{t('parlay-leaderboard.sidebar.player')}</ColumnLabel>
                        </ColumnWrapper>
                        <ColumnWrapper>
                            <ColumnLabel>{t('parlay-leaderboard.sidebar.quote')}</ColumnLabel>
                        </ColumnWrapper>
                        <ColumnWrapper>
                            <ColumnLabel>{t('parlay-leaderboard.sidebar.paid')}</ColumnLabel>
                        </ColumnWrapper>
                        <ColumnWrapper>
                            <ColumnLabel>{t('parlay-leaderboard.sidebar.won')}</ColumnLabel>
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
                                        <Rank>{index + 1}</Rank>
                                        <DataLabel>{truncateAddress(parlay.account, 3, 3)}</DataLabel>
                                    </ColumnWrapper>
                                    <ColumnWrapper>
                                        <DataLabel>{formatMarketOdds(selectedOddsType, parlay.totalQuote)}</DataLabel>
                                    </ColumnWrapper>
                                    <ColumnWrapper>
                                        <DataLabel>{formatCurrencyWithSign(USD_SIGN, parlay.sUSDPaid, 2)}</DataLabel>
                                    </ColumnWrapper>
                                    <ColumnWrapper>
                                        <DataLabel>{formatCurrencyWithSign(USD_SIGN, parlay.totalAmount, 2)}</DataLabel>
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
                                                            type={convertPositionToSymbolType(
                                                                positionEnum,
                                                                getIsApexTopGame(
                                                                    position.market.isApex,
                                                                    position.market.betType
                                                                )
                                                            )}
                                                            symbolColor={'white'}
                                                            symbolSize={'10'}
                                                            additionalText={{
                                                                firstText: formatMarketOdds(
                                                                    selectedOddsType,
                                                                    parlay.marketQuotes
                                                                        ? parlay.marketQuotes[marketIndex]
                                                                        : 0
                                                                ),
                                                                firstTextStyle: {
                                                                    fontSize: '10.5px',
                                                                    color: 'white',
                                                                    marginLeft: '5px',
                                                                },
                                                            }}
                                                            additionalStyle={{ width: 21, height: 21, fontSize: 10 }}
                                                        />
                                                        <QuoteText>{getParlayItemStatus(position.market)}</QuoteText>
                                                    </ParlayRow>
                                                )
                                            );
                                        })}
                                        <ParlayRowSummary>
                                            <QuoteWrapper>
                                                <QuoteLabel>{t('parlay-leaderboard.sidebar.total-quote')}:</QuoteLabel>
                                                <QuoteText>
                                                    {formatMarketOdds(selectedOddsType, parlay.totalQuote)}
                                                </QuoteText>
                                            </QuoteWrapper>
                                            <QuoteWrapper>
                                                <QuoteLabel>{t('parlay-leaderboard.sidebar.total-amount')}:</QuoteLabel>
                                                <QuoteText>
                                                    {formatCurrencyWithKey(USD_SIGN, parlay.totalAmount, 2)}
                                                </QuoteText>
                                            </QuoteWrapper>
                                        </ParlayRowSummary>
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
