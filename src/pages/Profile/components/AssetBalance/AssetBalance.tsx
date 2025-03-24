import ConvertIcon from 'assets/images/svgs/convert.svg?react';
import DepositIcon from 'assets/images/svgs/deposit.svg?react';
import WithdrawIcon from 'assets/images/svgs/withdraw.svg?react';
import Toggle from 'components/Toggle';
import { COLLATERAL_ICONS_CLASS_NAMES, USD_SIGN } from 'constants/currency';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import useLocalStorage from 'hooks/useLocalStorage';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { Coins, formatCurrencyWithKey } from 'thales-utils';
import { Rates } from 'types/collateral';
import { RootState } from 'types/redux';
import { getCollateralIndex, getCollaterals } from 'utils/collaterals';
import useBiconomy from 'utils/useBiconomy';
import { useAccount, useChainId, useClient } from 'wagmi';

type Props = {
    setConvertToken: React.Dispatch<React.SetStateAction<number>>;
    setWithdrawalToken: React.Dispatch<React.SetStateAction<number>>;
    setShowSwapModal: React.Dispatch<React.SetStateAction<boolean>>;
    setShowWithdrawModal: React.Dispatch<React.SetStateAction<boolean>>;
    setShowFundModal: React.Dispatch<React.SetStateAction<boolean>>;
};

const AssetBalance: React.FC<Props> = ({
    setConvertToken,
    setShowFundModal,
    setShowSwapModal,
    setShowWithdrawModal,
    setWithdrawalToken,
}) => {
    const { t } = useTranslation();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const smartAddres = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddres : address) || '';
    const theme = useTheme();

    const [showZeroBalance, setShowZeroBalance] = useLocalStorage(LOCAL_STORAGE_KEYS.SHOW_ZERO_BALANCE, true);

    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(
        walletAddress,
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
            if (exchangeRates && multipleCollateralBalances.data) {
                const result: Array<{
                    asset: Coins;
                    balance: number;
                    value: number;
                    freeBet: boolean;
                }> = [];
                getCollaterals(networkId).forEach((token) => {
                    result.push({
                        asset: token,
                        balance: multipleCollateralBalances.data[token],
                        value:
                            multipleCollateralBalances.data[token] * (exchangeRates[token] ? exchangeRates[token] : 1),
                        freeBet: false,
                    });
                });

                return result
                    .sort((a, b) => {
                        return b.value - a.value;
                    })
                    .filter((tokenData) => {
                        if (showZeroBalance) {
                            return true;
                        } else {
                            return tokenData.value !== 0;
                        }
                    });
            }
            return [];
        } catch (e) {
            return [];
        }
    }, [exchangeRates, multipleCollateralBalances.data, networkId, showZeroBalance]);

    return (
        <GridContainer>
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

            {usersAssets.map((assetData, index) => {
                return (
                    <AssetContainer key={index}>
                        <AssetWrapper>
                            {assetData.freeBet && <SubHeaderIcon className="icon icon--gift" />}
                            <Asset className={COLLATERAL_ICONS_CLASS_NAMES[assetData.asset]} />
                            {assetData.asset}
                        </AssetWrapper>
                        <Label>{formatCurrencyWithKey('', assetData.balance)}</Label>
                        <Label>{formatCurrencyWithKey(USD_SIGN, assetData.value, 2)}</Label>

                        <Deposit
                            disabled={assetData.freeBet}
                            onClick={() => !assetData.freeBet && setShowFundModal(true)}
                        >
                            {t('profile.asset-balance.deposit')} <DepositIcon />
                        </Deposit>
                        <Convert
                            disabled={assetData.freeBet || assetData.balance == 0}
                            onClick={() => {
                                if (!assetData.freeBet && assetData.balance > 0) {
                                    setConvertToken(getCollateralIndex(networkId, assetData.asset));
                                    setShowSwapModal(true);
                                }
                            }}
                        >
                            {t('profile.asset-balance.convert')}
                            <ConvertIcon />
                        </Convert>
                        <Withdraw
                            disabled={assetData.freeBet || assetData.balance == 0}
                            onClick={() => {
                                if (!assetData.freeBet && assetData.balance > 0) {
                                    setWithdrawalToken(getCollateralIndex(networkId, assetData.asset));
                                    setShowWithdrawModal(true);
                                }
                            }}
                        >
                            {t('profile.asset-balance.withdraw')} <WithdrawIcon />
                        </Withdraw>
                    </AssetContainer>
                );
            })}
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

const Deposit = styled(TableButton)`
    color: ${(props) => props.theme.textColor.quaternary};
`;

const Convert = styled(TableButton)`
    color: ${(props) => props.theme.textColor.septenary};
`;

const Withdraw = styled(TableButton)`
    color: ${(props) => props.theme.overdrop.textColor.primary};
`;

const Label = styled(AlignedParagraph)`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 16px;
    font-weight: 500;
    white-space: pre;
`;

const SubHeaderIcon = styled.i`
    position: absolute;
    top: -6px;
    left: -8px;
    font-size: 16px;
    font-weight: 600;
    text-transform: none;
`;

const Asset = styled.i`
    font-size: 24px;
    line-height: 24px;
    width: 30px;
    color: ${(props) => props.theme.textColor.secondary};
`;

export default AssetBalance;
