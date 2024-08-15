import Modal from 'components/Modal';
import React from 'react';

import ModalBackgroundImage from 'assets/images/overdrop/welcome-modal-background.png';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumn } from 'styles/common';

const MainModal: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Modal
            title={''}
            onClose={() => console.log('Test')}
            shouldCloseOnOverlayClick={false}
            removeWrapperBackground={true}
            customStyle={{
                overlay: { zIndex: 2000 },
                content: {
                    backgroundImage: `url(${ModalBackgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat',
                    borderRadius: '4px',
                    padding: '10px',
                },
            }}
        >
            <Wrapper>
                <TextWrapper>
                    <Header>{t('overdrop.modal.check-out')}</Header>
                    <SubHeader>{t('overdrop.modal.gain-xp-label')}</SubHeader>
                </TextWrapper>
                <Button>{t('overdrop.modal.go-to-overdrop')}</Button>
            </Wrapper>
        </Modal>
    );
};

const Wrapper = styled(FlexDivColumn)`
    font-family: 'Roboto' !important;
    align-items: center;
    justify-content: center;
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

export default MainModal;
