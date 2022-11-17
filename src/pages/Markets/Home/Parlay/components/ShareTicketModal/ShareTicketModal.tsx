import TimeProgressBar from 'components/TimeProgressBar';
import useInterval from 'hooks/useInterval';
import { t } from 'i18next';
import React from 'react';
import ReactModal from 'react-modal';
import styled from 'styled-components';
import { FlexDivColumnCentered } from 'styles/common';
import { ParlaysMarket } from 'types/markets';
import MyTicket from '../MyTicket';
import { TwitterIcon } from '../styled-components';

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

const ShareTicketModal: React.FC<ShareTicketModalProps> = ({ markets, totalQuote, paid, payout, onClose }) => {
    const CLOSE_AFTER_SECONDS = 500;

    useInterval(async () => {
        onClose();
    }, CLOSE_AFTER_SECONDS * 1000);

    return (
        <ReactModal isOpen onRequestClose={onClose} shouldCloseOnOverlayClick={true} style={customStyles}>
            <Container>
                <TimeProgressBar durationInSec={CLOSE_AFTER_SECONDS} increasing={false} />
                <CloseIcon className={`icon icon--close`} onClick={onClose} />
                <MyTicket markets={markets} totalQuote={totalQuote} paid={paid} payout={payout} />
                <TwitterShare>
                    <TwitterIcon fontSize={'30px'} />
                    <TwitterShareLabel>{t('markets.parlay.share-ticket.share')}</TwitterShareLabel>
                </TwitterShare>
            </Container>
        </ReactModal>
    );
};

const Container = styled(FlexDivColumnCentered)`
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

const TwitterShare = styled(FlexDivColumnCentered)`
    align-items: center;
    position: absolute;
    left: 0;
    right: 0;
    bottom: -100px;
    margin-left: auto;
    margin-right: auto;
    width: 84px;
    height: 84px;
    border-radius: 50%;
    background: linear-gradient(217.61deg, #123eae 9.6%, #3ca8ca 78.9%);
    cursor: pointer;
`;

const TwitterShareLabel = styled.span`
    font-weight: 800;
    font-size: 18px;
    line-height: 25px;
    text-transform: uppercase;
    color: #ffffff;
`;

export default React.memo(ShareTicketModal);
