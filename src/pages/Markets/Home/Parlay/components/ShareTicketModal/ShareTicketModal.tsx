import React from 'react';
import ReactModal from 'react-modal';
import styled from 'styled-components';
import { FlexDivColumnCentered } from 'styles/common';
import { ParlaysMarket } from 'types/markets';
import MyTicket from '../MyTicket';

type ShareTicketModalProps = {
    markets: ParlaysMarket[];
    totalQuote: number;
    paid: number;
    payout: number;
    onClose: () => void;
};

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        padding: '0px',
        background: 'transparent',
        border: 'none',
        borderRadius: '20px',
        boxShadow: '0px 0px 59px 11px rgba(100, 217, 254, 0.89)',
        overflow: 'visibile',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        zIndex: '1501', // .MuiTooltip-popper has 1500 and validation message pops up from background
    },
};

export const ShareTicketModal: React.FC<ShareTicketModalProps> = ({ markets, totalQuote, paid, payout, onClose }) => {
    return (
        <ReactModal isOpen onRequestClose={onClose} shouldCloseOnOverlayClick={true} style={customStyles}>
            <Container>
                <CloseIcon className={`icon icon--close`} onClick={onClose} />
                <MyTicket markets={markets} totalQuote={totalQuote} paid={paid} payout={payout} />
            </Container>
        </ReactModal>
    );
};

const Container = styled(FlexDivColumnCentered)`
    z-index: 1001;
    max-width: 400px;
    padding: 15px;
    flex: none;
    background: linear-gradient(180deg, #303656 0%, #1a1c2b 100%);
    border-radius: 10px;
`;

const CloseIcon = styled.i`
    position: absolute;
    top: -40px;
    right: -30px;
    font-size: 20px;
    cursor: pointer;
    color: #ffffff;
`;

export default ShareTicketModal;
