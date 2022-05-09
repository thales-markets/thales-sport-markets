import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { FlexDivCentered } from 'styles/common';
import { useTranslation } from 'react-i18next';
import { getIsAppReady } from 'redux/modules/app';
import { DEFAULT_CURRENCY_DECIMALS, PAYMENT_CURRENCY } from 'constants/currency';
import { formatCurrencyWithKey } from 'utils/formatters/number';
import Button from 'components/Button';
import useGetUsdDefaultAmountQuery from 'queries/wallet/useGetUsdDefaultAmountQuery';
import { toast } from 'react-toastify';
import { getSuccessToastOptions, getErrorToastOptions } from 'config/toast';
import networkConnector from 'utils/networkConnector';
import { ethers } from 'ethers';
import { bigNumberFormatter } from 'utils/formatters/ethers';

const FAUCET_ETH_AMOUNT_TO_SEND = 0.000001;

const GetUsd: React.FC = () => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const [getUsdDefaultAmount, setGetUsdDefaultAmount] = useState<number | string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const getUsdDefaultAmountQuery = useGetUsdDefaultAmountQuery(networkId, {
        enabled: isAppReady,
    });

    useEffect(() => {
        if (getUsdDefaultAmountQuery.isSuccess && getUsdDefaultAmountQuery.data !== undefined) {
            setGetUsdDefaultAmount(Number(getUsdDefaultAmountQuery.data));
        }
    }, [getUsdDefaultAmountQuery.isSuccess, getUsdDefaultAmountQuery.data]);

    const formattedAmount = formatCurrencyWithKey(
        PAYMENT_CURRENCY,
        getUsdDefaultAmount,
        DEFAULT_CURRENCY_DECIMALS,
        true
    );

    const handleGet = async () => {
        const { exoticUsdContract, provider, signer } = networkConnector;
        const faucetSigner = new ethers.Wallet(process.env.REACT_APP_FAUCET_WALLET_PRIVATE_KEY || '', provider);
        if (exoticUsdContract && signer && faucetSigner) {
            const id = toast.loading(t('market.toast-messsage.transaction-pending'));
            setIsSubmitting(true);

            try {
                const ethBalance = bigNumberFormatter(await signer.getBalance());
                const exoticUsdContractWithSigner = exoticUsdContract.connect(faucetSigner);

                const tx = await exoticUsdContractWithSigner.mintForUser(walletAddress, {
                    value: ethers.utils.parseEther(
                        (ethBalance < FAUCET_ETH_AMOUNT_TO_SEND ? FAUCET_ETH_AMOUNT_TO_SEND : 0).toString()
                    ),
                });
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    toast.update(
                        id,
                        getSuccessToastOptions(t('market.toast-messsage.get-usd-success', { amount: formattedAmount }))
                    );
                    setIsSubmitting(false);
                }
            } catch (e) {
                console.log(e);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                setIsSubmitting(false);
            }
        }
    };

    return (
        <>
            {isWalletConnected && (
                <Container>
                    <Button type="secondary" onClick={handleGet} disabled={isSubmitting}>
                        {isSubmitting
                            ? t('common.wallet.get-usd-progress', {
                                  amount: formattedAmount,
                              })
                            : t('common.wallet.get-usd', {
                                  amount: formattedAmount,
                              })}
                    </Button>
                </Container>
            )}
        </>
    );
};

const Container = styled(FlexDivCentered)`
    position: relative;
    height: 28px;
    button {
        padding: 0 20px;
    }
`;

export default GetUsd;
