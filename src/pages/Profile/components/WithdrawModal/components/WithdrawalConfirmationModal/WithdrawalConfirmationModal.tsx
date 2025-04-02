import { PaymasterMode } from '@biconomy/account';
import Modal from 'components/Modal';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { ContractType } from 'enums/contract';
import { Network } from 'enums/network';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { FlexDiv, FlexDivRow } from 'styles/common';
import { coinParser, Coins, formatCurrencyWithKey } from 'thales-utils';
import { RootState } from 'types/redux';
import { ThemeInterface } from 'types/ui';
import { executeBiconomyTransactionWithConfirmation } from 'utils/biconomy';
import biconomyConnector from 'utils/biconomyWallet';
import { getCollateralIndex } from 'utils/collaterals';
import { getContractInstance } from 'utils/contract';
import { getNetworkNameByNetworkId } from 'utils/network';
import { refetchBalances } from 'utils/queryConnector';
import useBiconomy from 'utils/useBiconomy';
import { Address, Client } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { useAccount, useChainId, useClient, useWalletClient } from 'wagmi';

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
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const walletClient = useWalletClient();
    const networkId = useChainId();
    const client = useClient();

    const { address } = useAccount();
    const smartAddres = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddres : address) || '';

    const networkName = useMemo(() => {
        return getNetworkNameByNetworkId(network);
    }, [network]);

    const parsedAmount = useMemo(() => {
        return coinParser('' + amount, network, token);
    }, [amount, network, token]);

    const handleSubmit = async () => {
        const id = toast.loading(t('withdraw.toast-messages.pending'));

        try {
            let txHash;

            if (token === 'ETH') {
                const transaction = {
                    to: withdrawalAddress as Address,
                    value: parsedAmount,
                };
                if (isBiconomy) {
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
                    txHash = await walletClient.data?.sendTransaction(transaction);
                }
            } else {
                const collateralContractWithSigner = getContractInstance(
                    ContractType.MULTICOLLATERAL,
                    { client: walletClient.data, networkId },
                    getCollateralIndex(networkId, token)
                );

                if (isBiconomy) {
                    txHash = await executeBiconomyTransactionWithConfirmation({
                        networkId,
                        collateralAddress: collateralContractWithSigner?.address,
                        contract: collateralContractWithSigner,
                        methodName: 'transfer',
                        data: [withdrawalAddress, parsedAmount],
                    });
                } else {
                    txHash = await collateralContractWithSigner?.write.transfer([withdrawalAddress, parsedAmount]);
                }
            }

            const txReceipt = await waitForTransactionReceipt(client as Client, {
                hash: txHash,
            });

            if (txReceipt.status === 'success') {
                toast.update(id, getSuccessToastOptions(t('withdraw.toast-messages.success')));
                refetchBalances(walletAddress, networkId);
                onClose();
                return;
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
                <FlexDivRow>{<CloseIcon onClick={onClose} />}</FlexDivRow>
                <LogoIcon className="icon icon--overtime" />
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
                        <ItemDescription>{withdrawalAddress}</ItemDescription>
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
    color: ${(props) => props.theme.button.background.quinary};
    z-index: 1000;
`;

const TokenIcon = styled.i`
    font-size: 25px;
    margin-right: 5px;
    color: ${(props) => props.theme.textColor.senary};
    @media (max-width: 575px) {
        font-size: 18px;
    }
`;

const Header = styled.h2`
    color: ${(props) => props.theme.overdrop.textColor.quaternary};
    text-align: center;
    font-size: 24px;
    line-height: 24px;
    font-weight: 600;
    margin-top: 13px;
    margin-bottom: 10px;
    @media (max-width: 575px) {
        font-size: 20px;
    }
`;

const SubTitle = styled.p`
    max-width: 420px;
    color: ${(props) => props.theme.overdrop.textColor.quaternary};
    text-align: center;
    font-size: 16px;
    font-weight: 600;
    line-height: 16px;
    @media (max-width: 575px) {
        font-size: 14px;
    }
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
    @media (max-width: 575px) {
        width: 100%;
        padding: 5px 5px;
    }
`;

const ItemContainer = styled(FlexDiv)`
    width: fit-content;
    flex-direction: row;
    align-items: center;
    width: 100%;
    justify-content: space-between;
    margin: 5px 0px;
    color: ${(props) => props.theme.textColor.senary};
    @media (max-width: 575px) {
        flex-direction: column;
    }
`;

const ItemLabel = styled(FlexDiv)`
    align-items: center;
    font-size: 14px;
    line-height: 20px;
    margin-right: 15px;
    font-weight: 700;
    @media (max-width: 575px) {
        font-size: 12px;
        line-height: 18px;
    }
`;

const ItemDescription = styled.div`
    display: block;
    align-items: center;
    overflow-wrap: break-word;
    width: fit-content;
    font-size: 14px;
    line-height: 20px;
    font-weight: 500;
    @media (max-width: 575px) {
        font-size: 12px;
        line-height: 18px;
    }
`;

const ButtonContainer = styled(FlexDiv)`
    align-items: center;
    justify-content: center;
    width: 100%;
`;

const ActivateButton = styled.div`
    border-radius: 8px;
    background: ${(props) => props.theme.textColor.primary};
    color: ${(props) => props.theme.overdrop.textColor.quaternary};
    text-align: center;
    font-size: 16px;
    font-weight: 700;
    height: 44px;
    padding: 14px;
    width: 100%;
    cursor: pointer;
    text-transform: uppercase;
`;

const LogoIcon = styled.i`
    font-size: 250px;
    line-height: 56px;
    color: ${(props) => props.theme.textColor.senary};
    @media (max-width: 575px) {
        font-size: 200px;
        line-height: 48px;
    }
`;

const CloseIcon = styled.i.attrs({ className: 'icon icon--close' })`
    color: ${(props) => props.theme.textColor.senary};
    font-size: 14px;
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
`;

export default WithdrawalConfirmationModal;
