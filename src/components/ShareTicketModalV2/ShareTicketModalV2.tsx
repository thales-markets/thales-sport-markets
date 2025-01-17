import axios from 'axios';
import Button from 'components/Button';
import { Input } from 'components/fields/common';
import { generalConfig } from 'config/general';
import { defaultToastOptions, getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { LINKS } from 'constants/links';
import { secondsToMilliseconds } from 'date-fns';
import { toPng } from 'html-to-image';
import { t } from 'i18next';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactModal from 'react-modal';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/app';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivColumnCentered, FlexDivRowCentered } from 'styles/common';
import { Coins, isFirefox, isIos, isMetamask } from 'thales-utils';
import { SystemBetData, TicketMarket } from 'types/markets';
import { RootState } from 'types/redux';
import { refetchOverdropMultipliers } from 'utils/queryConnector';
import { useAccount } from 'wagmi';
import MyTicket from './components/MyTicket';

export type ShareTicketModalProps = {
    markets: TicketMarket[];
    multiSingle: boolean;
    paid: number;
    payout: number;
    onClose: () => void;
    isTicketLost: boolean;
    collateral: Coins;
    isLive: boolean;
    applyPayoutMultiplier: boolean;
    isTicketOpen: boolean;
    systemBetData?: SystemBetData;
};

const PARLAY_IMAGE_NAME = 'ParlayImage.png';
const TWITTER_MESSAGES_TEXT = [
    `I just placed this bet on @OvertimeMarkets! %0ATry it yourself on ${LINKS.Overtime}`,
    `This is my @OvertimeMarkets bet. Let's get it! %0ATry it yourself on ${LINKS.Overtime}`,
    `Just flexing my @OvertimeMarkets bet! %0ATake a shot yourself at ${LINKS.Overtime}`,
    `Peep my @OvertimeMarkets onchain bet! %0ATry your luck as well on ${LINKS.Overtime}`,
    `Another day, another bet locked in on @OvertimeMarkets. Let’s ride this one out! 🌪️ ${LINKS.Overtime}`,
    `If this bet cashes, beers on me! 💰 Come join the action on @OvertimeMarkets: ${LINKS.Overtime}`,
    `Smokin’ odds, guaranteed payouts, and I keep my privacy? @OvertimeMarkets is where it’s at. 👀 ${LINKS.Overtime}`,
    `I’m running it up on @OvertimeMarkets. No bans, no limits, just straight betting 🔥 ${LINKS.Overtime}`,
    `Just placed my bet on @OvertimeMarkets. No sweat, smart contracts got me covered! 💸 ${LINKS.Overtime}`,
    `Made this bet on @OvertimeMarkets, and I’m ready to flex hard. Who’s joining? 💪 ${LINKS.Overtime}`,
    `Betting where it counts ${LINKS.Overtime}  On-chain and guaranteed payouts with @OvertimeMarkets. 🙌`,
    `Just secured another bet on @OvertimeMarkets. Let’s cash this in and flex hard! 💪 ${LINKS.Overtime}`,
    `This bet hits, and it’s beers all weekend! 🍻 @OvertimeMarkets making it easy to stay winning. ${LINKS.Overtime}`,
    `Running the odds like a boss on @OvertimeMarkets – no bans, all gains. 💥 ${LINKS.Overtime}`,
    `Great odds, smart contracts, and I’m fully in. You betting on @OvertimeMarkets yet? 💪 ${LINKS.Overtime}`,
    `Taking my betting game to the next level with @OvertimeMarkets. Join the movement! ⚡ ${LINKS.Overtime}`,
    `Levelling up my game with @OvertimeMarkets! Are you ready to take the plunge? 🔥 ${LINKS.Overtime}`,
];

const OVER_COLLATERAL_TWITTER_MESSAGES_TEXT = [
    `Here to stack OVER and bets on @OvertimeMarkets – let’s gooo! 💥 ${LINKS.Overtime}`,
    `Another day, another OVER bet locked in on @OvertimeMarkets – Who's joining the action? 🦓 ${LINKS.Overtime}`,
];

const TWITTER_MESSAGE_PASTE = '%0A<PASTE YOUR IMAGE>';
const TWITTER_MESSAGE_UPLOAD = `%0A<UPLOAD YOUR ${PARLAY_IMAGE_NAME}>`;

const ShareTicketModal: React.FC<ShareTicketModalProps> = ({
    markets,
    multiSingle,
    paid,
    payout,
    onClose,
    isTicketLost,
    collateral,
    isLive,
    applyPayoutMultiplier,
    isTicketOpen,
    systemBetData,
}) => {
    const walletAddress = useAccount()?.address || '';
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const [isLoading, setIsLoading] = useState(false);
    const [toastId, setToastId] = useState<string | number>(0);
    const [isMetamaskBrowser, setIsMetamaskBrowser] = useState(false);
    const [tweetUrl, setTweetUrl] = useState('');

    const ref = useRef<HTMLDivElement>(null);

    const isOver = useMemo(() => isOverCurrency(collateral), [collateral]);

    const customStyles = {
        content: {
            top: isMobile ? '35px' : '40%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            transform: isMobile ? 'translateX(-50%)' : 'translate(-50%, -50%)',
            padding: '0px',
            background: 'transparent',
            border: 'none',
            overflow: isMobile ? 'visible scroll' : 'visible',
            height: isMobile ? 'calc(100vh - 84px)' : 'unset',
        },
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            zIndex: '1501', // .MuiTooltip-popper has 1500 and validation message pops up from background
        },
    };

    useEffect(() => {
        const checkMetamaskBrowser = async () => {
            const isMMBrowser = (await isMetamask()) && isMobile;
            setIsMetamaskBrowser(isMMBrowser);
        };
        checkMetamaskBrowser().catch((e) => console.log(e));
    }, [isMobile]);

    // Download image mobile: clipboard.write is not supported by all browsers
    // Download image desktop: clipboard.write not supported/enabled in Firefox
    const useDownloadImage = isMobile || isFirefox();

    const saveImageAndOpenTwitter = useCallback(
        async (toastIdParam: string | number) => {
            if (!isLoading) {
                if (ref.current === null) {
                    return;
                }

                const IOS_DOWNLOAD_DELAY = secondsToMilliseconds(10);
                const MOBILE_TWITTER_TOAST_AUTO_CLOSE = secondsToMilliseconds(15);
                try {
                    // In order to improve image quality enlarge image by 2.
                    // Twitter is trying to fit into 504 x 510 with the same aspect ratio, so when image is smaller than 504 x 510, there is quality loss.
                    const aspectRatio = 2;
                    const canvasWidth = ref.current.clientWidth * aspectRatio;
                    const canvasHeight = ref.current.clientHeight * aspectRatio;

                    const base64Image = await toPng(ref.current, { canvasWidth, canvasHeight });

                    if (useDownloadImage) {
                        // Download image
                        const link = document.createElement('a');
                        link.href = base64Image;
                        link.download = PARLAY_IMAGE_NAME;
                        document.body.appendChild(link);
                        setTimeout(
                            () => {
                                link.click();
                            },
                            isIos() ? IOS_DOWNLOAD_DELAY : 0 // fix for iOS
                        );
                        setTimeout(
                            () => {
                                // Cleanup the DOM
                                document.body.removeChild(link);
                            },
                            isIos() ? 3 * IOS_DOWNLOAD_DELAY : 0 // fix for iOS
                        );
                    } else {
                        // Save to clipboard
                        const b64Blob = (await fetch(base64Image)).blob();
                        const cbi = new ClipboardItem({
                            'image/png': b64Blob,
                        });
                        await navigator.clipboard.write([cbi]); // not supported by FF
                    }

                    if (ref.current === null) {
                        return;
                    }

                    const twitterLinkWithStatusMessage =
                        LINKS.TwitterTweetStatus +
                        (isOver
                            ? OVER_COLLATERAL_TWITTER_MESSAGES_TEXT[
                                  Math.floor(Math.random() * OVER_COLLATERAL_TWITTER_MESSAGES_TEXT.length)
                              ]
                            : TWITTER_MESSAGES_TEXT[Math.floor(Math.random() * TWITTER_MESSAGES_TEXT.length)]) +
                        (useDownloadImage ? TWITTER_MESSAGE_UPLOAD : TWITTER_MESSAGE_PASTE);

                    // Mobile requires user action in order to open new window, it can't open in async call, so adding <a>
                    isMobile
                        ? isIos()
                            ? setTimeout(() => {
                                  toast.update(
                                      toastIdParam,
                                      getSuccessToastOptions(
                                          <a onClick={() => window.open(twitterLinkWithStatusMessage)}>
                                              {t('market.toast-message.click-open-twitter')}
                                          </a>,
                                          { autoClose: MOBILE_TWITTER_TOAST_AUTO_CLOSE }
                                      )
                                  );
                              }, IOS_DOWNLOAD_DELAY)
                            : toast.update(
                                  toastIdParam,
                                  getSuccessToastOptions(
                                      <a onClick={() => window.open(twitterLinkWithStatusMessage)}>
                                          {t('market.toast-message.click-open-twitter')}
                                      </a>,
                                      { autoClose: MOBILE_TWITTER_TOAST_AUTO_CLOSE }
                                  )
                              )
                        : toast.update(
                              toastIdParam,
                              getSuccessToastOptions(
                                  <>
                                      {!useDownloadImage && (
                                          <>
                                              {t('market.toast-message.image-in-clipboard')}
                                              <br />
                                          </>
                                      )}
                                      {t('market.toast-message.open-twitter')}
                                  </>
                              )
                          );

                    if (!isMobile) {
                        setTimeout(() => {
                            window.open(twitterLinkWithStatusMessage);
                        }, defaultToastOptions.autoClose);
                    }
                } catch (e) {
                    console.log(e);
                    setIsLoading(false);
                    toast.update(toastIdParam, getErrorToastOptions(t('market.toast-message.save-image-error')));
                }
            }
        },
        [isLoading, isMobile, isOver, useDownloadImage]
    );

    const onTwitterShareClick = () => {
        if (!isLoading) {
            if (isMetamaskBrowser) {
                // Metamask dosn't support image download neither clipboard.write
                toast.error(t('market.toast-message.metamask-not-supported'), defaultToastOptions);
            } else {
                const id = toast.loading(
                    useDownloadImage ? t('market.toast-message.download-image') : t('market.toast-message.save-image')
                );
                setToastId(id);
                setIsLoading(true);

                // If image creation is not postponed with timeout toaster is not displayed immediately, it is rendered in parallel with toPng() execution.
                // Function toPng is causing UI to freez for couple of seconds and there is no notification message during that time, so it confuses user.
                setTimeout(async () => {
                    await saveImageAndOpenTwitter(id);
                    setIsLoading(false);
                }, 300);
            }
        }
    };

    const onModalClose = () => {
        if (isLoading) {
            toast.update(toastId, getErrorToastOptions(t('market.toast-message.save-image-cancel')));
        }
        onClose();
    };

    const onSubmit = useCallback(async () => {
        if (walletAddress) {
            const toastTwitter = toast.loading(t('markets.parlay.share-ticket.verifying-tweet'));
            setIsLoading(true);
            try {
                const response = await axios.post(`${generalConfig.OVERDROP_API_URL}/user-twitter`, {
                    walletAddress,
                    tweetUrl,
                });
                setIsLoading(false);
                if (response.data.success) {
                    toast.update(toastTwitter, getSuccessToastOptions(response.data.status));
                    refetchOverdropMultipliers(walletAddress);
                    onClose();
                } else {
                    toast.update(toastTwitter, getErrorToastOptions(response.data.error));
                }
            } catch (e) {
                console.log(e);
                toast.update(toastTwitter, getErrorToastOptions(t('markets.parlay.share-ticket.network-error')));
                setIsLoading(false);
            }
        }
    }, [walletAddress, tweetUrl, onClose]);

    return (
        <ReactModal
            isOpen
            onRequestClose={onModalClose}
            shouldCloseOnOverlayClick={true}
            style={customStyles}
            contentElement={(props, children) => (
                <>
                    <div {...props}>{children}</div>
                    {isMobile && <CloseIcon className={`icon icon--close`} onClick={onClose} />}
                </>
            )}
        >
            <Container ref={ref}>
                {!isMobile && <CloseIcon className={`icon icon--close`} onClick={onClose} />}
                <MyTicket
                    markets={markets}
                    multiSingle={multiSingle}
                    paid={paid}
                    payout={payout}
                    isTicketLost={isTicketLost}
                    collateral={collateral}
                    isLive={isLive}
                    applyPayoutMultiplier={applyPayoutMultiplier}
                    systemBetData={systemBetData}
                    isTicketOpen={isTicketOpen}
                />

                <TwitterShare disabled={isLoading} onClick={onTwitterShareClick}>
                    <TwitterIcon disabled={isLoading} fontSize={'22px'} />
                    <TwitterShareLabel>{t('markets.parlay.share-ticket.share')}</TwitterShareLabel>
                </TwitterShare>

                <ShareWrapper>
                    <SubmitLabel>{t('markets.parlay.share-ticket.submit-url')}</SubmitLabel>
                    <Input
                        height="32px"
                        minHeight="32px" // fix for iOS
                        disabled={isLoading}
                        value={tweetUrl}
                        onChange={(e) => setTweetUrl(e.target.value)}
                    />
                    <Button height="32px" disabled={isLoading} margin="8px 0" onClick={onSubmit}>
                        {t('common.submit')}
                    </Button>
                </ShareWrapper>
            </Container>
        </ReactModal>
    );
};

