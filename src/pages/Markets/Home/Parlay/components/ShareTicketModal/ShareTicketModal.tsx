// import SimpleLoader from 'components/SimpleLoader';
import { getSuccessToastOptions } from 'config/toast';
import { LINKS } from 'constants/links';
import { toPng } from 'html-to-image';
import { t } from 'i18next';
import React, { useCallback, useRef, useState } from 'react';
import ReactModal from 'react-modal';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { FlexDivColumnCentered } from 'styles/common';
import { ParlaysMarket } from 'types/markets';
import MySimpleTicket from '../MySimpleTicket';
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

const TWITTER_MESSAGE = 'My Ticket: <JUST PASTE HERE>';

const ShareTicketModal: React.FC<ShareTicketModalProps> = ({ markets, totalQuote, paid, payout, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSimpleView /*, setIsSimpleView*/] = useState(false);

    const ref = useRef<HTMLDivElement>(null);

    const onTwitterShareClick = useCallback(async () => {
        if (ref.current === null) {
            return;
        }
        setIsLoading(true);
        const id = toast.loading('Generating your image to clipboard...'); // TODO: translate

        const base64Image = await toPng(ref.current, { cacheBust: true });
        const b64Blob = (await fetch(base64Image)).blob();
        const cbi = new ClipboardItem({
            'image/png': b64Blob,
        });
        await navigator.clipboard.write([cbi]);

        toast.update(id, getSuccessToastOptions('Image is in your clipboard!')); // TODO: translate
        setTimeout(() => {
            window.open(LINKS.TwitterStatus + TWITTER_MESSAGE);
        }, 2000);

        if (ref.current === null) {
            return;
        }
        setIsLoading(false);
        onClose();
    }, [onClose]);

    return (
        <ReactModal isOpen onRequestClose={onClose} shouldCloseOnOverlayClick={true} style={customStyles}>
            <Container ref={ref}>
                <CloseIcon className={`icon icon--close`} onClick={onClose} />
                {isSimpleView ? (
                    <MySimpleTicket payout={payout} />
                ) : (
                    <MyTicket markets={markets} totalQuote={totalQuote} paid={paid} payout={payout} />
                )}
                <TwitterShare disabled={isLoading} onClick={onTwitterShareClick}>
                    <TwitterIcon disabled={isLoading} fontSize={'30px'} />
                    <TwitterShareLabel>{t('markets.parlay.share-ticket.share')}</TwitterShareLabel>
                </TwitterShare>
            </Container>
            {/* {isLoading && (
                <LoaderContainer>
                    <SimpleLoader />
                </LoaderContainer>
            )} */}
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
    top: -25px;
    right: -25px;
    font-size: 20px;
    cursor: pointer;
    color: #ffffff;
`;

const TwitterShare = styled(FlexDivColumnCentered)<{ disabled?: boolean }>`
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
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
    opacity: ${(props) => (props.disabled ? '0.4' : '1')};
`;

const TwitterShareLabel = styled.span`
    font-weight: 800;
    font-size: 18px;
    line-height: 25px;
    text-transform: uppercase;
    color: #ffffff;
`;

// const LoaderContainer = styled.div`
//     position: absolute;
//     left: -5px;
//     right: 0;
//     bottom: -56px;
// `;

export default React.memo(ShareTicketModal);
