import Button from 'components/Button';
import FooterSidebarMobile from 'components/FooterSidebarMobile';
import IncentivizedLeague from 'components/IncentivizedLeague';
import Toggle from 'components/Toggle';
import { MarketTypeGroupsBySport } from 'constants/marketTypes';
import { GameStatusKey } from 'constants/markets';
import ROUTES from 'constants/routes';
import { MarketType } from 'enums/marketTypes';
import { GameStatus } from 'enums/markets';
import { League, Sport } from 'enums/sports';
import { groupBy } from 'lodash';
import { ToggleContainer } from 'pages/LiquidityPool/styled-components';
import Parlay from 'pages/Markets/Home/Parlay';
import TicketMobileModal from 'pages/Markets/Home/Parlay/components/TicketMobileModal';
import BackToLink from 'pages/Markets/components/BackToLink';
import queryString from 'query-string';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getMarketTypeGroupFilter, setMarketTypeGroupFilter } from 'redux/modules/market';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { SportMarket } from 'types/markets';
import { RootState } from 'types/redux';
import { ThemeInterface } from 'types/ui';
import { showGameScore, showLiveInfo } from 'utils/marketsV2';
import { buildHref } from 'utils/routes';
import { getLeaguePeriodType, getLeagueSport } from 'utils/sports';
import { getOrdinalNumberLabel } from 'utils/ui';
import useQueryParam from 'utils/useQueryParams';
import { isFuturesMarket } from '../../../../utils/markets';
import Header from '../../Home/Header';
import MatchInfoV2 from './components/MatchInfoV2';
import PositionsV2 from './components/PositionsV2';
import TicketTransactions from './components/TicketTransactions';

type MarketDetailsPropType = {
    market: SportMarket;
};

