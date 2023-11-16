import Modal from 'components/Modal';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import { Coins } from 'types/tokens';
import { formatCurrencyWithKey } from 'utils/formatters/number';

type WithdrawalConfirmationModalProps = {
    amount: number;
    token: Coins;
    withdrawalAddress: string;
    network: string | undefined;
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

    return (
        <Modal title={t('withdraw.confirmation-modal.title')} onClose={() => onClose()}>
            <MainContainer>
                <ListContainer>
                    <List>
                        <li>{t('withdraw.confirmation-modal.correct-address', { token, network })}</li>
                        <li>{t('withdraw.confirmation-modal.withdrawal-transaction-warning')}</li>
                    </List>
                </ListContainer>
                <DetailsContainer>
                    <ItemContainer>
                        <ItemLabel>{t('withdraw.amount')}:</ItemLabel>
                        <ItemDescription>
                            {formatCurrencyWithKey(CRYPTO_CURRENCY_MAP.USDC, amount)}
                            {` (${t('withdraw.confirmation-modal.withdrawal-fee')}: ${formatCurrencyWithKey(
                                CRYPTO_CURRENCY_MAP.USDC,
                                2
                            )})`}
                        </ItemDescription>
                    </ItemContainer>
                    <ItemContainer>
                        <ItemLabel>{t('withdraw.confirmation-modal.address')}:</ItemLabel>
                        <ItemDescription>{withdrawalAddress}</ItemDescription>
                    </ItemContainer>
                    <ItemContainer>
                        <ItemLabel>{t('withdraw.confirmation-modal.network')}:</ItemLabel>
                        <ItemDescription>{network}</ItemDescription>
                    </ItemContainer>
                </DetailsContainer>
            </MainContainer>
        </Modal>
    );
};

const MainContainer = styled(FlexDiv)`
    padding: 30px 20px 10px 20px;
    flex-direction: column;
    max-width: 500px;
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
`;

const DetailsContainer = styled(FlexDiv)`
    width: 100%;
    margin-top: 10px;
    flex-direction: column;
    background-color: ${(props) => props.theme.connectWalletModal.totalBalanceBackground};
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

export default WithdrawalConfirmationModal;
