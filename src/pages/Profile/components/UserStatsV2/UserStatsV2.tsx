import useUsersStatsV2Query from 'queries/wallet/useUsersStatsV2Query';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow } from '../../../../styles/common';

const UserStats: React.FC = () => {
    const { t } = useTranslation();
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const userStatsQuery = useUsersStatsV2Query(walletAddress.toLowerCase(), networkId, { enabled: isWalletConnected });
    const userStats = userStatsQuery.isSuccess && userStatsQuery.data ? userStatsQuery.data : undefined;

    return (
        <Wrapper>
            <Header>Profile Data</Header>
            <Section>
                <Label>{t('profile.stats.total-volume')}</Label>
                <Value>{!userStats ? 0 : userStats.volume.toFixed(2)}</Value>
            </Section>
            <Section>
                <Label>{t('profile.stats.trades')}</Label>
                <Value>{!userStats ? 0 : userStats.trades}</Value>
            </Section>
            <Section>
                <Label>{t('profile.stats.highest-win')}</Label>
                <Value>{!userStats ? 0 : userStats.highestWin.toFixed(2)}</Value>
            </Section>
            <Section>
                <Label>{t('profile.stats.lifetime-wins')}</Label>
                <Value>{!userStats ? 0 : userStats.lifetimeWins}</Value>
            </Section>
        </Wrapper>
    );
};

const Header = styled(FlexDivRow)`
    font-weight: 600;
    font-size: 12px;
    color: #3c498a;
    text-transform: uppercase;
    padding: 15px 0;
    justify-content: center;
`;

const Wrapper = styled(FlexDivColumn)`
    background: ${(props) => props.theme.background.quinary};
    border-radius: 5px;
    width: 100%;
    padding: 8px 14px;
    gap: 4px;
    flex: initial;
`;

const Section = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const Label = styled.span`
    font-weight: 400;
    font-size: 12px;
    line-height: 20px;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.quaternary};
    @media (max-width: 950px) {
        line-height: 24px;
    }
`;

const Value = styled.span`
    font-weight: 700;
    font-size: 11px;
    line-height: 12px;
    letter-spacing: 0.025em;
    color: ${(props) => props.theme.status.win};
    margin-left: auto;
`;

export default UserStats;
