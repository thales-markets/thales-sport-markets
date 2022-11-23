import { getSuccessToastOptions, getErrorToastOptions } from 'config/toast';
import { LINKS } from 'constants/links';
import { toPng } from 'html-to-image';
import { t } from 'i18next';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import ReactModal from 'react-modal';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { FlexDivColumnCentered } from 'styles/common';
import { ParlaysMarket } from 'types/markets';
import MySimpleTicket from './components/MySimpleTicket';
import MyTicket from './components/MyTicket';
import { TwitterIcon } from '../styled-components';
import DisplayOptions from './components/DisplayOptions';
import { DisplayOptionsType } from './components/DisplayOptions/DisplayOptions';
import { getOnImageError, getTeamImageSource } from 'utils/images';

type ShareTicketModalProps = {
    markets: ParlaysMarket[];
    totalQuote: number;
    paid: number;
    payout: number;
    profitPercentage?: number;
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

const TWITTER_MESSAGE = '<PASTE YOUR IMAGE>';

const ShareTicketModal: React.FC<ShareTicketModalProps> = ({
    markets,
    totalQuote,
    paid,
    payout,
    profitPercentage,
    onClose,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [toastId, setToastId] = useState<string | number>(0);

    const defaultDisplayOptions: DisplayOptionsType = {
        isSimpleView: false,
        showUsdAmount: true,
        showPercentage: false,
        showTimestamp: true,
    };
    const [displayOptions, setDisplayOptions] = useState<DisplayOptionsType>(defaultDisplayOptions);

    const ref = useRef<HTMLDivElement>(null);

    const market = markets[0];
    const [homeLogoSrc, setHomeLogoSrc] = useState(getTeamImageSource(market.homeTeam, market.tags[0]));
    const [awayLogoSrc, setAwayLogoSrc] = useState(getTeamImageSource(market.awayTeam, market.tags[0]));

    useEffect(() => {
        setHomeLogoSrc(getTeamImageSource(market.homeTeam, market.tags[0]));
        setAwayLogoSrc(getTeamImageSource(market.awayTeam, market.tags[0]));
    }, [market.homeTeam, market.awayTeam, market.tags]);

    const saveImageAndOpenTwitter = useCallback(
        async (toastIdParam: string | number) => {
            if (!isLoading) {
                if (ref.current === null) {
                    return;
                }

                try {
                    const base64Image = await toPng(ref.current, { cacheBust: true });
                    const b64Blob = (await fetch(base64Image)).blob();
                    const cbi = new ClipboardItem({
                        'image/png': b64Blob,
                    });
                    await navigator.clipboard.write([cbi]);

                    if (ref.current === null) {
                        return;
                    }

                    toast.update(
                        toastIdParam,
                        getSuccessToastOptions(
                            <>
                                {t('market.toast-message.image-created')}
                                <br />
                                {t('market.toast-message.open-twitter')}
                            </>
                        )
                    );

                    setTimeout(() => {
                        window.open(LINKS.TwitterStatus + TWITTER_MESSAGE);
                        setIsLoading(false);
                        onClose();
                    }, 3000);
                } catch (e) {
                    console.log(e);
                    setIsLoading(false);
                    toast.update(toastIdParam, getErrorToastOptions(t('market.toast-message.save-image-error')));
                }
            }
        },
        [isLoading, onClose]
    );

    const onTwitterShareClick = () => {
        if (!isLoading) {
            const id = toast.loading(t('market.toast-message.save-image'));
            setToastId(id);
            setIsLoading(true);

            // If image creation is not postponed with timeout toaster is not displayed immediately, it is rendered in parallel with toPng() execution.
            // Function toPng is causing UI to freez for couple of seconds and there is no notification message during that time, so it confuses user.
            setTimeout(() => {
                saveImageAndOpenTwitter(id);
            }, 100);
        }
    };

    const onModalClose = () => {
        if (isLoading) {
            toast.update(toastId, getErrorToastOptions(t('market.toast-message.save-image-cancel')));
        }
        onClose();
    };

    return (
        <>
            <ReactModal
                isOpen
                onRequestClose={onModalClose}
                shouldCloseOnOverlayClick={true}
                style={customStyles}
                contentElement={(props, children) => (
                    <>
                        <div {...props}>{children}</div>
                        <DisplayOptions
                            setDisplayOptions={setDisplayOptions}
                            onShare={onTwitterShareClick}
                            isDisabled={isLoading}
                        />
                    </>
                )}
            >
                <Container ref={ref} isSimpleView={displayOptions.isSimpleView}>
                    <CloseIcon className={`icon icon--close`} onClick={onClose} />
                    {displayOptions.isSimpleView ? (
                        <>
                            {markets.length === 1 && (
                                <>
                                    <ClubWrapper>
                                        <ClubLogo
                                            alt="Home team logo"
                                            src={homeLogoSrc}
                                            isFlag={market.tags[0] == 9018}
                                            onError={getOnImageError(setHomeLogoSrc, market.tags[0])}
                                        />
                                    </ClubWrapper>
                                    <ClubWrapper awayTeam={true}>
                                        <ClubLogo
                                            awayTeam={true}
                                            alt="Away team logo"
                                            src={awayLogoSrc}
                                            isFlag={market.tags[0] == 9018}
                                            onError={getOnImageError(setAwayLogoSrc, market.tags[0])}
                                        />
                                    </ClubWrapper>
                                </>
                            )}
                            <MySimpleTicket
                                markets={markets}
                                paid={paid}
                                payout={payout}
                                profitPercentage={profitPercentage}
                                displayOptions={displayOptions}
                            />
                        </>
                    ) : (
                        <MyTicket
                            markets={markets}
                            totalQuote={totalQuote}
                            paid={paid}
                            payout={payout}
                            profitPercentage={profitPercentage}
                            displayOptions={displayOptions}
                        />
                    )}
                    <TwitterShare disabled={isLoading} onClick={onTwitterShareClick}>
                        <TwitterIcon disabled={isLoading} fontSize={'30px'} />
                        <TwitterShareLabel>{t('markets.parlay.share-ticket.share')}</TwitterShareLabel>
                    </TwitterShare>
                </Container>
            </ReactModal>
        </>
    );
};

const Container = styled(FlexDivColumnCentered)<{ isSimpleView: boolean }>`
    min-width: 300px;
    padding: 15px;
    flex: none;
    background: ${(props) =>
        props.isSimpleView
            ? 'linear-gradient(135deg, #070814 0%, #424470 100%)'
            : 'linear-gradient(180deg, #303656 0%, #1a1c2b 100%)'};
    border-radius: 10px;
`;

const ClubWrapper = styled.div<{ awayTeam?: boolean }>`
    position: absolute;
    overflow: hidden;
    ${(props) => (props.awayTeam ? 'right: 0;' : 'left: 0;')}
    width: 250px;
    height: 250px;
`;

const ClubLogo = styled.img<{ isFlag?: boolean; awayTeam?: boolean }>`
    position: absolute;
    ${(props) => (props.awayTeam ? 'right: ' : 'left: ')}-70px;
    ${(props) => (props.isFlag ? 'object-fit: cover;' : '')}
    ${(props) => (props.isFlag ? 'border-radius: 50%;' : '')}
    height: 100%;
    width: 100%;
    opacity: 0.15;
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

export default React.memo(ShareTicketModal);
