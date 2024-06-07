import Scroll from 'components/Scroll';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { ThemeInterface } from '../../../../../../types/ui';
import Parlay from '../../ParlayV2';

type ParylayMobileModalProps = {
    onClose: () => void;
    isOpen: boolean;
};

const ParylayMobileModal: React.FC<ParylayMobileModalProps> = ({ onClose, isOpen }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    return (
        <ReactModal
            isOpen={isOpen}
            onRequestClose={onClose}
            shouldCloseOnOverlayClick={false}
            style={getCustomModalStyles(theme)}
        >
            <Container>
                <Header>
                    <Title>{t('markets.parlay.ticket-slip')}</Title>
                </Header>
                <CloseIcon className="icon icon--close" onClick={onClose} />
                <Scroll height="calc(100vh">
                    <Parlay />
                </Scroll>
            </Container>
        </ReactModal>
    );
};

const Container = styled(FlexDivColumnCentered)`
    background: ${(props) => props.theme.background.quinary};
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 4;
`;

const Header = styled(FlexDivRow)`
    min-height: 45px;
    justify-content: center;
`;

const Title = styled(FlexDivCentered)`
    color: ${(props) => props.theme.textColor.septenary};
    font-weight: 600;
    font-size: 14px;
    line-height: 14px;
    text-transform: uppercase;
    height: 30px;
    margin-top: 8px;
`;

const CloseIcon = styled.i`
    color: ${(props) => props.theme.textColor.secondary};
    position: absolute;
    cursor: pointer;
    right: 0px;
    top: 0px;
    font-size: 18px;
    padding: 14px 16px;
`;

const getCustomModalStyles = (theme: ThemeInterface) => ({
    content: {
        top: '0',
        overflow: 'auto',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        padding: '0px',
        background: 'transparent',
        border: 'none',
        width: '100%',
        height: '100vh',
    },
    overlay: {
        backgroundColor: theme.background.secondary,
        zIndex: '1000',
    },
});

export default ParylayMobileModal;
