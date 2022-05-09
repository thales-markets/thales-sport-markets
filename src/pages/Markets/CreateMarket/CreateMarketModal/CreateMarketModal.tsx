import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsWalletConnected } from 'redux/modules/wallet';
import onboardConnector from 'utils/onboardConnector';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered } from 'styles/common';
import Button from 'components/Button';
import Modal from 'components/Modal';
import { LINKS } from 'constants/links';
import { formatCurrencyWithKey } from 'utils/formatters/number';
import { DEFAULT_CURRENCY_DECIMALS, PAYMENT_CURRENCY } from 'constants/currency';

type CreateMarketModalProps = {
    isSubmitting: boolean;
    onSubmit: () => void;
    onClose: () => void;
    fixedBondAmount: number | string;
};

export const CreateMarketModal: React.FC<CreateMarketModalProps> = ({
    isSubmitting,
    onSubmit,
    onClose,
    fixedBondAmount,
}) => {
    const { t } = useTranslation();
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));

    const isButtonDisabled = !isWalletConnected || isSubmitting;

    const getSubmitButton = () => {
        if (!isWalletConnected) {
            return (
                <ModalButton onClick={() => onboardConnector.connectWallet()}>
                    {t('common.wallet.connect-your-wallet')}
                </ModalButton>
            );
        }
        return (
            <ModalButton
                disabled={isButtonDisabled}
                onClick={() => {
                    onClose();
                    onSubmit();
                }}
            >
                {t('market.create-market.modal.button-label')}
            </ModalButton>
        );
    };

    return (
        <Modal title={t('market.create-market.modal.title')} onClose={onClose} shouldCloseOnOverlayClick={false}>
            <Container>
                <Trans
                    i18nKey={'market.create-market.modal.text'}
                    components={[
                        <p key="0">
                            <ModalLink href={LINKS.ThalesGithubGuidelines} text="Thales github" />
                        </p>,
                        <p key="1">
                            <ModalLink href={LINKS.ThalesDiscord} text="Thales discord" />
                        </p>,
                        <p key="2">
                            <ModalLink href={LINKS.ThalesTip28} text="TIP-28" />
                        </p>,
                        <p key="3" />,
                    ]}
                    values={{
                        amount: formatCurrencyWithKey(
                            PAYMENT_CURRENCY,
                            fixedBondAmount,
                            DEFAULT_CURRENCY_DECIMALS,
                            true
                        ),
                    }}
                />
                <ButtonContainer>{getSubmitButton()}</ButtonContainer>
            </Container>
        </Modal>
    );
};

const Container = styled(FlexDivColumnCentered)`
    color: ${(props) => props.theme.textColor.primary};
    font-style: normal;
    font-weight: 600;
    font-size: 18px;
    line-height: 20px;
    text-align: justify;
    max-width: 600px;
    p {
        margin-bottom: 15px;
    }
`;

const ButtonContainer = styled(FlexDivCentered)`
    margin: 30px 0 0 0;
`;

const ModalButton = styled(Button)``;

const Link = styled.a`
    color: #f983a5;
    &:hover {
        text-decoration: underline;
    }
`;

type ModalLinkProps = {
    href: string;
    text: string;
};

const ModalLink: React.FC<ModalLinkProps> = ({ href, text }) => {
    return (
        <Link target="_blank" rel="noreferrer" href={href}>
            {text}
        </Link>
    );
};

export default CreateMarketModal;
