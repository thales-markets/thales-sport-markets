import { PaymasterMode } from '@biconomy/account';
import { getWalletClient } from '@wagmi/core';
import Modal from 'components/Modal';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { ContractType } from 'enums/contract';
import { Network } from 'enums/network';
import { wagmiConfig } from 'pages/Root/wagmiConfig';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/app';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import { coinParser, Coins, formatCurrencyWithKey } from 'thales-utils';
import { RootState } from 'types/redux';
import { executeBiconomyTransactionWithConfirmation } from 'utils/biconomy';
import biconomyConnector from 'utils/biconomyWallet';
import { getCollateralIndex } from 'utils/collaterals';
import { getContractInstance } from 'utils/contract';
import { getNetworkNameByNetworkId } from 'utils/network';
import { Address, Client } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { useChainId, useClient } from 'wagmi';

type WithdrawalConfirmationModalProps = {
    amount: number;
    token: Coins;
    withdrawalAddress: string;
    network: Network;
    onClose: () => void;
};

const WithdrawalConfirmationModal: React.FC<WithdrawalConfirmationModalProps> = ({
    amount,
    token,
    withdrawalAddress,
    network,
    onClose,
}) => {
    const { t } = useTranslation();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const networkId = useChainId();
    const client = useClient();

    const networkName = useMemo(() => {
        return getNetworkNameByNetworkId(network);
    }, [network]);

    const parsedAmount = useMemo(() => {
        return coinParser('' + amount, network, token);
    }, [amount, network, token]);

    const handleSubmit = async () => {
        const id = toast.loading(t('withdraw.toast-messages.pending'));

        try {
            const walletClient = await getWalletClient(wagmiConfig);

            if (walletClient) {
                let txHash;
                if (token === 'ETH') {
                    const transaction = {
                        to: withdrawalAddress as Address,
                        value: parsedAmount,
                    };
                    if (biconomyConnector && biconomyConnector.wallet) {
                        const { wait } = await biconomyConnector.wallet.sendTransaction(transaction, {
                            paymasterServiceData: {
                                mode: PaymasterMode.SPONSORED,
                            },
                        });

                        const {
                            receipt: { transactionHash },
                        } = await wait();

                        txHash = transactionHash;
                    }
                } else {
                    const collateralContractWithSigner = getContractInstance(
                        ContractType.MULTICOLLATERAL,
                        { client: walletClient, networkId },
                        getCollateralIndex(networkId, token)
                    );

                    txHash = await executeBiconomyTransactionWithConfirmation(
                        collateralContractWithSigner,
                        'transfer',
                        [withdrawalAddress, parsedAmount]
                    );
                }

                const txReceipt = await waitForTransactionReceipt(client as Client, {
                    hash: txHash,
                });

                if (txReceipt.status === 'success') {
                    toast.update(id, getSuccessToastOptions(t('withdraw.toast-messages.success')));
                    onClose();
                    return;
                }
            }
            toast.update(id, getErrorToastOptions(t('withdraw.toast-messages.error')));
        } catch (e) {
            console.log('Error ', e);
            toast.update(id, getErrorToastOptions(t('withdraw.toast-messages.error')));
        }
    };

    return (
        <Modal
            title={t('withdraw.confirmation-modal.title')}
            customStyle={isMobile ? { content: { width: '100%', padding: '0 10px' } } : undefined}
            onClose={() => onClose()}
        >
            <MainContainer>
                <MakeSureText>
                    {t('withdraw.confirmation-modal.correct-address', {
                        token,
                        network: networkName,
                    })}
                </MakeSureText>

                <DetailsContainer>
                    <ItemContainer>
                        <ItemLabel>{t('withdraw.amount')}:</ItemLabel>
                        <ItemDescription>
                            {<TokenIcon className={`currency-icon currency-icon--${token.toLowerCase()}`} />}
                            {formatCurrencyWithKey(token, amount)}
                        </ItemDescription>
                    </ItemContainer>
                    <ItemContainer>
                        <ItemLabel>{t('withdraw.confirmation-modal.address')}:</ItemLabel>
                        <ItemDescription>{withdrawalAddress}</ItemDescription>
                    </ItemContainer>
                    <ItemContainer>
                        <ItemLabel>{t('withdraw.confirmation-modal.network')}:</ItemLabel>
                        <ItemDescription>{networkName}</ItemDescription>
                    </ItemContainer>
                </DetailsContainer>
                <ButtonContainer>
                    <Button onClick={() => handleSubmit()}>{t('withdraw.confirmation-modal.confirm')}</Button>
                </ButtonContainer>
            </MainContainer>
        </Modal>
    );
};

const MainContainer = styled(FlexDiv)`
    padding: 30px 20px 10px 20px;
    flex-direction: column;
    max-width: 550px;
    align-items: center;
    justify-content: center;
    @media (max-width: 575px) {
        width: 100%;
    }
`;

const TokenIcon = styled.i`
    font-size: 25px;
    margin-right: 5px;
    color: ${(props) => props.theme.textColor.primary};
    @media (max-width: 575px) {
        margin-right: 0px;
    }
`;

const MakeSureText = styled.span`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 18px;
    font-weight: 400;
    line-height: normal;
    margin-bottom: 14px;
`;

const DetailsContainer = styled(FlexDiv)`
    width: 100%;
    margin-top: 10px;
    flex-direction: column;
    background-color: ${(props) => props.theme.connectWalletModal.totalBalanceBackground};
    padding: 18px;
`;

const ItemContainer = styled(FlexDiv)`
    width: fit-content;
    flex-direction: row;
    align-items: center;
    width: 100%;
    justify-content: space-between;
    margin: 5px 0px;
    color: ${(props) => props.theme.textColor.primary};
    @media (max-width: 575px) {
        height: 50px;
        overflow-wrap: break-word;
    }
`;

const ItemLabel = styled(FlexDiv)`
    align-items: center;
    font-size: 18px;
    font-weight: 600;
    margin-right: 15px;
    @media (max-width: 575px) {
        word-wrap: break-word;
    }
`;

const ItemDescription = styled.div`
    display: block;
    align-items: center;
    overflow-wrap: break-word;
    width: fit-content;
    @media (max-width: 575px) {
        max-width: 150px;
        text-align: right;
    }
`;

const ButtonContainer = styled(FlexDiv)`
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-top: 24px;
`;

const Button = styled(FlexDiv)`
    cursor: pointer;
    padding: 8px 20px;
    align-items: center;
    justify-content: center;
    color: ${(props) => props.theme.button.textColor.primary};
    background-color: ${(props) => props.theme.button.background.quaternary};
    font-size: 22px;
    font-weight: 600;
    text-transform: uppercase;
    border-radius: 5px;
`;

export default WithdrawalConfirmationModal;
