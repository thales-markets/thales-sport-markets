import axios from 'axios';
import Button from 'components/Button';
import CollateralSelector from 'components/CollateralSelector';
import NumericInput from 'components/fields/NumericInput';
import { generalConfig } from 'config/general';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { t } from 'i18next';
import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getTicketPayment } from 'redux/modules/ticket';
import { useTheme } from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumnCentered, FlexDivColumnNative } from 'styles/common';
import { ThemeInterface } from 'types/ui';
import { getCollateralAddress, getFreeBetCollaterals } from 'utils/collaterals';
import { useAccount, useChainId, useSignMessage } from 'wagmi';

const FreeBets: React.FC = () => {
    const walletAddress = useAccount()?.address || '';
    const networkId = useChainId();
    const { signMessageAsync } = useSignMessage();
    const theme: ThemeInterface = useTheme();

    const ticketPayment = useSelector(getTicketPayment);
    const selectedCollateralIndex = ticketPayment.selectedCollateralIndex;
    const [betAmount, setBetAmount] = useState<number | string>('');
    const [numberOfBets, setNumberOfBets] = useState<number | string>('');
    const [generatedIds, setGeneratedIds] = useState<number[]>([]);
    const selectedCollateralAddress = useMemo(() => getCollateralAddress(networkId, selectedCollateralIndex), [
        networkId,
        selectedCollateralIndex,
    ]);
    const supportedCollaterals = getFreeBetCollaterals(networkId);

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

    return (
        <>
            <FlexDivColumnNative>
                <FlexDivColumnCentered>
                    <span> Make sure free bet wallet is funded before generating free bets</span>
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
                                    selectedItem={selectedCollateralIndex}
                                    onChangeCollateral={() => {
                                        setBetAmount('');
                                    }}
                                    isDetailedView
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
                        <Button
                            disabled={
                                !betAmount || !numberOfBets || selectedCollateralIndex > supportedCollaterals.length - 1
                            }
                            onClick={onSubmit}
                        >
                            Generate
                        </Button>
                    </FlexDivCentered>
                </FlexDivColumnCentered>
                <br />
                <FlexDivColumnCentered>
                    {generatedIds.map((id) => (
                        <FlexDiv key={id}>
                            <span>{`https://overtimemarkets.xyz/profile?freeBet=${id}`}</span>
                        </FlexDiv>
                    ))}
                </FlexDivColumnCentered>
            </FlexDivColumnNative>
        </>
    );
};

export default FreeBets;
