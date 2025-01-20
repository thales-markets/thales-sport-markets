import { PaymasterMode } from '@biconomy/account';
import { getWalletClient } from '@wagmi/core';
import Zebra from 'assets/images/overtime-zebra.svg?react';
import Modal from 'components/Modal';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { ContractType } from 'enums/contract';
import { Network } from 'enums/network';
import { wagmiConfig } from 'pages/Root/wagmiConfig';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import styled, { useTheme } from 'styled-components';
import { Colors, FlexDiv } from 'styles/common';
import { coinParser, Coins, formatCurrencyWithKey, truncateAddress } from 'thales-utils';
import { ThemeInterface } from 'types/ui';
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
    const theme: ThemeInterface = useTheme();
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
            title=""
            containerStyle={{
                background: theme.overdrop.borderColor.tertiary,
                border: 'none',
            }}
            hideHeader
            onClose={() => onClose()}
        >
            <MainContainer>
                <ZebraIcon />
                <Header>{t('withdraw.request')}</Header>
                <SubTitle>
                    {t('withdraw.confirmation-modal.correct-address', {
                        token,
                        network: networkName,
                    })}
                </SubTitle>

                <Box>
                    <ItemContainer>
                        <ItemLabel>{t('withdraw.amount')}:</ItemLabel>
                        <ItemDescription>
                            {<TokenIcon className={`currency-icon currency-icon--${token.toLowerCase()}`} />}
                            {formatCurrencyWithKey(token, amount)}
                        </ItemDescription>
                    </ItemContainer>
                    <ItemContainer>
                        <ItemLabel>{t('withdraw.confirmation-modal.address')}:</ItemLabel>
                        <ItemDescription>{truncateAddress(withdrawalAddress, 10, 10)}</ItemDescription>
                    </ItemContainer>
                    <ItemContainer>
                        <ItemLabel>{t('withdraw.confirmation-modal.network')}:</ItemLabel>
                        <ItemDescription>{networkName}</ItemDescription>
                    </ItemContainer>
                </Box>
                <ButtonContainer>
                    <ActivateButton onClick={() => handleSubmit()}>
                        {t('withdraw.confirmation-modal.confirm')}
                    </ActivateButton>
                </ButtonContainer>
            </MainContainer>
        </Modal>
    );
};

const MainContainer = styled(FlexDiv)`
    display: flex;
    flex-direction: column;
    align-items: center;
    background: ${Colors.GOLD};
    z-index: 1000;
`;

const TokenIcon = styled.i`
    font-size: 25px;
    margin-right: 5px;
    color: ${(props) => props.theme.textColor.senary};
`;

const Header = styled.h2`
    color: ${(props) => props.theme.overdrop.textColor.quaternary};
    text-align: center;
    font-size: 24px;
    line-height: 24px;
    font-weight: 600;
    margin-top: 13px;
    margin-bottom: 3px;
`;

const SubTitle = styled.p`
    color: ${(props) => props.theme.overdrop.textColor.quaternary};
    text-align: center;
    font-size: 16px;
    font-weight: 600;
    line-height: 16px;
`;

const Box = styled.div`
    border-radius: 12px;
    border: 1px solid ${(props) => props.theme.overdrop.textColor.quaternary};
    padding: 16px 10px;
    color: ${(props) => props.theme.overdrop.textColor.quaternary};
    font-size: 14px;
    font-weight: 400;
    line-height: normal;
    text-align: left;
    margin-top: 12px;
    margin-bottom: 24px;
`;

const ItemContainer = styled(FlexDiv)`
    width: fit-content;
    flex-direction: row;
    align-items: center;
    width: 100%;
    justify-content: space-between;
    margin: 5px 0px;
    color: ${(props) => props.theme.textColor.senary};
`;

const ItemLabel = styled(FlexDiv)`
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    margin-right: 15px;
`;

const ItemDescription = styled.div`
    display: block;
    align-items: center;
    overflow-wrap: break-word;
    width: fit-content;
    font-weight: 500;
`;

const ButtonContainer = styled(FlexDiv)`
    align-items: center;
    justify-content: center;
    width: 100%;
`;

const ZebraIcon = styled(Zebra)`
    text-align: center;
    height: 55px;
    width: 255px;
    path {
        fill: ${(props) => props.theme.textColor.senary};
    }
`;

const ActivateButton = styled.div`
    border-radius: 12px;
    background: ${(props) => props.theme.textColor.primary};
    color: ${(props) => props.theme.overdrop.textColor.quaternary};
    text-align: center;
    font-size: 16px;
    font-weight: 700;
    height: 56px;
    padding: 18px;
    width: 100%;
    cursor: pointer;
`;

export default WithdrawalConfirmationModal;
