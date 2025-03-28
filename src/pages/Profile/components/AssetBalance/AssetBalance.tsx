import ConvertIcon from 'assets/images/svgs/convert.svg?react';
import DepositFromWallet from 'components/DepositFromWallet/DepositFromWallet';
import FundModal from 'components/FundOvertimeAccountModal';
import SwapModal from 'components/SwapModal/SwapModal';
import ThalesToOverMigrationModal from 'components/ThalesToOverMigrationModal';
import Toggle from 'components/Toggle';
import { COLLATERAL_ICONS_CLASS_NAMES, USD_SIGN } from 'constants/currency';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import useLocalStorage from 'hooks/useLocalStorage';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivEnd } from 'styles/common';
import { Coins, formatCurrencyWithKey } from 'thales-utils';
import { Rates } from 'types/collateral';
import { RootState } from 'types/redux';
import { getCollateralIndex, getCollaterals } from 'utils/collaterals';
import useBiconomy from 'utils/useBiconomy';
import { useAccount, useChainId, useClient } from 'wagmi';
import WithdrawModal from '../WithdrawModal';

const AssetBalance: React.FC = () => {
    const { t } = useTranslation();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const smartAddres = useBiconomy();
    const theme = useTheme();
    const [showThalesToOverMigrationModal, setShowThalesToOverMigrationModal] = useState<boolean>(false);
    const [showFundModal, setShowFundModal] = useState<boolean>(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
    const [showSwapModal, setShowSwapModal] = useState<boolean>(false);
    const [showDepositFromWallet, setShowDepositFromWallet] = useState<boolean>(false);

    const [convertToken, setConvertToken] = useState(0);

    const [showZeroBalance, setShowZeroBalance] = useLocalStorage(LOCAL_STORAGE_KEYS.SHOW_ZERO_BALANCE, true);

    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(
        smartAddres,
        { networkId, client },
        {
            enabled: isConnected,
        }
    );

    const multipleCollateralBalancesEOA = useMultipleCollateralBalanceQuery(
        address as any,
        { networkId, client },
        {
            enabled: isConnected,
        }
    );

    const exchangeRatesQuery = useExchangeRatesQuery({ networkId, client });

    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    const usersAssets = useMemo(() => {
        try {
            if (exchangeRates && multipleCollateralBalances.data && multipleCollateralBalancesEOA.data) {
                const smartAssets: Array<{
                    asset: Coins;
                    balance: number;
                    value: number;
                    isBiconomy: boolean;
                }> = [];
                const eoaAssets: Array<{
                    asset: Coins;
                    balance: number;
                    value: number;
                    isBiconomy: boolean;
                }> = [];
                getCollaterals(networkId).forEach((token) => {
                    smartAssets.push({
                        asset: token,
                        balance: multipleCollateralBalances.data[token],
                        value:
                            multipleCollateralBalances.data[token] * (exchangeRates[token] ? exchangeRates[token] : 1),
                        isBiconomy: true,
                    });
                    eoaAssets.push({
                        asset: token,
                        balance: multipleCollateralBalancesEOA.data[token],
                        value:
                            multipleCollateralBalancesEOA.data[token] *
                            (exchangeRates[token] ? exchangeRates[token] : 1),
                        isBiconomy: false,
                    });
                });

                return {
                    smartAssets: smartAssets
                        .sort((a, b) => {
                            return b.value - a.value;
                        })
                        .filter((tokenData) => {
                            if (showZeroBalance) {
                                return true;
                            } else {
                                return tokenData.value !== 0;
                            }
                        }),
                    eoaAssets: eoaAssets
                        .sort((a, b) => {
                            return b.value - a.value;
                        })
                        .filter((tokenData) => {
                            if (showZeroBalance) {
                                return true;
                            } else {
                                return tokenData.value !== 0;
                            }
                        }),
                };
            }

            return { smartAssets: [], eoaAssets: [] };
        } catch (e) {
            return { smartAssets: [], eoaAssets: [] };
        }
    }, [
        exchangeRates,
        multipleCollateralBalancesEOA.data,
        multipleCollateralBalances.data,
        networkId,
        showZeroBalance,
    ]);

    const thalesBalance = useMemo(() => {
        if (multipleCollateralBalancesEOA && multipleCollateralBalancesEOA.data && exchangeRates)
            return {
                asset: 'THALES',
                balance: multipleCollateralBalancesEOA.data['THALES'],
                value:
                    multipleCollateralBalancesEOA.data['THALES'] *
                    (exchangeRates['THALES'] ? exchangeRates['THALES'] : 1),
            };
    }, [exchangeRates, multipleCollateralBalancesEOA]);

    return (
        <GridContainer>
            <ButtonContainer>
                <Button onClick={() => setShowSwapModal(true)}>{t('profile.account-summary.swap')}</Button>
                <Button onClick={() => setShowFundModal(true)}>{t('profile.account-summary.deposit')}</Button>
                <Button onClick={() => setShowWithdrawModal(true)}>{t('profile.account-summary.withdraw')}</Button>
            </ButtonContainer>

            <AssetContainer>
                <TableHeader> {t('profile.asset-balance.assets')}</TableHeader>
                <TableHeader2> {t('profile.asset-balance.amount')}</TableHeader2>
                <TableHeader2> {t('profile.asset-balance.value')}</TableHeader2>
                <ZeroBalanceWrapper>
                    <TableHeader2> {t('profile.asset-balance.zero-balance')}</TableHeader2>
                    <Toggle
                        dotBackground={showZeroBalance ? theme.borderColor.quaternary : ''}
                        active={showZeroBalance}
                        handleClick={() => setShowZeroBalance(!showZeroBalance)}
                    />
                </ZeroBalanceWrapper>
            </AssetContainer>

            {!isBiconomy && thalesBalance && thalesBalance.balance > 0 && (
                <AssetContainer>
                    <AssetWrapper>
                        <Asset className={COLLATERAL_ICONS_CLASS_NAMES['THALES']} />
                        {thalesBalance.asset}
                    </AssetWrapper>
                    <Label>{formatCurrencyWithKey('', thalesBalance.balance)}</Label>
                    <Label>{formatCurrencyWithKey(USD_SIGN, thalesBalance.value, 2)}</Label>
                    <Convert
                        onClick={() => {
                            if (thalesBalance.balance > 0) {
                                setShowThalesToOverMigrationModal(true);
                            }
                        }}
                    >
                        {t('profile.asset-balance.migrate')}
                        <ConvertIcon />
                    </Convert>
                </AssetContainer>
            )}

            {isBiconomy
                ? usersAssets.smartAssets.map((assetData, index) => {
                      return (
                          <AssetContainer key={index}>
                              <AssetWrapper>
                                  <Asset className={COLLATERAL_ICONS_CLASS_NAMES[assetData.asset]} />
                                  {assetData.asset}
                              </AssetWrapper>
                              <Label>{formatCurrencyWithKey('', assetData.balance)}</Label>
                              <Label>{formatCurrencyWithKey(USD_SIGN, assetData.value, 2)}</Label>

                              <Convert
                                  disabled={assetData.balance == 0 || assetData.asset === 'OVER'}
                                  onClick={() => {
                                      if (assetData.balance > 0 && assetData.asset !== 'OVER') {
                                          setConvertToken(getCollateralIndex(networkId, assetData.asset));
                                          setShowSwapModal(true);
                                      }
                                  }}
                              >
                                  {t('profile.asset-balance.convert')}
                                  <ConvertIcon />
                              </Convert>
                          </AssetContainer>
                      );
                  })
                : usersAssets.eoaAssets.map((assetData, index) => {
                      return (
                          <AssetContainer key={index}>
                              <AssetWrapper>
                                  <Asset className={COLLATERAL_ICONS_CLASS_NAMES[assetData.asset]} />
                                  {assetData.asset}
                              </AssetWrapper>
                              <Label>{formatCurrencyWithKey('', assetData.balance)}</Label>
                              <Label>{formatCurrencyWithKey(USD_SIGN, assetData.value, 2)}</Label>

                              <Convert
                                  disabled={assetData.balance == 0 || assetData.asset === 'OVER'}
                                  onClick={() => {
                                      if (assetData.balance > 0 && assetData.asset !== 'OVER') {
                                          setConvertToken(getCollateralIndex(networkId, assetData.asset));
                                          setShowSwapModal(true);
                                      }
                                  }}
                              >
                                  {t('profile.asset-balance.convert')}
                                  <ConvertIcon />
                              </Convert>

                              <Transfer
                                  disabled={assetData.balance == 0}
                                  onClick={() => {
                                      if (assetData.balance > 0) {
                                          setConvertToken(getCollateralIndex(networkId, assetData.asset));
                                          setShowDepositFromWallet(true);
                                      }
                                  }}
                              >
                                  {t('profile.asset-balance.transfer')}
                              </Transfer>
                          </AssetContainer>
                      );
                  })}

            {isBiconomy && (
                <EoaContainer>
                    {thalesBalance && thalesBalance.balance > 0 && (
                        <AssetContainer>
                            <AssetWrapper>
                                <Asset className={COLLATERAL_ICONS_CLASS_NAMES['THALES']} />
                                {thalesBalance.asset}
                            </AssetWrapper>
                            <Label>{formatCurrencyWithKey('', thalesBalance.balance)}</Label>
                            <Label>{formatCurrencyWithKey(USD_SIGN, thalesBalance.value, 2)}</Label>
                            <Convert
                                onClick={() => {
                                    if (thalesBalance.balance > 0) {
                                        setShowThalesToOverMigrationModal(true);
                                    }
                                }}
                            >
                                {t('profile.asset-balance.migrate')}
                                <ConvertIcon />
                            </Convert>
                        </AssetContainer>
                    )}
                    {usersAssets.eoaAssets.map((assetData, index) => {
                        return (
                            <AssetContainer key={index}>
                                <AssetWrapper>
                                    <Asset className={COLLATERAL_ICONS_CLASS_NAMES[assetData.asset]} />
                                    {assetData.asset}
                                </AssetWrapper>
                                <Label>{formatCurrencyWithKey('', assetData.balance)}</Label>
                                <Label>{formatCurrencyWithKey(USD_SIGN, assetData.value, 2)}</Label>

                                <Transfer
                                    disabled={assetData.balance == 0}
                                    onClick={() => {
                                        if (assetData.balance > 0) {
                                            setConvertToken(getCollateralIndex(networkId, assetData.asset));
                                            setShowDepositFromWallet(true);
                                        }
                                    }}
                                >
                                    {t('profile.asset-balance.transfer')}
                                </Transfer>
                            </AssetContainer>
                        );
                    })}
                </EoaContainer>
            )}

            {showThalesToOverMigrationModal && (
                <ThalesToOverMigrationModal onClose={() => setShowThalesToOverMigrationModal(false)} />
            )}
            {showFundModal && <FundModal onClose={() => setShowFundModal(false)} />}
            {showWithdrawModal && <WithdrawModal onClose={() => setShowWithdrawModal(false)} />}
            {showSwapModal && <SwapModal preSelectedToken={convertToken} onClose={() => setShowSwapModal(false)} />}
            {showDepositFromWallet && (
                <DepositFromWallet preSelectedToken={convertToken} onClose={() => setShowDepositFromWallet(false)} />
            )}
        </GridContainer>
    );
};

const GridContainer = styled.div`
    margin-top: 20px;
    padding: 14px;
    background: ${(props) => props.theme.background.quinary};
    border-radius: 8px;
`;

const AlignedParagraph = styled.p`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const TableHeader = styled(AlignedParagraph)`
    justify-content: flex-start;

    color: ${(props) => props.theme.textColor.primary};
    font-size: 20px;
    font-weight: 700;
    white-space: pre;
`;

const TableHeader2 = styled(TableHeader)`
    justify-content: center;
    color: ${(props) => props.theme.button.textColor.senary};
    font-size: 14px;
    font-weight: 700;
    white-space: pre;
`;

const ZeroBalanceWrapper = styled.div`
    @media (max-width: 700px) {
        display: none;
    }
    display: flex;
    align-items: center;
    grid-column-start: 5;
    grid-column-end: 7;
`;

const AssetContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-column: 1;
    grid-column-end: 7;
    @media (max-width: 700px) {
        grid-template-columns: repeat(3, 1fr);
        grid-column: 1;
        grid-column-end: 4;
        padding-left: 8px;
    }

    border-top: 1px solid ${(props) => props.theme.background.senary};
    padding: 14px 0;
`;

const AssetWrapper = styled(AlignedParagraph)`
    position: relative;
    color: ${(props) => props.theme.textColor.primary};
    font-size: 16px;
    font-weight: 500;
    white-space: pre;
    justify-content: flex-start;
    gap: 8px;
`;

const TableButton = styled(AlignedParagraph)<{ disabled?: boolean }>`
    cursor: pointer;
    font-size: 14px;
    gap: 4px;
    white-space: pre;
    @media (max-width: 700px) {
        display: none;
    }

    ${(props) => (props.disabled ? `opacity: 0.7; cursor: not-allowed;` : ``)}
`;

const Convert = styled(TableButton)`
    grid-column-start: 4;
    grid-column-end: 5;
    color: ${(props) => props.theme.textColor.septenary};
`;

const Transfer = styled(TableButton)`
    grid-column-start: 5;
    grid-column-end: 7;
    color: ${(props) => props.theme.overdrop.textColor.primary};
`;

const Label = styled(AlignedParagraph)`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 16px;
    font-weight: 500;
    white-space: pre;
`;

const Asset = styled.i`
    font-size: 24px;
    line-height: 24px;
    width: 30px;
    color: ${(props) => props.theme.textColor.secondary};
`;

const EoaContainer = styled.div`
    position: relative;
    border-right: 20px solid white;
    border-radius: 8px;

    &:after {
        transform: rotate(90deg);
        position: absolute;
        content: 'EOA';
        color: black;
        top: calc(50% - 8px);
        right: -26px;
    }
`;

const ButtonContainer = styled(FlexDivEnd)`
    justify-content: flex-start;
    margin-bottom: 16px;
    gap: 16px;
    @media (max-width: 800px) {
        justify-content: flex-start;
        width: 100%;
        gap: 6px;
    }
`;

const Button = styled(FlexDivCentered)<{ active?: boolean }>`
    border-radius: 8px;
    width: 120px;
    height: 42px;
    border: 1px ${(props) => props.theme.borderColor.primary} solid;
    color: ${(props) => props.theme.textColor.primary};

    font-size: 14px;
    font-weight: 600;

    text-transform: uppercase;
    cursor: pointer;
    &:hover {
        background-color: ${(props) => props.theme.connectWalletModal.hover};
        color: ${(props) => props.theme.button.textColor.primary};
    }
    white-space: pre;
    padding: 3px 24px;
    @media (max-width: 575px) {
        font-size: 12px;
        padding: 3px 12px;
    }
`;

export default AssetBalance;
