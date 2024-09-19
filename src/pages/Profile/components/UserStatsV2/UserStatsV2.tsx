import { COLLATERAL_ICONS_CLASS_NAMES, USD_SIGN } from 'constants/currency';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import useFreeBetCollateralBalanceQuery from 'queries/wallet/useFreeBetCollateralBalanceQuery';
import useLpStatsV2Query from 'queries/wallet/useLpStatsV2Query';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import useUsersStatsV2Query from 'queries/wallet/useUsersStatsV2Query';
import React, { Fragment, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow } from 'styles/common';
import { formatCurrencyWithKey, formatCurrencyWithSign } from 'thales-utils';
import { Coins } from 'thales-utils';
import { isStableCurrency, sortCollateralBalances } from 'utils/collaterals';

const UserStats: React.FC = () => {
    const { t } = useTranslation();

    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));

    const userStatsQuery = useUsersStatsV2Query(walletAddress.toLowerCase(), networkId, { enabled: isWalletConnected });
    const userStats = userStatsQuery.isSuccess && userStatsQuery.data ? userStatsQuery.data : undefined;

    const freeBetBalancesQuery = useFreeBetCollateralBalanceQuery(walletAddress?.toLowerCase(), networkId, {
        enabled: isWalletConnected,
    });
    const freeBetBalances =
        freeBetBalancesQuery.isSuccess && freeBetBalancesQuery.data ? freeBetBalancesQuery.data : undefined;

    const isFreeBetExists = freeBetBalances && !!Object.values(freeBetBalances).find((balance) => !!balance);

    const exchangeRatesQuery = useExchangeRatesQuery(networkId, {
        enabled: isAppReady,
    });
    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    const multiCollateralBalancesQuery = useMultipleCollateralBalanceQuery(walletAddress?.toLowerCase(), networkId, {
        enabled: isWalletConnected,
    });
    const multiCollateralBalances =
        multiCollateralBalancesQuery.isSuccess && multiCollateralBalancesQuery.data
            ? multiCollateralBalancesQuery.data
            : undefined;

    const getUSDForCollateral = useCallback(
        (collateral: Coins, freeBetBalance?: boolean) => {
            if (freeBetBalance)
                return (
                    (freeBetBalances ? freeBetBalances[collateral] : 0) *
                    (isStableCurrency(collateral as Coins) ? 1 : exchangeRates?.[collateral] || 0)
                );
            return (
                (multiCollateralBalances ? multiCollateralBalances[collateral] : 0) *
                (isStableCurrency(collateral as Coins) ? 1 : exchangeRates?.[collateral] || 0)
            );
        },

        [freeBetBalances, exchangeRates, multiCollateralBalances]
    );

    const freeBetCollateralsSorted = useMemo(() => {
        const sortedBalances = sortCollateralBalances(freeBetBalances, exchangeRates, networkId, 'desc');

        return sortedBalances;
    }, [exchangeRates, freeBetBalances, networkId]);

    const multiCollateralsSorted = useMemo(() => {
        const sortedBalances = sortCollateralBalances(multiCollateralBalances, exchangeRates, networkId, 'desc');

        return sortedBalances;
    }, [exchangeRates, multiCollateralBalances, networkId]);

    const lpStatsQuery = useLpStatsV2Query(networkId);
    const lpStats = lpStatsQuery.isSuccess && lpStatsQuery.data ? lpStatsQuery.data : [];

    return (
        <Wrapper>
            <SectionWrapper>
                <Header>
                    <ProfileIcon className="icon icon--profile3" />
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
                <Section>
                    <Label>PnL</Label>
                    <Value>{!userStats ? '-' : formatCurrencyWithSign(USD_SIGN, userStats.pnl, 2)}</Value>
                </Section>
            </SectionWrapper>
            {isFreeBetExists && (
                <SectionWrapper>
                    <SubHeaderWrapper>
                        <SubHeader>
                            <SubHeaderIcon className="icon icon--gift" />
                            {t('profile.stats.free-bet')}
                        </SubHeader>
                    </SubHeaderWrapper>
                    {freeBetBalances &&
                        Object.keys(freeBetCollateralsSorted).map((currencyKey) => {
                            return freeBetBalances[currencyKey] ? (
                                <Section key={`${currencyKey}-freebet`}>
                                    <SubLabel>
                                        <CurrencyIcon className={COLLATERAL_ICONS_CLASS_NAMES[currencyKey as Coins]} />
                                        {currencyKey}
                                    </SubLabel>
                                    <SubValue>
                                        {formatCurrencyWithSign(
                                            null,
                                            freeBetBalances ? freeBetBalances[currencyKey] : 0
                                        )}
                                        {!exchangeRates?.[currencyKey] && !isStableCurrency(currencyKey as Coins)
                                            ? '...'
                                            : ` (${formatCurrencyWithSign(
                                                  USD_SIGN,
                                                  getUSDForCollateral(currencyKey as Coins, true)
                                              )})`}
                                    </SubValue>
                                </Section>
                            ) : (
                                <Fragment key={`${currencyKey}-freebet`} />
                            );
                        })}
                </SectionWrapper>
            )}
            {multiCollateralBalances && (
                <SectionWrapper>
                    <SubHeaderWrapper>
                        <SubHeader>
                            <SubHeaderIcon className="icon icon--wallet-connected" />
                            {t('profile.stats.wallet')}
                        </SubHeader>
                    </SubHeaderWrapper>
                    {freeBetBalances &&
                        Object.keys(multiCollateralsSorted).map((currencyKey) => {
                            return multiCollateralBalances[currencyKey] ? (
                                <Section key={currencyKey}>
                                    <SubLabel>
                                        <CurrencyIcon className={COLLATERAL_ICONS_CLASS_NAMES[currencyKey as Coins]} />
                                        {currencyKey}
                                    </SubLabel>
                                    <SubValue>
                                        {formatCurrencyWithSign(
                                            null,
                                            multiCollateralBalances ? multiCollateralBalances[currencyKey] : 0
                                        )}
                                        {!exchangeRates?.[currencyKey] && !isStableCurrency(currencyKey as Coins)
                                            ? '...'
                                            : ` (${formatCurrencyWithSign(
                                                  USD_SIGN,
                                                  getUSDForCollateral(currencyKey as Coins)
                                              )})`}
                                    </SubValue>
                                </Section>
                            ) : (
                                <Fragment key={currencyKey} />
                            );
                        })}
                </SectionWrapper>
            )}
            <SectionWrapper>
                <SubHeaderWrapper>
                    <SubHeader>
                        <SubHeaderIcon className="icon icon--yield" />
                        LP Stats
                    </SubHeader>
                </SubHeaderWrapper>
                {lpStats.map((stats, index) => {
                    return index === 3 ? (
                        <Section key={stats.name}>
                            <Label>
                                <CurrencyIcon className="icon icon--yield" />
                                {stats.name}
                            </Label>
                            <Value>{formatCurrencyWithSign(USD_SIGN, stats.pnlInUsd, 2)}</Value>
                        </Section>
                    ) : (
                        <Section key={stats.name}>
                            <Label>
                                <CurrencyIcon className={COLLATERAL_ICONS_CLASS_NAMES[stats.name as Coins]} />{' '}
                                {stats.name}
                            </Label>
                            <Value>{`${formatCurrencyWithKey(stats.name, stats.pnl, 2)} (${formatCurrencyWithSign(
                                USD_SIGN,
                                stats.pnlInUsd,
                                2
                            )})`}</Value>
                        </Section>
                    );
                })}
            </SectionWrapper>
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
    display: flex;
    align-items: center;
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

const SubLabel = styled(Label)`
    font-weight: 400;
    text-transform: none;
`;

const Value = styled.span`
    font-weight: 600;
    font-size: 12px;
    line-height: 20px;
    letter-spacing: 0.025em;
    color: ${(props) => props.theme.status.win};
    margin-left: auto;
`;

const SubValue = styled(Value)`
    color: ${(props) => props.theme.textColor.quaternary};
`;

const ProfileIcon = styled.i`
    font-size: 20px;
    margin-right: 4px;
    font-weight: 400;
    text-transform: none;
    color: ${(props) => props.theme.textColor.septenary};
`;

const SubHeaderIcon = styled.i`
    font-size: 20px;
    margin-right: 4px;
    font-weight: 400;
    text-transform: none;
`;

const SubHeaderWrapper = styled(FlexDivRow)`
    &::after,
    &:before {
        display: inline-block;
        content: '';
        border-top: 2px solid ${(props) => props.theme.borderColor.senary};
        width: 100%;
        margin-top: 40px;
        transform: translateY(-1rem);
    }
`;

const SubHeader = styled(Header)`
    width: 300px;
`;

const CurrencyIcon = styled.i`
    font-size: 20px !important;
    margin: 0 3px 3px 3px;
    font-weight: 400 !important;
    text-transform: none !important;
    color: ${(props) => props.theme.textColor.quaternary};
`;

const SectionWrapper = styled.div`
    width: 100%;
`;

export default UserStats;
