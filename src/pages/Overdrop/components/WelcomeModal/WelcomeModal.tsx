import React from 'react';

import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumn } from 'styles/common';
import { ModalTypes } from 'types/overdrop';
import BaseModal from '../BaseModal';

type WelcomeModalProps = {
    onClose: () => void;
};

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
    const { t } = useTranslation();

    return (
        <BaseModal onClose={() => onClose()} type={ModalTypes.WELCOME}>
            <Wrapper>
                <TextWrapper>
                    <Header>{t('overdrop.modal.check-out')}</Header>
                    <SubHeader>{t('overdrop.modal.gain-xp-label')}</SubHeader>
                </TextWrapper>
                <Button>{t('overdrop.modal.go-to-overdrop')}</Button>
            </Wrapper>
        </BaseModal>
    );
};

const Wrapper = styled(FlexDivColumn)`
    font-family: 'Roboto' !important;
    align-items: center;
    justify-content: center;
    padding: 15px 20px 30px 20px;
`;

const TextWrapper = styled(FlexDivColumn)`
    margin-top: 80px;
    margin-bottom: 260px;
    align-items: center;
    justify-content: center;
    text-align: center;
`;

const Header = styled.span`
    color: ${(props) => props.theme.overdrop.textColor.septenary};
    font-size: 32px;
    font-weight: 900;
    text-transform: uppercase;
    line-height: 130%;
`;

const SubHeader = styled.span`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 15px;
    font-weight: 600;
`;

const Button = styled(FlexDiv)`
    background-color: ${(props) => props.theme.overdrop.button.background.primary};
    color: ${(props) => props.theme.overdrop.button.textColor.primary};
    padding: 5px 70px;
    text-transform: uppercase;
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
`;

export default WelcomeModal;
