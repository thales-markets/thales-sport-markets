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
import { NetworkIdByName } from 'utils/network';
import SwapModal from 'components/SwapModal';
import { isMobile } from 'utils/device';

const FAUCET_ETH_AMOUNT_TO_SEND = 0.000001;

const GetUsd: React.FC = () => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const [getUsdDefaultAmount, setGetUsdDefaultAmount] = useState<number | string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [openSwapModal, setOpenSwapModal] = useState<boolean>(false);

    const getUsdDefaultAmountQuery = useGetUsdDefaultAmountQuery(networkId, {
        enabled: isAppReady && networkId === NetworkIdByName.OptimsimKovan,
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
            const id = toast.loading(t('market.toast-message.transaction-pending'));
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
                        getSuccessToastOptions(t('market.toast-message.get-usd-success', { amount: formattedAmount }))
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
                    <Button
                        type="primary"
                        onClick={() => {
                            if (networkId === NetworkIdByName.OptimsimKovan) {
                                handleGet();
                            } else {
                                setOpenSwapModal(true);
                            }
                        }}
                        disabled={isSubmitting}
                        fontSize={12.5}
                        style={!isMobile() ? { minHeight: '24px' } : {}}
                    >
                        {isSubmitting
                            ? t('common.wallet.get-usd-progress', {
                                  amount: formattedAmount,
                              })
                            : networkId === NetworkIdByName.OptimsimKovan
                            ? t('common.wallet.get-usd', {
                                  amount: formattedAmount,
                              })
                            : t('common.swap.title', { currencyKey: PAYMENT_CURRENCY })}
                    </Button>
                    {openSwapModal && <SwapModal onClose={() => setOpenSwapModal(false)} />}
                </Container>
            )}
        </>
    );
};

const Container = styled(FlexDivCentered)`
    position: relative;
    margin-bottom: 20px;
    height: ${isMobile() ? '28px' : '24px'};
    button {
        padding: 0 20px;
        width: 100%;
    }
    @media (max-width: 500px) {
        width: 100%;
        button {
            width: 100%;
        }
    }
`;

export default GetUsd;
