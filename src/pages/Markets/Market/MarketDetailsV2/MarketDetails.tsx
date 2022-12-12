import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Toggle from 'components/Toggle/Toggle';
import MatchInfo from './components/MatchInfo';
import BackToLink from 'pages/Markets/components/BackToLink';

import { Position, Side } from 'constants/options';
import { MarketData } from 'types/markets';
import Positions from './components/Positions';
import useAvailablePerSideQuery from 'queries/markets/useAvailablePerSideQuery';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsWalletConnected } from 'redux/modules/wallet';
import { FlexDivColumn, FlexDivRow } from 'styles/common';
import styled from 'styled-components';
import { buildHref } from 'utils/routes';
import ROUTES from 'constants/routes';
import Parlay from 'pages/Markets/Home/Parlay';
import Transactions from '../Transactions';

type MarketDetailsPropType = {
    market: MarketData;
    selectedSide: Side;
    setSelectedSide: (side: Side) => void;
};

const MarketDetails: React.FC<MarketDetailsPropType> = ({ market, selectedSide, setSelectedSide }) => {
    const { t } = useTranslation();
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));

    const [selectedPosition, setSelectedPosition] = useState<Position>(Position.HOME);
    const availablePerSideQuery = useAvailablePerSideQuery(market.address, selectedSide, {
        enabled: isWalletConnected,
    });

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

    const showAMM = !market.resolved && !market.cancelled && !market.gameStarted;
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
                <Positions
                    market={market}
                    selectedSide={selectedSide}
                    availablePerSide={availablePerSide}
                    selectedPosition={selectedPosition}
                    setSelectedPosition={setSelectedPosition}
                />
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

export default MarketDetails;
