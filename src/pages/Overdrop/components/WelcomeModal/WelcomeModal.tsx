import React from 'react';

import SPAAnchor from 'components/SPAAnchor';
import ROUTES from 'constants/routes';
import { Trans, useTranslation } from 'react-i18next';
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
                    <Header>
                        <Trans i18nKey="overdrop.modal.check-out" components={{ br: <br /> }} />
                    </Header>
                    <SubHeader>{t('overdrop.modal.gain-xp-label')}</SubHeader>
                </TextWrapper>
                <SPAAnchor onClick={() => onClose()} href={ROUTES.Overdrop}>
                    <Button>{t('overdrop.modal.go-to-overdrop')}</Button>
                </SPAAnchor>
            </Wrapper>
        </BaseModal>
    );
};

const Wrapper = styled(FlexDivColumn)`
    width: 500px;
    align-items: center;
    justify-content: center;
    padding: 15px 20px 30px 20px;
    @media (max-width: 767px) {
        width: 95%;
    }
`;

const TextWrapper = styled(FlexDivColumn)`
    margin-top: 80px;
    margin-bottom: 260px;
    align-items: center;
    justify-content: center;
    text-align: center;
    @media (max-width: 767px) {
        margin-top: 30px;
        margin-bottom: 80px;
    }
`;

const Header = styled.span`
    color: ${(props) => props.theme.overdrop.textColor.septenary};
    font-size: 32px;
    font-weight: 900;
    text-transform: uppercase;
    line-height: 130%;
    @media (max-width: 767px) {
        font-size: 22px;
    }
`;

const SubHeader = styled.span`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 15px;
    font-weight: 600;
    @media (max-width: 767px) {
        font-size: 12px;
    }
`;

const Button = styled(FlexDiv)`
    background-color: ${(props) => props.theme.overdrop.button.background.primary};
    color: ${(props) => props.theme.overdrop.button.textColor.primary};
    padding: 5px 70px;
    text-transform: uppercase;
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
    text-align: center;
    @media (max-width: 767px) {
        font-size: 14px;
    }
`;

export default WelcomeModal;
