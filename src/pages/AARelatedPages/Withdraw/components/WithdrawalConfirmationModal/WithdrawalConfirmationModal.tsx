import Modal from 'components/Modal';
import { Network } from 'enums/network';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import { Coins } from 'types/tokens';
import { executeBiconomyTransaction, getGasFeesForTx } from 'utils/biconomy';
import { coinParser } from 'utils/formatters/ethers';
import { formatCurrencyWithKey } from 'utils/formatters/number';
import { getNetworkNameByNetworkId } from 'utils/network';
import networkConnector from 'utils/networkConnector';

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

    const [gas, setGas] = useState(0);

    const networkName = useMemo(() => {
        return getNetworkNameByNetworkId(network);
    }, [network]);

    const parsedAmount = useMemo(() => {
        return coinParser('' + amount, network, token);
    }, [amount, network, token]);

    useEffect(() => {
        const { signer, multipleCollateral } = networkConnector;
        if (multipleCollateral && signer) {
            const collateralContractWithSigner = multipleCollateral[token]?.connect(signer);
            getGasFeesForTx(collateralContractWithSigner?.address as string, collateralContractWithSigner, 'transfer', [
                withdrawalAddress,
                parsedAmount,
            ]).then((estimateGas) => {
                setGas(estimateGas as number);
            });
        }
    }, [token, parsedAmount, withdrawalAddress]);

    return (
        <Modal title={t('withdraw.confirmation-modal.title')} onClose={() => onClose()}>
            <MainContainer>
                <ListContainer>
                    <List>
                        <li>
                            {t('withdraw.confirmation-modal.correct-address', {
                                token,
                                networkName,
                            })}
                        </li>
                        <li>{t('withdraw.confirmation-modal.withdrawal-transaction-warning')}</li>
                    </List>
                </ListContainer>
                <DetailsContainer>
                    <ItemContainer>
                        <ItemLabel>{t('withdraw.amount')}:</ItemLabel>
                        <ItemDescription>
                            {<TokenIcon className={`currency-icon currency-icon--${token.toLowerCase()}`} />}
                            {formatCurrencyWithKey(token, amount)}
                            {` (${t('withdraw.confirmation-modal.withdrawal-fee')}: ${formatCurrencyWithKey(
                                token,
                                gas,
                                4
                            )})`}
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
                    <Button
                        onClick={async () => {
                            const { signer, multipleCollateral } = networkConnector;
                            if (multipleCollateral && signer) {
                                const collateralContractWithSigner = multipleCollateral[token]?.connect(signer);
                                await executeBiconomyTransaction(
                                    collateralContractWithSigner?.address as string,
                                    collateralContractWithSigner,
                                    'transfer',
                                    [withdrawalAddress, parsedAmount]
                                );
                            }
                        }}
                    >
                        {t('withdraw.confirmation-modal.confirm')}
                    </Button>
                </ButtonContainer>
            </MainContainer>
        </Modal>
    );
};

const MainContainer = styled(FlexDiv)`
    padding: 30px 20px 10px 20px;
    flex-direction: column;
    max-width: 550px;
`;

const ListContainer = styled(FlexDiv)`
    font-size: 18px;
    font-weight: 400;
    text-transform: capitalize;
    word-wrap: break-word;
    color: ${(props) => props.theme.textColor.primary};
`;

const List = styled.ol`
    list-style-type: decimal;
    line-height: 24px;
    list-style-position: inside;
`;

const TokenIcon = styled.i`
    font-size: 25px;
    margin-right: 5px;
    color: ${(props) => props.theme.textColor.primary};
`;

const DetailsContainer = styled(FlexDiv)`
    width: 100%;
    margin-top: 10px;
    flex-direction: column;
    background-color: ${(props) => props.theme.connectWalletModal.totalBalanceBackground};
    padding: 18px;
`;

const ItemContainer = styled(FlexDiv)`
    width: 100%;
    flex-direction: row;
    align-items: center;
    margin: 5px 0px;
    color: ${(props) => props.theme.textColor.primary};
`;

const ItemLabel = styled(FlexDiv)`
    align-items: center;
    font-size: 18px;
    font-weight: 700;
    text-transform: capitalize;
    margin-right: 15px;
`;

const ItemDescription = styled(FlexDiv)`
    align-items: center;
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
    font-weight: 700;
    text-transform: uppercase;
    border-radius: 5px;
`;

export default WithdrawalConfirmationModal;
