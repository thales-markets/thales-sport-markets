import Toggle from 'components/Toggle';
import { COLLATERAL_ICONS, USD_SIGN } from 'constants/currency';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { Coins, formatCurrencyWithKey } from 'thales-utils';
import { Rates } from 'types/collateral';
import { RootState } from 'types/redux';
import biconomyConnector from 'utils/biconomyWallet';
import { getCollateralIndex, getCollaterals } from 'utils/collaterals';
import { useChainId, useClient, useAccount } from 'wagmi';
import ConvertIcon from 'assets/images/svgs/convert.svg?react';
import DepositIcon from 'assets/images/svgs/deposit.svg?react';
import WithdrawIcon from 'assets/images/svgs/withdraw.svg?react';

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
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const walletAddress = (isBiconomy ? biconomyConnector.address : address) || '';
    const theme = useTheme();

    const [showZeroBalance, setShowZeroBalance] = useState<boolean>(true);

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
                }> = [];
                getCollaterals(networkId).forEach((token) => {
                    result.push({
                        asset: token,
                        balance: multipleCollateralBalances.data[token],
                        value:
                            multipleCollateralBalances.data[token] * (exchangeRates[token] ? exchangeRates[token] : 1),
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
                <TableHeader>Assets</TableHeader>
                <TableHeader2>Amount</TableHeader2>
                <TableHeader2>Value(USD)</TableHeader2>
                <ZeroBalanceWrapper>
                    <TableHeader2>Show zero balance</TableHeader2>
                    <Toggle
                        dotBackground={showZeroBalance ? theme.borderColor.tertiary : ''}
                        active={showZeroBalance}
                        handleClick={() => setShowZeroBalance(!showZeroBalance)}
                    />
                </ZeroBalanceWrapper>
            </AssetContainer>

            {usersAssets.map((assetData, index) => {
                const Icon = COLLATERAL_ICONS[assetData.asset];
                const StyledIcon = styled(Icon)`
                    height: 24px;
                    width: 30px;
                `;
                return (
                    <AssetContainer key={index}>
                        <AssetWrapper>
                            {<StyledIcon />} {assetData.asset}
                        </AssetWrapper>
                        <Label>{formatCurrencyWithKey('', assetData.balance)}</Label>
                        <Label>{formatCurrencyWithKey(USD_SIGN, assetData.value, 2)}</Label>
                        <Deposit onClick={() => setShowFundModal(true)}>
                            Deposit <DepositIcon />
                        </Deposit>
                        <Convert
                            onClick={() => {
                                setConvertToken(getCollateralIndex(networkId, assetData.asset));
                                setShowSwapModal(true);
                            }}
                        >
                            Convert <ConvertIcon />
                        </Convert>
                        <Withdraw
                            onClick={() => {
                                setWithdrawalToken(getCollateralIndex(networkId, assetData.asset));
                                setShowWithdrawModal(true);
                            }}
                        >
                            Withdraw <WithdrawIcon />
                        </Withdraw>
                    </AssetContainer>
                );
            })}
        </GridContainer>
    );
};

const GridContainer = styled.div`
    margin-top: 20px;
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

const TableHeader2 = styled(AlignedParagraph)`
    color: ${(props) => props.theme.button.textColor.senary};
    font-size: 14px;
    font-weight: 700;
    white-space: pre;
`;

const ZeroBalanceWrapper = styled.div`
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
    border-top: 1px solid ${(props) => props.theme.background.senary};
    padding: 14px 0;
`;

const AssetWrapper = styled(AlignedParagraph)`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 16px;
    font-weight: 500;
    white-space: pre;
    justify-content: flex-start;
    gap: 8px;
`;

const TableButton = styled(AlignedParagraph)`
    cursor: pointer;
    font-size: 14px;
    gap: 4px;
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

export default AssetBalance;
