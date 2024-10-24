import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import useFreeBetCollateralBalanceQuery from 'queries/wallet/useFreeBetCollateralBalanceQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import useUsersStatsV2Query from 'queries/wallet/useUsersStatsV2Query';
import React, { Fragment, useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsConnectedViaParticle, getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { Coins, formatCurrency, formatCurrencyWithSign } from 'thales-utils';
import { isStableCurrency, sortCollateralBalances } from 'utils/collaterals';
import Button from '../../../../components/Button';
import { COLLATERAL_ICONS_CLASS_NAMES, CRYPTO_CURRENCY_MAP, USD_SIGN } from '../../../../constants/currency';
import { setStakingModalMuteEnd } from '../../../../redux/modules/ui';
import { FlexDivColumn, FlexDivColumnCentered, FlexDivRow } from '../../../../styles/common';
import { ThemeInterface } from '../../../../types/ui';

type UserStatsProps = {
    setForceOpenStakingModal: (forceOpenStakingModal: boolean) => void;
};

const UserStats: React.FC<UserStatsProps> = ({ setForceOpenStakingModal }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const theme: ThemeInterface = useTheme();

    const walletAddress = useSelector(getWalletAddress) || '';
    const isWalletConnected = useSelector(getIsWalletConnected);
    const networkId = useSelector(getNetworkId);
    const isAppReady = useSelector(getIsAppReady);
    const isParticle = useSelector(getIsConnectedViaParticle);

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

    const thalesBalance = multiCollateralBalances ? multiCollateralBalances[CRYPTO_CURRENCY_MAP.THALES as Coins] : 0;

    return (
        <>
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
                                            <CurrencyIcon
                                                className={COLLATERAL_ICONS_CLASS_NAMES[currencyKey as Coins]}
                                            />
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
                                            <CurrencyIcon
                                                className={COLLATERAL_ICONS_CLASS_NAMES[currencyKey as Coins]}
                                            />
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
            </Wrapper>
            {!isParticle && thalesBalance > 0 && (
                <Wrapper>
                    <SectionWrapper>
                        <Title>{t('profile.stats.stake-title')}</Title>
                        <Section>
                            <SubLabel>
                                <CurrencyIcon
                                    className={COLLATERAL_ICONS_CLASS_NAMES[CRYPTO_CURRENCY_MAP.THALES as Coins]}
                                />
                                {CRYPTO_CURRENCY_MAP.THALES}
                            </SubLabel>
                            <SubValue>{formatCurrency(thalesBalance)}</SubValue>
                        </Section>
                        <Button
                            backgroundColor={theme.button.textColor.tertiary}
                            borderColor={theme.button.textColor.tertiary}
                            height="24px"
                            margin="10px 0 5px 0"
                            padding="2px 40px"
                            width="fit-content"
                            fontSize="16px"
                            fontWeight="800"
                            lineHeight="16px"
                            additionalStyles={additionalButtonStyles}
                            onClick={() => {
                                setForceOpenStakingModal(true);
                                dispatch(setStakingModalMuteEnd(0));
                            }}
                        >
                            {t('profile.stats.stake-label')}
                        </Button>
                        <Description>
                            <Trans
                                i18nKey={'profile.stats.weekly-rewards'}
                                components={{
                                    stakingPageLink: (
                                        <StakingPageLink
                                            href={'https://www.thales.io/token/staking'}
                                            target="_blank"
                                            rel="noreferrer"
                                        />
                                    ),
                                }}
                            />
                        </Description>
                    </SectionWrapper>
                </Wrapper>
            )}
        </>
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

const Description = styled.span`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 13px;
    line-height: 15px;
    font-weight: 500;
    text-align: center;
    margin: 10px 0;
`;

const Title = styled(Description)``;

const Wrapper = styled(FlexDivColumn)`
    background: ${(props) => props.theme.background.quinary};
    border-radius: 5px;
    width: 100%;
    padding: 10px 15px 15px 15px;
    gap: 4px;
    flex: initial;
    margin-bottom: 5px;
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

const SectionWrapper = styled(FlexDivColumnCentered)`
    width: 100%;
`;

const StakingPageLink = styled.a`
    color: ${(props) => props.theme.link.textColor.primary};
    &:hover {
        text-decoration: underline;
    }
`;

const additionalButtonStyles = {
    alignSelf: 'center',
};

export default UserStats;