const MarketDetails: React.FC<MarketDetailsPropType> = ({ market }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const dispatch = useDispatch();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const marketTypeGroupFilter = useSelector(getMarketTypeGroupFilter);
    const queryParams: { title?: string } = queryString.parse(location.search);

    const [metaTitle, setMetaTitle] = useQueryParam('title', queryParams?.title ? queryParams?.title : '');
    const [showTicketMobileModal, setShowTicketMobileModal] = useState(false);
    const [hidePausedMarkets, setHidePausedMarkets] = useState(true);

    const marketTypesFilter = useMemo(
        () => (marketTypeGroupFilter ? MarketTypeGroupsBySport[market.sport][marketTypeGroupFilter] || [] : []),
        [market.sport, marketTypeGroupFilter]
    );

    const groupedChildMarkets = useMemo(
        () =>
            groupBy(
                market.childMarkets.filter(
                    (childMarket) =>
                        (!marketTypesFilter.length || marketTypesFilter.includes(childMarket.typeId)) &&
                        (hidePausedMarkets && market.isOpen && market.maturityDate > new Date()
                            ? !childMarket.isPaused
                            : true)
                ),
                (childMarket) => childMarket.typeId
            ),
        [market.childMarkets, market.isOpen, market.maturityDate, hidePausedMarkets, marketTypesFilter]
    );

    const numberOfMarkets = useMemo(() => {
        let num =
            !marketTypesFilter.length || marketTypesFilter.includes(MarketType.WINNER) || isFuturesMarket(market.typeId)
                ? 1
                : 0;
        Object.keys(groupedChildMarkets).forEach((key) => {
            const typeId = Number(key);
            const childMarkets = groupedChildMarkets[typeId];
            num += childMarkets.length;
        });
        return num;
    }, [groupedChildMarkets, market.typeId, marketTypesFilter]);

    useEffect(() => {
        if (!metaTitle) {
            setMetaTitle(`${market.homeTeam} - ${market.awayTeam}`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [market.awayTeam, market.homeTeam]);

    const isGameStarted = market.maturityDate < new Date();
    const isGameOpen = market.isOpen && !isGameStarted;
    const isGameResolved = market.isResolved || market.isCancelled;
    const isPendingResolution = isGameStarted && !isGameResolved;
    const showStatus = !market.isOpen || isGameStarted;
    const liveScore = market.liveScore;

    const leagueSport = getLeagueSport(market.leagueId);

    return (
        <RowContainer>
            <MainContainer isGameOpen={isGameOpen}>
                <HeaderWrapper>
                    <BackToLink
                        link={buildHref(ROUTES.Markets.Home)}
                        text={t('market.back')}
                        customStylingContainer={{ position: 'absolute', left: 0, top: 0, marginTop: 0 }}
                    />
                    <IncentivizedLeague league={market.leagueId} maturityDate={market.maturityDate} fontSize={15} />
                </HeaderWrapper>
                <MatchInfoV2 market={market} />
                {showStatus && (
                    <Status backgroundColor={market.isCancelled ? theme.status.canceled : theme.background.secondary}>
                        {market.isCancelled ? (
                            t('markets.market-card.canceled')
                        ) : // TODO check logic because of 0:0 results when isResolved == true, but isGameFinished == false
                        market.isResolved || market.isGameFinished ? (
                            showGameScore(market.gameStatus) || !market.gameStatus ? (
                                <ResultContainer>
                                    <ResultLabel>
                                        {market.isOneSideMarket ? (
                                            market.leagueId === League.US_ELECTION && market.positionNames ? (
                                                market.positionNames[market.winningPositions[0]]
                                            ) : market.homeScore == 1 ? (
                                                t('markets.market-card.race-winner')
                                            ) : (
                                                t('markets.market-card.no-win')
                                            )
                                        ) : market.leagueId === League.UFC ? (
                                            <>
                                                {Number(market.homeScore) > 0 ? 'W - L' : 'L - W'}
                                                <InfoLabel className="ufc">
                                                    {`(${t('market.number-of-rounds')} ` +
                                                        `${
                                                            Number(market.homeScore) > 0
                                                                ? market.homeScore
                                                                : market.awayScore
                                                        }` +
                                                        ')'}
                                                </InfoLabel>
                                            </>
                                        ) : (
                                            `${market.homeScore} - ${market.awayScore}`
                                        )}
                                        {leagueSport === Sport.SOCCER &&
                                            market.homeScoreByPeriod.length > 0 &&
                                            market.awayScoreByPeriod.length > 0 && (
                                                <InfoLabel className="football">
                                                    {' (' +
                                                        market.homeScoreByPeriod[0] +
                                                        ' - ' +
                                                        market.awayScoreByPeriod[0] +
                                                        ')'}
                                                </InfoLabel>
                                            )}
                                    </ResultLabel>
                                    {leagueSport !== Sport.SOCCER &&
                                        leagueSport !== Sport.CRICKET &&
                                        market.leagueId !== League.UFC &&
                                        market.leagueId !== League.US_ELECTION && (
                                            <PeriodsContainer directionRow={true}>
                                                {market.homeScoreByPeriod.map((_, index) => {
                                                    return (
                                                        <PeriodContainer key={index}>
                                                            <InfoLabel className="gray">{index + 1}</InfoLabel>
                                                            <InfoLabel>{market.homeScoreByPeriod[index]}</InfoLabel>
                                                            <InfoLabel>{market.awayScoreByPeriod[index]}</InfoLabel>
                                                        </PeriodContainer>
                                                    );
                                                })}
                                                {leagueSport !== Sport.TENNIS && (
                                                    <PeriodContainer>
                                                        <InfoLabel className="gray">T</InfoLabel>
                                                        <InfoLabel>{market.homeScore}</InfoLabel>
                                                        <InfoLabel>{market.awayScore}</InfoLabel>
                                                    </PeriodContainer>
                                                )}
                                            </PeriodsContainer>
                                        )}
                                </ResultContainer>
                            ) : (
                                t(`markets.market-card.${GameStatusKey[market.gameStatus]}`)
                            )
                        ) : isPendingResolution ? (
                            liveScore ? (
                                showGameScore(liveScore.gameStatus) || !liveScore.gameStatus ? (
                                    <ResultContainer>
                                        {market.leagueId !== League.UFC && (
                                            <ResultLabel>
                                                {liveScore.homeScore + ' - ' + liveScore.awayScore}{' '}
                                                {leagueSport === Sport.SOCCER && liveScore.period == 2 && (
                                                    <InfoLabel className="football">
                                                        {' (' +
                                                            liveScore.homeScoreByPeriod[0] +
                                                            ' - ' +
                                                            liveScore.awayScoreByPeriod[0] +
                                                            ')'}
                                                    </InfoLabel>
                                                )}
                                            </ResultLabel>
                                        )}
                                        {showLiveInfo(liveScore.gameStatus, liveScore.period) && (
                                            <PeriodsContainer>
                                                {liveScore.gameStatus == GameStatus.RUNDOWN_HALF_TIME ||
                                                liveScore.gameStatus == GameStatus.OPTICODDS_HALF ? (
                                                    <InfoLabel>{t('markets.market-card.half-time')}</InfoLabel>
                                                ) : (
                                                    <>
                                                        <InfoLabel>
                                                            {` ${getOrdinalNumberLabel(Number(liveScore.period))} ${t(
                                                                `markets.market-card.${getLeaguePeriodType(
                                                                    market.leagueId
                                                                )}`
                                                            )}`}
                                                        </InfoLabel>
                                                        <InfoLabel className="red">
                                                            {liveScore.displayClock?.replaceAll("'", '')}
                                                            <InfoLabel className="blink">&prime;</InfoLabel>
                                                        </InfoLabel>
                                                    </>
                                                )}
                                            </PeriodsContainer>
                                        )}
                                        {leagueSport !== Sport.SOCCER && leagueSport !== Sport.CRICKET && (
                                            <FlexDivRow>
                                                {liveScore.homeScoreByPeriod.map((_, index) => {
                                                    return (
                                                        <PeriodContainer key={index}>
                                                            <InfoLabel className="gray">{index + 1}</InfoLabel>
                                                            <InfoLabel>{liveScore.homeScoreByPeriod[index]}</InfoLabel>
                                                            <InfoLabel>{liveScore.awayScoreByPeriod[index]}</InfoLabel>
                                                        </PeriodContainer>
                                                    );
                                                })}
                                            </FlexDivRow>
                                        )}
                                    </ResultContainer>
                                ) : (
                                    t(`markets.market-card.${GameStatusKey[liveScore.gameStatus]}`)
                                )
                            ) : (
                                t('markets.market-card.pending')
                            )
                        ) : market.isPaused ? (
                            t('markets.market-card.paused')
                        ) : (
                            <></>
                        )}
                    </Status>
                )}
                <>
                    {isGameOpen && (
                        <ToggleContainer>
                            <Toggle
                                label={{
                                    firstLabel: t('markets.market-card.toggle.hide-paused-markets'),
                                    secondLabel: t('markets.market-card.toggle.show-paused-markets'),
                                }}
                                active={!hidePausedMarkets}
                                dotSize="18px"
                                dotBackground={theme.background.secondary}
                                dotBorder={`3px solid ${theme.borderColor.quaternary}`}
                                handleClick={() => {
                                    setHidePausedMarkets(!hidePausedMarkets);
                                }}
                            />
                        </ToggleContainer>
                    )}
                    <Header market={market} hideSwitch />
                    <PositionsContainer>
                        {numberOfMarkets === 0 ? (
                            <NoMarketsContainer>
                                <NoMarketsLabel>{`${t(
                                    'market.no-markets-found'
                                )} ${marketTypeGroupFilter}`}</NoMarketsLabel>
                                <Button
                                    onClick={() => dispatch(setMarketTypeGroupFilter(undefined))}
                                    backgroundColor={theme.button.background.secondary}
                                    textColor={theme.button.textColor.quaternary}
                                    borderColor={theme.button.borderColor.secondary}
                                    height="24px"
                                    fontSize="12px"
                                >
                                    {t('market.view-all-markets')}
                                </Button>
                            </NoMarketsContainer>
                        ) : (
                            <>
                                {(!marketTypesFilter.length || marketTypesFilter.includes(MarketType.WINNER)) && (
                                    <PositionsV2
                                        markets={[market]}
                                        marketType={market.typeId}
                                        isGameOpen={isGameOpen}
                                        showInvalid={!hidePausedMarkets}
                                    />
                                )}
                                {Object.keys(groupedChildMarkets).map((key, index) => {
                                    const typeId = Number(key);
                                    const childMarkets = groupedChildMarkets[typeId];
                                    return (
                                        <PositionsV2
                                            key={index}
                                            markets={childMarkets}
                                            marketType={typeId}
                                            isGameOpen={isGameOpen}
                                            showInvalid={!hidePausedMarkets}
                                        />
                                    );
                                })}
                            </>
                        )}
                    </PositionsContainer>
                </>
                <TicketTransactions market={market} />
            </MainContainer>
            {isGameOpen && (
                <SidebarContainer>
                    <Parlay />
                </SidebarContainer>
            )}
            <TicketMobileModal
                onClose={() => setShowTicketMobileModal(false)}
                isOpen={isMobile && showTicketMobileModal}
            />
            {isMobile && <FooterSidebarMobile setParlayMobileVisibility={setShowTicketMobileModal} />}
        </RowContainer>
    );
};

const PositionsContainer = styled(FlexDivColumn)`
    position: relative;
    width: 100%;
    border-radius: 8px;
    margin-top: 10px;
    padding: 10px 10px 10px 10px;
    background-color: ${(props) => props.theme.oddsContainerBackground.secondary};
    flex: initial;
`;

const RowContainer = styled(FlexDivRow)`
    margin-top: 40px;
    width: 100%;
    flex-direction: row;
    justify-content: center;
    @media (max-width: 575px) {
        margin-top: 30px;
    }
`;

const MainContainer = styled(FlexDivColumn)<{ isGameOpen: boolean }>`
    width: 100%;
    max-width: 806px;
    margin-right: ${(props) => (props.isGameOpen ? 10 : 0)}px;
    @media (max-width: 575px) {
        margin-right: 0;
    }
    flex: initial;
`;

const SidebarContainer = styled(FlexDivColumn)`
    max-width: 360px;
    @media (max-width: 1299px) {
        max-width: 320px;
    }
    @media (max-width: 950px) {
        display: none;
    }
`;

const HeaderWrapper = styled(FlexDivRow)`
    width: 100%;
    position: relative;
    align-items: center;
    justify-content: end;
    @media (max-width: 950px) {
        flex-direction: column;
        padding-top: 20px;
    }
`;

const Status = styled(FlexDivCentered)<{ backgroundColor?: string }>`
    width: 100%;
    border-radius: 8px;
    background-color: ${(props) => props.backgroundColor || props.theme.background.secondary};
    padding: 10px 50px;
    margin-bottom: 15px;
    font-weight: 600;
    font-size: 21px;
    line-height: 110%;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
`;

const ResultContainer = styled(FlexDivColumnCentered)`
    align-items: center;
`;

const InfoLabel = styled.label`
    text-align: center;
    font-size: 18px;
    text-transform: uppercase;
    &.gray {
        color: ${(props) => props.theme.textColor.secondary};
    }

    &.red {
        color: ${(props) => props.theme.status.loss};
    }

    &.football {
        color: ${(props) => props.theme.textColor.secondary};
        font-size: 21px;
        font-weight: 600;
    }
    &.ufc {
        display: flex;
        color: ${(props) => props.theme.textColor.secondary};
        font-size: 14px;
        font-weight: 600;
    }

    &.blink {
        color: ${(props) => props.theme.status.loss};
        font-weight: 600;
        animation: blinker 1.5s step-start infinite;
    }

    @keyframes blinker {
        50% {
            opacity: 0;
        }
    }
`;

const ResultLabel = styled.label`
    text-align: center;
`;

const PeriodContainer = styled(FlexDivColumn)`
    margin: 0px 10px;
    font-size: 18px;
`;

const PeriodsContainer = styled(FlexDivColumn)<{ directionRow?: boolean }>`
    margin-top: 10px;
    flex-direction: ${(props) => (props.directionRow ? 'row' : 'column')};
`;

const NoMarketsContainer = styled(FlexDivColumnCentered)`
    min-height: 200px;
    align-items: center;
    justify-content: start;
    margin-top: 100px;
    font-style: normal;
    font-weight: bold;
    font-size: 28px;
    line-height: 100%;
`;

const NoMarketsLabel = styled.span`
    margin-bottom: 15px;
    text-align: center;
    font-size: 16px;
`;

export default MarketDetails;
