import { useAuthCore } from '@particle-network/authkit';
import Button from 'components/Button';
import Toggle from 'components/Toggle';
import { getErrorToastOptions, getInfoToastOptions } from 'config/toast';
import { COLLATERAL_ICONS_CLASS_NAMES, USD_SIGN } from 'constants/currency';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import useLocalStorage from 'hooks/useLocalStorage';
import useGetFreeBetQuery from 'queries/freeBets/useGetFreeBetQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useFreeBetCollateralBalanceQuery from 'queries/wallet/useFreeBetCollateralBalanceQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import useUsersStatsV2Query from 'queries/wallet/useUsersStatsV2Query';
import React, { Fragment, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getIsBiconomy, setIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import {
    Colors,
    FlexDivColumn,
    FlexDivColumnCentered,
    FlexDivColumnStart,
    FlexDivRow,
    FlexDivSpaceBetween,
    FlexDivStart,
} from 'styles/common';
import { Coins, formatCurrencyWithSign, localStore, truncateAddress } from 'thales-utils';
import { Rates } from 'types/collateral';
import { FreeBet } from 'types/freeBet';
import { RootState } from 'types/redux';

import { isStableCurrency, sortCollateralBalances } from 'utils/collaterals';

import { claimFreeBet } from 'utils/freeBet';
import useBiconomy from 'utils/useBiconomy';

import { useAccount, useChainId, useClient } from 'wagmi';

const UserStats: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const networkId = useChainId();
    const client = useClient();

    const { userInfo } = useAuthCore();

    const { address, isConnected } = useAccount();
    const smartAddress = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddress : address) || '';

    const [freeBet, setFreeBet] = useLocalStorage<FreeBet | undefined>(LOCAL_STORAGE_KEYS.FREE_BET_ID, undefined);

    const history = useHistory();

    const userStatsQuery = useUsersStatsV2Query(walletAddress, { networkId, client }, { enabled: isConnected });
    const userStats = userStatsQuery.isSuccess && userStatsQuery.data ? userStatsQuery.data : undefined;

    const freeBetBalancesQuery = useFreeBetCollateralBalanceQuery(
        walletAddress,
        { networkId, client },
        {
            enabled: isConnected,
        }
    );
    const freeBetBalances =
        freeBetBalancesQuery.isSuccess && freeBetBalancesQuery.data ? freeBetBalancesQuery.data : undefined;

    const freeBetQuery = useGetFreeBetQuery(freeBet?.id || '', networkId, { enabled: !!freeBet?.id });

    const freeBetFromServer = useMemo(
        () =>
            freeBetQuery.isSuccess && freeBetQuery.data && freeBet?.id
                ? { ...freeBetQuery.data, id: freeBet?.id }
                : null,
        [freeBetQuery.data, freeBetQuery.isSuccess, freeBet?.id]
    );

    const isFreeBetExists = freeBetBalances && !!Object.values(freeBetBalances).find((balance) => !!balance);

    const exchangeRatesQuery = useExchangeRatesQuery({ networkId, client });
    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    const multiCollateralBalancesQuery = useMultipleCollateralBalanceQuery(
        walletAddress,
        { networkId, client },
        {
            enabled: isConnected,
        }
    );
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

    const onClaimFreeBet = useCallback(() => claimFreeBet(walletAddress, freeBet?.id, networkId, setFreeBet, history), [
        walletAddress,
        freeBet,
        setFreeBet,
        history,
        networkId,
    ]);

    const userLoginInfo = useMemo(() => {
        if (userInfo && userInfo.thirdparty_user_info && userInfo.thirdparty_user_info.user_info) {
            return userInfo.thirdparty_user_info.user_info;
        }
        return null;
    }, [userInfo]);

    const handleCopy = (address: string) => {
        const id = toast.loading(t('deposit.copying-address'), { autoClose: 1000 });
        try {
            navigator.clipboard.writeText(address);
            toast.update(id, {
                ...getInfoToastOptions(t('deposit.copied') + ': ' + truncateAddress(address, 6, 4)),
                autoClose: 2000,
            });
        } catch (e) {
            toast.update(id, getErrorToastOptions('Error'));
        }
    };

    const claimFreeBetButtonVisible =
        !!freeBetFromServer &&
        !freeBetFromServer?.claimSuccess &&
        (!freeBetFromServer.claimAddress ||
            freeBetFromServer.claimAddress.toLowerCase() === walletAddress.toLowerCase());

    return (
        <Wrapper>
            <SectionWrapper>
                <Header>
                    <ProfileIcon className="icon icon--profile3" />
                    {t('profile.stats.account-info')}
                </Header>

                <FlexDivStart gap={8}>
                    <FlexDivColumnStart gap={10}>
                        <Section>
                            <Text>{t('profile.dropdown.account')}</Text>

                            <Toggle
                                height="24px"
                                active={!isBiconomy}
                                handleClick={() => {
                                    if (isBiconomy) {
                                        dispatch(setIsBiconomy(false));
                                        localStore.set(LOCAL_STORAGE_KEYS.USE_BICONOMY, false);
                                    } else {
                                        dispatch(setIsBiconomy(true));
                                        localStore.set(LOCAL_STORAGE_KEYS.USE_BICONOMY, true);
                                    }
                                }}
                            />
                            <Text>{t('profile.dropdown.eoa')}</Text>
                        </Section>
                        <Separator />
                        <Section>
                            <Container>
                                <WalletIcon active={isBiconomy} className="icon icon--wallet-connected" />
                                <Text active={isBiconomy}>{t('profile.dropdown.account')}</Text>
                            </Container>
                            <Container
                                onClick={() => {
                                    handleCopy(smartAddress);
                                }}
                            >
                                <Address active={isBiconomy}>{truncateAddress(smartAddress, 6, 4)}</Address>
                                <CopyIcon active={isBiconomy} className="icon icon--copy" />
                            </Container>
                        </Section>

                        <Section>
                            <Container>
                                <WalletIcon active={!isBiconomy} className="icon icon--wallet-connected" />
                                <Text active={!isBiconomy}>{t('profile.dropdown.eoa')}</Text>
                            </Container>
                            <Container
                                onClick={() => {
                                    handleCopy(address as any);
                                }}
                            >
                                <Address active={!isBiconomy}>{truncateAddress(address as any, 6, 4)}</Address>
                                <CopyIcon active={!isBiconomy} className="icon icon--copy" />
                            </Container>
                        </Section>

                        {userLoginInfo && (
                            <>
                                <Separator />
                                <Section>
                                    <Label> {t('profile.stats.email')}:</Label>
                                    <Value>{userLoginInfo.email}</Value>
                                </Section>
                                <Section>
                                    <Label>{t('profile.stats.name')}:</Label>
                                    <Value>{userLoginInfo.name}</Value>
                                </Section>
                            </>
                        )}
                    </FlexDivColumnStart>
                </FlexDivStart>
            </SectionWrapper>

            <SectionWrapper>
                <SubHeaderWrapper>
                    <SubHeader>
                        <ProfileIcon className="icon icon--resources" />
                        {t('profile.stats.profile-data')}
                    </SubHeader>
                </SubHeaderWrapper>

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
            {claimFreeBetButtonVisible && (
                <ClaimBetButton
                    onClick={onClaimFreeBet}
                    borderColor="none"
                    height="42px"
                    lineHeight="16px"
                    padding="0"
                    backgroundColor={Colors.YELLOW}
                    className="pulse"
                >
                    {t('profile.account-summary.claim-free-bet')}
                    <HandsIcon className="icon icon--hands-coins" />
                </ClaimBetButton>
            )}
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
    padding: 10px 15px 15px 15px;
    gap: 4px;
    flex: initial;
    margin-bottom: 8px;
`;

const Section = styled(FlexDivSpaceBetween)`
    position: relative;
    width: 100%;
`;

const AlignedParagraph = styled.p`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Label = styled(AlignedParagraph)`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 14px;
    font-weight: 500;
    white-space: pre;
`;

const SubLabel = styled(Label)`
    font-weight: 400;
    text-transform: none;
`;

const Value = styled(AlignedParagraph)`
    color: ${(props) => props.theme.textColor.quaternary};
    font-size: 14px;
    line-height: 14px;
    font-weight: 700;
    white-space: pre;
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
    gap: 8px;
`;

const HandsIcon = styled.i`
    font-weight: 500;
    margin-left: 5px;
    font-size: 22px;
    color: ${(props) => props.theme.textColor.tertiary};
`;

const ClaimBetButton = styled(Button)`
    &.pulse {
        animation: pulsing 1.5s ease-in;
        animation-iteration-count: infinite;
        @keyframes pulsing {
            0% {
                box-shadow: 0 0 0 0px rgba(237, 185, 41, 0.6);
            }
            50% {
                box-shadow: 0 0 0 0px rgba(237, 185, 41, 0.4);
            }
            100% {
                box-shadow: 0 0 0 20px rgba(237, 185, 41, 0);
            }
        }
    }
`;

const CopyIcon = styled.i<{ active?: boolean }>`
    cursor: pointer;
    text-transform: lowercase;
    color: ${(props) => (props.active ? props.theme.textColor.quaternary : props.theme.textColor.primary)};
`;

const WalletIcon = styled.i<{ active?: boolean }>`
    font-size: 18px;
    width: 20px;
    color: ${(props) => (props.active ? props.theme.textColor.quaternary : props.theme.textColor.primary)};
`;

const Text = styled.span<{ active?: boolean }>`
    position: relative;
    font-weight: 600;
    font-size: 14px;
    line-height: 14px;
    white-space: pre;
    text-align: left;
    color: ${(props) => (props.active ? props.theme.textColor.quaternary : props.theme.textColor.primary)};
`;

const Container = styled.div<{ clickable?: boolean }>`
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};
    &:hover {
        i,
        span {
            color: ${(props) => (props.clickable ? props.theme.textColor.quaternary : '')};
        }
    }
`;

const Separator = styled.p`
    position: relative;
    height: 2px;
    margin: 10px 0;
    width: 100%;
    background: ${(props) => props.theme.background.senary};
`;

const Address = styled(Text)<{ active: boolean }>`
    cursor: pointer;
    color: ${(props) => (props.active ? props.theme.textColor.quaternary : props.theme.textColor.primary)};
`;

export default UserStats;
