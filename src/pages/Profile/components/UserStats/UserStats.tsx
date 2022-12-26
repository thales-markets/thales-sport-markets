import useWinningInfoQuery from 'queries/markets/useWinningInfoQuery';
import useUserVaultsDataQuery from 'queries/vault/useUserVaultsDataQuery';
import useUsersStatsQuery from 'queries/wallet/useUsersStatsQuery';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { WinningInfo } from 'types/markets';
import { UserVaultsData } from 'types/vault';

const UserStats: React.FC<{ openPositionsValue: number }> = ({ openPositionsValue }) => {
    const { t } = useTranslation();
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const userStatQuery = useUsersStatsQuery(walletAddress.toLowerCase(), networkId, { enabled: isWalletConnected });
    const user = userStatQuery.isSuccess ? userStatQuery.data[0] : { id: '', trades: 0, volume: 0, pnl: 0 };
    const winningInfoQuery = useWinningInfoQuery(walletAddress.toLowerCase(), networkId, {
        enabled: isWalletConnected,
    });
    const winningInfo = winningInfoQuery.isSuccess
        ? (winningInfoQuery.data as WinningInfo)
        : { highestWin: 0, lifetimeWins: 0 };

    const userVaultsDataQuery = useUserVaultsDataQuery(walletAddress.toLowerCase(), networkId, {
        enabled: isWalletConnected,
    });

    const vaultsData = userVaultsDataQuery.isSuccess
        ? (userVaultsDataQuery.data as UserVaultsData)
        : { balanceTotal: 0 };

    return (
        <Wrapper>
            <SectionWrapper>
                <Section>
                    <Label>{t('profile.stats.total-volume')}</Label>
                    <Value>{!user ? 0 : user.volume.toFixed(2)}</Value>
                    <CurrencyLabel>USD</CurrencyLabel>
                </Section>
                <Separator />
                <Section>
                    <Label>{t('profile.stats.trades')}</Label>
                    <Value>{!user ? 0 : user.trades}</Value>
                </Section>
                <Separator />
                <Section>
                    <Label>{t('profile.stats.highest-win')}</Label>
                    <Value>{!user ? 0 : winningInfo.highestWin.toFixed(2)}</Value>
                    <CurrencyLabel>USD</CurrencyLabel>
                </Section>
                <Separator className="mobile-hide" />
                <Section>
                    <Label>{t('profile.stats.lifetime-wins')}</Label>
                    <Value>{!user ? 0 : winningInfo.lifetimeWins}</Value>
                </Section>
                <Separator />
                <Section>
                    <Label>{t('profile.stats.in-vaults')}</Label>
                    <Value>{!user ? 0 : vaultsData.balanceTotal.toFixed(2)}</Value>
                    <CurrencyLabel>USD</CurrencyLabel>
                </Section>
                <Separator />
                <Section>
                    <Label>P&L</Label>
                    <Value>{!user ? 0 : (user.pnl + openPositionsValue).toFixed(2)}</Value>
                    <CurrencyLabel>USD</CurrencyLabel>
                </Section>
            </SectionWrapper>
        </Wrapper>
    );
};

const Wrapper = styled.div`
    margin-top: 30px;
    display: flex;
    background: #303656;
    border-radius: 5px;
    width: 100%;
    flex-wrap: wrap;
    flex-direction: column;
    padding: 8px 14px;
    gap: 4px;
`;

const SectionWrapper = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
`;

const Section = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: flex-start;
    flex: 1;
    align-items: center;
    @media (max-width: 600px) {
        flex-basis: 32%;
    }
`;

const Label = styled.span`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 400;
    font-size: 11px;
    line-height: 11px;
    text-transform: uppercase;
    color: #ffffff;
    margin: 10px 0px 5px 0px;
`;

const Separator = styled.div`
    width: 2px;
    height: 56px;
    margin-top: 8px;
    background: ${(props) => props.theme.button.background.secondary};
    border-radius: 5px;
    @media (max-width: 600px) {
        &.mobile-hide {
            display: none;
        }
    }
`;

const CurrencyLabel = styled.span`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 12px;
    text-transform: uppercase;
    color: #ffffff;
`;

const Value = styled.span`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 800;
    font-size: 19px;
    line-height: 23px;
    text-transform: uppercase;
    color: #3fd1ff;
    text-align: right;
`;

export default UserStats;
