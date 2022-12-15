import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Toggle from 'components/Toggle/Toggle';
import MatchInfo from './components/MatchInfo';
import BackToLink from 'pages/Markets/components/BackToLink';

import { Position, Side } from 'constants/options';
import { ChildMarkets, MarketData } from 'types/markets';
import Positions from './components/Positions';
import useAvailablePerSideQuery from 'queries/markets/useAvailablePerSideQuery';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsWalletConnected } from 'redux/modules/wallet';
import { FlexDivCentered, FlexDivColumn, FlexDivRow } from 'styles/common';
import styled from 'styled-components';
import { buildHref } from 'utils/routes';
import ROUTES from 'constants/routes';
import Parlay from 'pages/Markets/Home/Parlay';
import Transactions from '../Transactions';
import { getIsAppReady } from 'redux/modules/app';
import useChildMarketsQuery from 'queries/markets/useChildMarketsQuery';
import { MAIN_COLORS } from 'constants/ui';
import { BetType } from 'constants/tags';

type MarketDetailsPropType = {
    market: MarketData;
    selectedSide: Side;
    setSelectedSide: (side: Side) => void;
};

const MarketDetails: React.FC<MarketDetailsPropType> = ({ market, selectedSide, setSelectedSide }) => {
    const { t } = useTranslation();
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const [childMarkets, setChildMarkets] = useState<ChildMarkets>({
        spreadMarkets: [],
        totalMarkets: [],
    });

    const availablePerSideQuery = useAvailablePerSideQuery(market.address, selectedSide, {
        enabled: isWalletConnected,
    });

    const childMarketsQuery = useChildMarketsQuery(market, selectedSide === Side.SELL, {
        enabled: isAppReady,
    });

    useEffect(() => {
        if (childMarketsQuery.isSuccess && childMarketsQuery.data) {
            setChildMarkets(childMarketsQuery.data);
        }
    }, [childMarketsQuery.isSuccess, childMarketsQuery.data]);

    const availablePerSide =
        availablePerSideQuery.isSuccess && availablePerSideQuery.data
            ? availablePerSideQuery.data
            : {
                  positions: {
                      [Position.HOME]: {
                          available: 0,
                          buyImpactPrice: 0,
                      },
                      [Position.AWAY]: {
                          available: 0,
                          buyImpactPrice: 0,
                      },
                      [Position.DRAW]: {
                          available: 0,
                          buyImpactPrice: 0,
                      },
                  },
              };

    const showAMM = !market.resolved && !market.cancelled && !market.gameStarted && !market.paused;

    const isGameCancelled = market.cancelled || (!market.gameStarted && market.resolved);
    const isGameResolved = market.gameStarted && market.resolved;
    const isPendingResolution = market.gameStarted && !market.resolved;
    const isGamePaused = market.paused && !isGameResolved && !isGameCancelled;
    const showPositions = !market.resolved && !market.cancelled && !market.gameStarted && !market.paused;

    return (
        <RowContainer>
            <MainContainer showAMM={showAMM}>
                <HeaderWrapper>
                    <BackToLink
                        link={buildHref(ROUTES.Markets.Home)}
                        text={t('market.back')}
                        customStylingContainer={{ position: 'absolute', left: '5px', marginTop: '0px' }}
                    />
                    {showAMM && (
                        <Toggle
                            label={{
                                firstLabel: t('common.buy-side'),
                                secondLabel: t('common.sell-side'),
                                fontSize: '18px',
                            }}
                            active={selectedSide === Side.SELL}
                            dotSize="18px"
                            dotBackground="#303656"
                            dotBorder="3px solid #3FD1FF"
                            handleClick={() => {
                                setSelectedSide(selectedSide === Side.BUY ? Side.SELL : Side.BUY);
                            }}
                        />
                    )}
                </HeaderWrapper>
                <MatchInfo market={market} />
                {showPositions ? (
                    <>
                        <Positions
                            markets={[market]}
                            betType={BetType.WINNER}
                            selectedSide={selectedSide}
                            availablePerSide={availablePerSide}
                        />
                        <Positions
                            markets={childMarkets.spreadMarkets}
                            betType={BetType.SPREAD}
                            selectedSide={selectedSide}
                            availablePerSide={availablePerSide}
                        />
                        <Positions
                            markets={childMarkets.totalMarkets}
                            betType={BetType.TOTAL}
                            selectedSide={selectedSide}
                            availablePerSide={availablePerSide}
                        />
                    </>
                ) : (
                    <Status backgroundColor={isGameCancelled ? MAIN_COLORS.BACKGROUNDS.RED : MAIN_COLORS.LIGHT_GRAY}>
                        {isPendingResolution
                            ? t('markets.market-card.pending-resolution')
                            : isGameCancelled
                            ? t('markets.market-card.canceled')
                            : isGamePaused
                            ? t('markets.market-card.paused')
                            : `${t('markets.market-card.result')}: ${market.homeScore} - ${market.awayScore}`}
                    </Status>
                )}
                <Transactions market={market} />
            </MainContainer>
            {showAMM && (
                <SidebarContainer>
                    <Parlay />
                </SidebarContainer>
            )}
        </RowContainer>
    );
};

const RowContainer = styled(FlexDivRow)`
    width: 100%;
    flex-direction: row;
    justify-content: center;
`;

const MainContainer = styled(FlexDivColumn)<{ showAMM: boolean }>`
    margin-top: 30px;
    width: 100%;
    max-width: 800px;
    margin-right: ${(props) => (props.showAMM ? 20 : 0)}px;
    @media (max-width: 575px) {
        margin-right: 0;
    }
`;

const SidebarContainer = styled(FlexDivColumn)`
    padding-top: 25px;
    max-width: 300px;
    @media (max-width: 950px) {
        display: none;
    }
`;

const HeaderWrapper = styled(FlexDivRow)`
    width: 100%;
    position: relative;
    align-items: center;
    margin-bottom: 20px;
`;

export const Status = styled(FlexDivCentered)<{ backgroundColor?: string }>`
    width: 100%;
    border-radius: 15px;
    background-color: ${(props) => props.backgroundColor || MAIN_COLORS.LIGHT_GRAY};
    padding: 10px 50px;
    margin-bottom: 7px;
    font-weight: 600;
    font-size: 21px;
    line-height: 110%;
    text-transform: uppercase;
    color: ${MAIN_COLORS.TEXT.WHITE};
`;

export default MarketDetails;
