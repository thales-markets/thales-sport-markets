import ETHIcon from 'assets/currencies/ETH.svg';
import { USD_SIGN } from 'constants/currency';
import { ScreenSizeBreakpoint } from 'enums/ui';
import useOverdropLeaderboardQuery from 'queries/overdrop/useOverdropLeaderboardQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivSpaceBetween } from 'styles/common';
import { formatCurrency, formatCurrencyWithSign } from 'thales-utils';
import { Rates } from 'types/collateral';
import { getCurrentSeasonAndMiniSeason } from 'utils/overdrop';
import { useAccount, useChainId, useClient } from 'wagmi';

const EstimateRewards: React.FC = () => {
    const { address } = useAccount();

    const currentSeason = getCurrentSeasonAndMiniSeason();
    const networkId = useChainId();
    const client = useClient();

    const leaderboardQuery = useOverdropLeaderboardQuery(currentSeason.season, currentSeason.miniSeason);
    const exchangeRatesQuery = useExchangeRatesQuery({ networkId, client });

    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    const userData = useMemo(() => {
        if (leaderboardQuery.isSuccess) {
            const data = leaderboardQuery.data.find((row) => row.address === address);
            return data;
        }
    }, [leaderboardQuery.isSuccess, leaderboardQuery.data, address]);

    const estimateRewardsInUSD = useMemo(() => {
        if (userData && exchangeRates) {
            const estimate = userData.rewards.eth * exchangeRates['ETH'];
            return estimate;
        }
        return 0;
    }, [userData, exchangeRates]);

    return userData ? (
        <Wrapper>
            <FullWidthSpaceBetween>
                <Label>This month rewards</Label>
                <FlexDivCentered gap={8}>
                    <img height="36px" src={ETHIcon} />
                    <RewardsETH>{formatCurrency(userData?.rewards.eth || 0, 6)}</RewardsETH>
                    <ETHLabel>ETHEREUM</ETHLabel>
                </FlexDivCentered>
            </FullWidthSpaceBetween>
            <RewardsWrapper>
                <Rewards>{formatCurrencyWithSign(USD_SIGN, estimateRewardsInUSD, 2)}</Rewards>
            </RewardsWrapper>
        </Wrapper>
    ) : (
        <></>
    );
};

export default EstimateRewards;

const Wrapper = styled(FlexDivCentered)`
    height: 52px;
    background: ${(props) => props.theme.overdrop.background.active};
    padding: 10px;
    border-radius: 6px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        flex-direction: column;
        height: auto;
        padding: 10px 0;
    }
`;

const FullWidthSpaceBetween = styled(FlexDivSpaceBetween)`
    width: 100%;
`;

const Label = styled.p`
    font-size: 12px;
    font-style: normal;
    font-weight: 600;
    line-height: 16px; /* 133.333% */
    letter-spacing: 0.3px;
    color: ${(props) => props.theme.textColor.secondary};
    text-transform: uppercase;
    text-align: center;
    max-width: 100px;
`;

const RewardsWrapper = styled.div`
    width: 100%;
    border-left: 2px solid ${(props) => props.theme.overdrop.borderColor.quaternary};
    display: flex;
    align-items: center;
    margin-left: 10px;
    padding-left: 30px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        flex-direction: column;
        height: auto;
        border-top: 2px solid ${(props) => props.theme.overdrop.borderColor.quaternary};
        border-left: none;
        padding: 0;
        margin: 0;
        margin-top: 10px;
        padding-top: 10px;
    }
`;

const Rewards = styled.p`
    color: #ffb600;

    font-size: 18px;
    font-style: normal;
    font-weight: 800;
    line-height: 36px;
`;

const RewardsETH = styled.p`
    font-size: 16px;
    font-style: normal;
    font-weight: 800;
    line-height: normal;
`;

const ETHLabel = styled(Label)`
    margin-right: 20px;
`;
