import useUserVaultsDataQuery from 'queries/vault/useUserVaultsDataQuery';
import useUsersStatsV2Query from 'queries/wallet/useUsersStatsV2Query';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { UserVaultsData } from 'types/vault';

const UserStats: React.FC = () => {
    const { t } = useTranslation();
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const userStatsQuery = useUsersStatsV2Query(walletAddress.toLowerCase(), networkId, { enabled: isWalletConnected });
    const userStats = userStatsQuery.isSuccess && userStatsQuery.data ? userStatsQuery.data : undefined;

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
                    <Value>{!userStats ? 0 : userStats.volume.toFixed(2)}</Value>
                    <CurrencyLabel>USD</CurrencyLabel>
                </Section>
                <Separator />
                <Section>
                    <Label>{t('profile.stats.trades')}</Label>
                    <Value>{!userStats ? 0 : userStats.trades}</Value>
                </Section>
                <Separator />
                <Section>
                    <Label>{t('profile.stats.highest-win')}</Label>
                    <Value>{!userStats ? 0 : userStats.highestWin.toFixed(2)}</Value>
                    <CurrencyLabel>USD</CurrencyLabel>
                </Section>
                <Separator className="mobile-hide" />
                <Section>
                    <Label>{t('profile.stats.lifetime-wins')}</Label>
                    <Value>{!userStats ? 0 : userStats.lifetimeWins}</Value>
                </Section>
                <Separator />
                <Section>
                    <Label>{t('profile.stats.in-vaults')}</Label>
                    <Value>{!vaultsData ? 0 : vaultsData.balanceTotal.toFixed(2)}</Value>
                    <CurrencyLabel>USD</CurrencyLabel>
                </Section>
            </SectionWrapper>
        </Wrapper>
    );
};

const Wrapper = styled.div`
    margin-top: 30px;
    display: flex;
    background: ${(props) => props.theme.background.secondary};
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
    color: ${(props) => props.theme.textColor.primary};
    margin: 10px 0px 5px 0px;
`;

const Separator = styled.div`
    width: 2px;
    height: 56px;
    margin-top: 8px;
    background: ${(props) => props.theme.background.tertiary};
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
    color: ${(props) => props.theme.textColor.primary};
`;

const Value = styled.span`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 800;
    font-size: 19px;
    line-height: 23px;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.quaternary};
    text-align: right;
`;

export default UserStats;
