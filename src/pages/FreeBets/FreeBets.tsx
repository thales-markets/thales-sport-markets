import axios from 'axios';
import Button from 'components/Button';
import NumericInput from 'components/fields/NumericInput';
import { generalConfig } from 'config/general';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { t } from 'i18next';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { FlexDiv, FlexDivCentered, FlexDivColumnCentered, FlexDivColumnNative } from 'styles/common';
import { useAccount, useChainId, useSignMessage } from 'wagmi';

const FreeBets: React.FC = () => {
    const walletAddress = useAccount()?.address || '';
    const networkId = useChainId();
    const { signMessageAsync } = useSignMessage();

    const [betAmount, setBetAmount] = useState<number | string>('');
    const [numberOfBets, setNumberOfBets] = useState<number | string>('');
    const [generatedIds, setGeneratedIds] = useState<number[]>([]);

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
    }, [betAmount, numberOfBets, signMessageAsync, walletAddress, networkId, setGeneratedIds]);

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
                        />
                    </FlexDiv>
                    <FlexDiv>
                        <NumericInput
                            label="Number of Bets"
                            value={numberOfBets}
                            onChange={(e) => {
                                setNumberOfBets(+e.target.value);
                            }}
                        />
                    </FlexDiv>
                    <FlexDivCentered>
                        <Button disabled={!betAmount || !numberOfBets} onClick={onSubmit}>
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
