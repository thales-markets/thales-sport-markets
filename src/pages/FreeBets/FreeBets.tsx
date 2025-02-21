import axios from 'axios';
import Button from 'components/Button';
import CollateralSelector from 'components/CollateralSelector';
import NumericInput from 'components/fields/NumericInput';
import { generalConfig } from 'config/general';
import { getErrorToastOptions, getInfoToastOptions, getSuccessToastOptions } from 'config/toast';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { t } from 'i18next';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getTicketPayment } from 'redux/modules/ticket';
import styled, { useTheme } from 'styled-components';
import {
    FlexDiv,
    FlexDivCentered,
    FlexDivColumnCentered,
    FlexDivColumnNative,
    FlexDivEnd,
    FlexDivSpaceBetween,
} from 'styles/common';
import { ThemeInterface } from 'types/ui';
import { getFreeBetCollaterals } from 'utils/collaterals';
import { useAccount, useChainId, useClient, useSignMessage } from 'wagmi';
import multipleCollateral from '../../utils/contracts/multipleCollateralContract';

const FreeBets: React.FC = () => {
    const walletAddress = useAccount()?.address || '';
    const networkId = useChainId();
    const { signMessageAsync } = useSignMessage();
    const theme: ThemeInterface = useTheme();
    const client = useClient();

    const ticketPayment = useSelector(getTicketPayment);
    const selectedCollateralIndex = ticketPayment.selectedCollateralIndex;
    const [betAmount, setBetAmount] = useState<number | string>('');
    const [numberOfBets, setNumberOfBets] = useState<number | string>('');
    const [generatedIds, setGeneratedIds] = useState<string[]>(['adsasd', 'adsasd', 'adsasd', 'adsasd']);
    const supportedCollaterals = useMemo(() => [...getFreeBetCollaterals(networkId), CRYPTO_CURRENCY_MAP.THALES], [
        networkId,
    ]);
    const selectedCollateral = useMemo(() => supportedCollaterals[selectedCollateralIndex], [
        selectedCollateralIndex,
        supportedCollaterals,
    ]);
    const selectedCollateralAddress = useMemo(
        () => multipleCollateral[selectedCollateral as keyof typeof multipleCollateral]?.addresses[networkId],
        [networkId, selectedCollateral]
    );

    const multipleCollateralBalancesQuery = useMultipleCollateralBalanceQuery(
        '0x23Ea88E828188377DCB4663ff2FE419B1fC71F88',
        {
            networkId,
            client,
        }
    );
    const multipleCollateralBalances: { [key: string]: number } = multipleCollateralBalancesQuery?.data || {};

    const exchangeRatesQuery = useExchangeRatesQuery({ networkId, client });
    const exchangeRates = exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    const onSubmit = useCallback(async () => {
        const toastId = toast.loading(t('market.toast-message.transaction-pending'));
        const signature = await signMessageAsync({ message: JSON.stringify({ betAmount, numberOfBets }) });

        if (walletAddress && signature) {
            try {
                const response = await axios.post(
                    `${generalConfig.API_URL}/overtime-v2/networks/${networkId}/generate-free-bets`,
                    {
                        betAmount,
                        numberOfBets,
                        signature,
                        collateral: selectedCollateralAddress,
                    }
                );
                if (typeof response.data !== 'string') {
                    toast.update(toastId, getSuccessToastOptions('Success'));
                    setGeneratedIds(response.data);
                }
            } catch (e: any) {
                if (e?.response?.data) {
                    toast.update(toastId, getErrorToastOptions(e.response.data));
                } else {
                    toast.update(toastId, getErrorToastOptions('Unknown error'));
                }
                console.log(e);
            }
        }
    }, [
        betAmount,
        numberOfBets,
        signMessageAsync,
        walletAddress,
        networkId,
        setGeneratedIds,
        selectedCollateralAddress,
    ]);

    const submitDisabled =
        !betAmount ||
        !numberOfBets ||
        selectedCollateralIndex > supportedCollaterals.length - 1 ||
        !multipleCollateralBalances[selectedCollateral] ||
        +betAmount * +numberOfBets > multipleCollateralBalances[selectedCollateral];

    return (
        <>
            <FlexDivColumnNative>
                <FlexDivColumnCentered>
                    <span> Balances displayed are for fund wallet</span>
                    <br />
                    <span> 0x23Ea88E828188377DCB4663ff2FE419B1fC71F88</span>
                    <br />
                    <FlexDiv>
                        <NumericInput
                            label="Bet Amount"
                            value={betAmount}
                            onChange={(e) => {
                                setBetAmount(+e.target.value);
                            }}
                            inputFontWeight="600"
                            inputPadding="5px 10px"
                            borderColor={theme.input.borderColor.tertiary}
                            currencyComponent={
                                <CollateralSelector
                                    collateralArray={supportedCollaterals}
                                    collateralBalances={multipleCollateralBalances}
                                    selectedItem={selectedCollateralIndex}
                                    onChangeCollateral={() => {
                                        setBetAmount('');
                                    }}
                                    isDetailedView
                                    exchangeRates={exchangeRates}
                                />
                            }
                        />
                    </FlexDiv>
                    <FlexDiv>
                        <NumericInput
                            label="Number of Bets"
                            value={numberOfBets}
                            onChange={(e) => {
                                setNumberOfBets(+e.target.value);
                            }}
                            borderColor={theme.input.borderColor.tertiary}
                        />
                    </FlexDiv>
                    <FlexDivCentered>
                        <Button disabled={submitDisabled} onClick={onSubmit}>
                            Generate
                        </Button>
                    </FlexDivCentered>
                </FlexDivColumnCentered>
                <br />
                <FlexDivColumnCentered gap={10}>
                    <FlexDivEnd>
                        <FlexDivCentered gap={5}>
                            Copy All
                            <CopyIcon
                                onClick={() => {
                                    const toastId = toast.loading('Copying', { autoClose: 1000 });
                                    navigator.clipboard.writeText(
                                        generatedIds
                                            .map((id) => `https://overtimemarkets.xyz/profile?freeBet=${id}`)
                                            .join('\n')
                                    );
                                    toast.update(toastId, { ...getInfoToastOptions('Copied all'), autoClose: 1000 });
                                }}
                                className="icon icon--copy"
                            />
                        </FlexDivCentered>
                    </FlexDivEnd>
                    <FlexDivColumnCentered gap={5}>
                        {generatedIds.map((id) => (
                            <FlexDivSpaceBetween key={id}>
                                <span>{`https://overtimemarkets.xyz/profile?freeBet=${id}`}</span>
                                <CopyIcon
                                    onClick={() => {
                                        const toastId = toast.loading('Copying', { autoClose: 1000 });
                                        navigator.clipboard.writeText(
                                            `https://overtimemarkets.xyz/profile?freeBet=${id}`
                                        );
                                        toast.update(toastId, {
                                            ...getInfoToastOptions('Copied ' + id),
                                            autoClose: 1000,
                                        });
                                    }}
                                    className="icon icon--copy"
                                />
                            </FlexDivSpaceBetween>
                        ))}
                    </FlexDivColumnCentered>
                </FlexDivColumnCentered>
            </FlexDivColumnNative>
        </>
    );
};

const CopyIcon = styled.i`
    font-size: 24px;
    cursor: pointer;
    font-weight: 400;
    color: ${(props) => props.theme.overdrop.textColor.primary};
    @media (max-width: 575px) {
        font-size: 20px;
    }
`;

export default FreeBets;
