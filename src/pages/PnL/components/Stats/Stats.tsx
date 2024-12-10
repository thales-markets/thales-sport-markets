import SelectInput from 'components/SelectInput';
import { LiquidityPoolCollateral } from 'enums/liquidityPool';
import { PnlTab } from 'enums/ui';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow, FlexDivSpaceBetween } from 'styles/common';
import Checkbox from '../../../../components/fields/Checkbox';
import { League } from '../../../../enums/sports';
import AllLpTickets from '../AllLpTickets';
import LpPnl from '../LpStats';
import LpTickets from '../LpTickets';
import LpUsersPnl from '../LpUsersPnl';
import NavigationBar from '../NavigationBar';

const leagueOptions = [
    {
        value: 0,
        label: 'All Leagues',
    },
    {
        value: 1,
        label: 'NBA',
    },
    {
        value: 2,
        label: 'NFL',
    },
];

const leagueOptionsMap: Record<number, League> = {
    1: League.NBA,
    2: League.NFL,
};

type StatsProps = {
    selectedTab: PnlTab;
    setSelectedTab: (tab: PnlTab) => void;
    currentRound: number;
};

const Stats: React.FC<StatsProps> = ({ selectedTab, setSelectedTab, currentRound }) => {
    const isMobile = useSelector(getIsMobile);
    const [round, setRound] = useState<number>(currentRound);
    const [league, setLeague] = useState<number>(0);
    const [showOnlyPP, setShowOnlyPP] = useState<boolean>(false);

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
                    <CheckboxContainer>
                        <Checkbox
                            checked={showOnlyPP}
                            value={showOnlyPP.toString()}
                            onChange={(e: any) => setShowOnlyPP(e.target.checked || false)}
                            label={t(`liquidity-pool.user-transactions.only-pp${isMobile ? '-short' : ''}`)}
                        />
                    </CheckboxContainer>
                    <SelectContainer width="150px">
                        <SelectInput
                            options={leagueOptions}
                            handleChange={(value) => setLeague(Number(value))}
                            defaultValue={league}
                            width={150}
                        />
                    </SelectContainer>
                </FiltersContainer>
                <NavigationWrapper>
                    <Header>
                        {!isMobile && <NavigationBar selectedTab={selectedTab} setSelectedTab={setSelectedTab} />}
                    </Header>
                    {isMobile && <NavigationBar selectedTab={selectedTab} setSelectedTab={setSelectedTab} />}
                </NavigationWrapper>
                {selectedTab == PnlTab.LP_STATS && (
                    <LpPnl round={round} leagueId={leagueOptionsMap[league]} onlyPP={showOnlyPP} />
                )}
                {selectedTab == PnlTab.USDC_USERS_PNL && (
                    <LpUsersPnl
                        lpCollateral={LiquidityPoolCollateral.USDC}
                        round={round}
                        leagueId={leagueOptionsMap[league]}
                        onlyPP={showOnlyPP}
                    />
                )}
                {selectedTab == PnlTab.WETH_USERS_PNL && (
                    <LpUsersPnl
                        lpCollateral={LiquidityPoolCollateral.WETH}
                        round={round}
                        leagueId={leagueOptionsMap[league]}
                        onlyPP={showOnlyPP}
                    />
                )}
                {selectedTab == PnlTab.THALES_USERS_PNL && (
                    <LpUsersPnl
                        lpCollateral={LiquidityPoolCollateral.THALES}
                        round={round}
                        leagueId={leagueOptionsMap[league]}
                        onlyPP={showOnlyPP}
                    />
                )}
                {selectedTab == PnlTab.USDC_TICKETS && (
                    <LpTickets
                        lpCollateral={LiquidityPoolCollateral.USDC}
                        round={round}
                        leagueId={leagueOptionsMap[league]}
                        onlyPP={showOnlyPP}
                    />
                )}
                {selectedTab == PnlTab.WETH_TICKETS && (
                    <LpTickets
                        lpCollateral={LiquidityPoolCollateral.WETH}
                        round={round}
                        leagueId={leagueOptionsMap[league]}
                        onlyPP={showOnlyPP}
                    />
                )}
                {selectedTab == PnlTab.THALES_TICKETS && (
                    <LpTickets
                        lpCollateral={LiquidityPoolCollateral.THALES}
                        round={round}
                        leagueId={leagueOptionsMap[league]}
                        onlyPP={showOnlyPP}
                    />
                )}
                {selectedTab == PnlTab.TICKETS && (
                    <AllLpTickets round={round} leagueId={leagueOptionsMap[league]} onlyPP={showOnlyPP} />
                )}
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

const SelectContainer = styled.div<{ width?: string }>`
    margin: 10px 0;
    width: ${(props) => props.width || '300px'};
`;

const CheckboxContainer = styled(FlexDivSpaceBetween)`
    label {
        align-self: center;
        font-size: 18px;
        text-transform: none;
    }
    @media (max-width: 575px) {
        font-size: 14px;
    }
`;

export default Stats;
