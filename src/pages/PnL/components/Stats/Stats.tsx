import SelectInput from 'components/SelectInput';
import { LiquidityPoolCollateral } from 'enums/liquidityPool';
import { PnlTab } from 'enums/ui';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow, FlexDivSpaceBetween } from 'styles/common';
import AllLpTickets from '../AllLpTickets';
import LpPnl from '../LpStats';
import LpTickets from '../LpTickets';
import LpUsersPnl from '../LpUsersPnl';
import NavigationBar from '../NavigationBar';

type StatsProps = {
    selectedTab: PnlTab;
    setSelectedTab: (tab: PnlTab) => void;
    currentRound: number;
};

const Stats: React.FC<StatsProps> = ({ selectedTab, setSelectedTab, currentRound }) => {
    const isMobile = useSelector(getIsMobile);
    const [round, setRound] = useState<number>(currentRound);

    useEffect(() => {
        setRound(currentRound);
    }, [currentRound]);

    const rounds: Array<{ value: number; label: string }> = [];
    for (let index = 0; index <= currentRound; index++) {
        rounds.push({
            value: index,
            label:
                index === currentRound
                    ? `${t('liquidity-pool.user-transactions.current-round-label')} (${t(
                          'liquidity-pool.user-transactions.round-label'
                      )} ${index})`
                    : index === 1
                    ? `${t('liquidity-pool.user-transactions.default-round-label')} (${t(
                          'liquidity-pool.user-transactions.round-label'
                      )} ${index})`
                    : `${t('liquidity-pool.user-transactions.round-label')} ${index}`,
        });
    }

    return (
        <RowContainer>
            <MainContainer>
                <FiltersContainer>
                    <SelectContainer>
                        <SelectInput
                            options={rounds}
                            handleChange={(value) => setRound(Number(value))}
                            defaultValue={round}
                            width={300}
                        />
                    </SelectContainer>
                </FiltersContainer>
                <NavigationWrapper>
                    <Header>
                        {!isMobile && <NavigationBar selectedTab={selectedTab} setSelectedTab={setSelectedTab} />}
                    </Header>
                    {isMobile && <NavigationBar selectedTab={selectedTab} setSelectedTab={setSelectedTab} />}
                </NavigationWrapper>
                {selectedTab == PnlTab.LP_STATS && <LpPnl round={round} />}
                {selectedTab == PnlTab.USDC_USERS_PNL && (
                    <LpUsersPnl lpCollateral={LiquidityPoolCollateral.USDC} round={round} />
                )}
                {selectedTab == PnlTab.WETH_USERS_PNL && (
                    <LpUsersPnl lpCollateral={LiquidityPoolCollateral.WETH} round={round} />
                )}
                {selectedTab == PnlTab.THALES_USERS_PNL && (
                    <LpUsersPnl lpCollateral={LiquidityPoolCollateral.THALES} round={round} />
                )}
                {selectedTab == PnlTab.USDC_TICKETS && (
                    <LpTickets lpCollateral={LiquidityPoolCollateral.USDC} round={round} />
                )}
                {selectedTab == PnlTab.WETH_TICKETS && (
                    <LpTickets lpCollateral={LiquidityPoolCollateral.WETH} round={round} />
                )}
                {selectedTab == PnlTab.THALES_TICKETS && (
                    <LpTickets lpCollateral={LiquidityPoolCollateral.THALES} round={round} />
                )}
                {selectedTab == PnlTab.TICKETS && <AllLpTickets round={round} />}
            </MainContainer>
        </RowContainer>
    );
};

const RowContainer = styled(FlexDivRow)`
    width: 100%;
    flex: 1 1 0%;
    flex-direction: row;
    justify-content: center;
`;

const MainContainer = styled(FlexDivColumn)`
    width: 100%;
    max-width: 950px;
    flex-grow: 1;
    margin: 0 25px;
    @media (max-width: 1499px) {
        margin: 0 12px;
    }
    @media (max-width: 1199px) {
        margin: 0 10px;
    }
    @media (max-width: 950px) {
        margin: 0;
        width: 100%;
    }
`;

const NavigationWrapper = styled(FlexDivRow)`
    width: 100%;
    margin-bottom: 15px;
    @media (max-width: 950px) {
        flex-direction: column;
    }
`;

const Header = styled(FlexDivRow)`
    width: 100%;
    @media (max-width: 950px) {
        margin-bottom: 15px;
    }
`;

const FiltersContainer = styled(FlexDivSpaceBetween)``;

const SelectContainer = styled.div`
    margin: 10px 0;
    width: 300px;
`;

export default Stats;
