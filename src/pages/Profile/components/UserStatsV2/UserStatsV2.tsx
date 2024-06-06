import useUsersStatsV2Query from 'queries/wallet/useUsersStatsV2Query';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { formatCurrencyWithSign } from 'thales-utils';
import { USD_SIGN } from '../../../../constants/currency';
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
            <Header>
                <ProfileIcon className="icon icon--profile2" />
                {t('profile.stats.profile-data')}
            </Header>
            <Section>
                <Label>{t('profile.stats.total-volume')}</Label>
                <Value>{!userStats ? '-' : formatCurrencyWithSign(USD_SIGN, userStats.volume)}</Value>
            </Section>
            <Section>
                <Label>{t('profile.stats.trades')}</Label>
                <Value>{!userStats ? '-' : userStats.trades}</Value>
            </Section>
            <Section>
                <Label>{t('profile.stats.highest-win')}</Label>
                <Value>{!userStats ? '-' : formatCurrencyWithSign(USD_SIGN, userStats.highestWin)}</Value>
            </Section>
            <Section>
                <Label>{t('profile.stats.lifetime-wins')}</Label>
                <Value>{!userStats ? '-' : userStats.lifetimeWins}</Value>
            </Section>
        </Wrapper>
    );
};

const Header = styled(FlexDivRow)`
    font-weight: 600;
    font-size: 14px;
    color: ${(props) => props.theme.textColor.septenary};
    text-transform: uppercase;
    padding: 15px 0;
    justify-content: center;
    align-items: center;
`;

const Wrapper = styled(FlexDivColumn)`
    background: ${(props) => props.theme.background.quinary};
    border-radius: 5px;
    width: 100%;
    padding: 10px 15px 20px 15px;
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
    font-weight: 600;
    font-size: 12px;
    line-height: 20px;
    letter-spacing: 0.025em;
    color: ${(props) => props.theme.status.win};
    margin-left: auto;
`;

const ProfileIcon = styled.i`
    font-size: 20px;
    margin-right: 8px;
    font-weight: 400;
    text-transform: none;
    color: ${(props) => props.theme.textColor.septenary};
`;

export default UserStats;
