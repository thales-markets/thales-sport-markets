import Scroll from 'components/Scroll';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useSelector } from 'react-redux';
import { getTicket } from 'redux/modules/ticket';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { SportMarkets } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import Parlay from '../../ParlayV2';

type TicketMobileModalProps = {
    onClose: () => void;
    isOpen: boolean;
    openMarkets?: SportMarkets;
};

const TicketMobileModal: React.FC<TicketMobileModalProps> = ({ onClose, isOpen, openMarkets }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const ticket = useSelector(getTicket);

    return (
        <ReactModal
            isOpen={isOpen}
            onRequestClose={onClose}
            shouldCloseOnOverlayClick={false}
            style={getCustomModalStyles(theme)}
        >
            <Container>
                <Header>
                    <Title>
                        {t('markets.parlay.ticket-slip')}
                        <Count>{ticket.length}</Count>
                    </Title>
                </Header>
                <CloseIcon className="icon icon--close" onClick={onClose} />
                <Scroll height="calc(100vh)">
                    <Parlay onSuccess={onClose} openMarkets={openMarkets} />
                </Scroll>
                <BackButtonContainer onClick={onClose}>
                    <i className="icon-homepage icon--arrow-left" />
                    <span>{t('market.back-to-markets')}</span>
                </BackButtonContainer>
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

const Count = styled(FlexDivCentered)`
    border-radius: 8px;
    min-width: 20px;
    color: ${(props) => props.theme.textColor.tertiary};
    background: ${(props) => props.theme.background.quaternary};
    padding: 0 5px;
    margin-left: 6px;
`;

const CloseIcon = styled.i`
    color: ${(props) => props.theme.textColor.secondary};
    position: absolute;
    cursor: pointer;
    right: 0px;
    top: 0px;
    font-size: 18px;
    padding: 14px 18px;
`;

const getCustomModalStyles = (theme: ThemeInterface) => ({
    content: {
        top: '0',
        overflow: 'auto',
        left: '0',
        right: 'auto',
        bottom: 'auto',
        padding: '0px',
        background: 'transparent',
        border: 'none',
        width: '100%',
        height: '100vh',
        color: theme.textColor.primary,
    },
    overlay: {
        backgroundColor: theme.background.secondary,
        zIndex: '13',
    },
});

const BackButtonContainer = styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 48px;
    color: ${(props) => props.theme.textColor.primary};
    background: ${(props) => props.theme.background.secondary};
    z-index: 11;
    i {
        font-size: 24px;
        font-weight: 600;
    }
    span {
        font-size: 14px;
        text-transform: uppercase;
        font-weight: 600;
    }
`;

export default TicketMobileModal;