// Aspect ratio is important for Twitter: horizontal (Simple View) 2:1 and vertical min 3:4
const Container = styled(FlexDivColumnCentered)`
    position: relative;
    width: 386px;
    // max-height: 600px;
    padding: 15px;
    flex: none;
    background: linear-gradient(180deg, #303656 0%, #1a1c2b 100%);
    border-radius: 10px;
    @media (max-width: 950px) {
        width: 357px;
        // max-height: 476px;
    }
`;

const CloseIcon = styled.i`
    position: absolute;
    top: -20px;
    right: -20px;
    font-size: 20px;
    cursor: pointer;
    color: ${(props) => props.theme.textColor.primary};
    @media (max-width: 950px) {
        top: 10px;
        right: 10px;
    }
`;

const TwitterShare = styled(FlexDivRowCentered)<{ disabled?: boolean }>`
    align-items: center;
    position: absolute;
    left: 0;
    right: 0;
    bottom: -46px;
    height: 32px;
    border-radius: 5px;
    background: ${(props) => props.theme.button.background.primary};
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
    opacity: ${(props) => (props.disabled ? '0.4' : '1')};
    justify-content: center;
`;

const TwitterShareLabel = styled.span`
    font-weight: 700;
    font-size: 20px;
    line-height: 24px;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.tertiary};
`;

const TwitterIcon = styled.i<{ disabled?: boolean; fontSize?: string; padding?: string; color?: string }>`
    font-weight: 500;
    margin-right: 3px;
    font-size: ${(props) => (props.fontSize ? props.fontSize : '20px')};
    color: ${(props) => (props.color ? props.color : props.theme.textColor.tertiary)};
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
    opacity: ${(props) => (props.disabled ? '0.4' : '1')};
    ${(props) => (props.padding ? `padding: ${props.padding};` : '')}
    text-transform: lowercase;
    &:before {
        font-family: HomepageIconsV2 !important;
        content: '\\0021';
    }
`;

const ShareWrapper = styled(FlexDivColumn)`
    position: absolute;
    left: 0;
    right: 0;
    height: 0px;
    bottom: -60px;
`;

const SubmitLabel = styled.span`
    font-weight: 400;
    font-size: 12px;
    line-height: 20px;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.quaternary};
`;

export default React.memo(ShareTicketModal);
