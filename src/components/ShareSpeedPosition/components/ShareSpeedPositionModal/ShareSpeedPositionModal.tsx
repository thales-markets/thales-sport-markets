import { defaultToastOptions, getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { LINKS } from 'constants/links';
import { SPEED_MARKETS_WIDGET_Z_INDEX } from 'constants/ui';
import { ScreenSizeBreakpoint } from 'enums/ui';
import { toPng } from 'html-to-image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/app';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered } from 'styles/common';
import { isFirefox, isIos, isMetamask } from 'thales-utils';
import { ShareSpeedPositionModalProps } from 'types/speedMarkets';
import { ThemeInterface } from 'types/ui';
import SpeedMarketFlexCard from '../SpeedMarketFlexCard';

const SPEED_IMAGE_NAME = 'SpeedImage.png';
const TWITTER_MESSAGE_PASTE = '%0A<PASTE YOUR IMAGE>';
const TWITTER_MESSAGE_UPLOAD = `%0A<UPLOAD YOUR ${SPEED_IMAGE_NAME}>`;
const TWITTER_MESSAGE_CHECKOUT = `Check out my position on%0A`;

const ShareSpeedPositionModal: React.FC<ShareSpeedPositionModalProps> = ({ data, onClose }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const isMobile = useSelector(getIsMobile);

    const [isLoading, setIsLoading] = useState(false);
    const [toastId, setToastId] = useState<string | number>(0);
    const [isMetamaskBrowser, setIsMetamaskBrowser] = useState(false);

    const ref = useRef<HTMLDivElement>(null);

    const customStyles = {
        content: {
            top: isMobile ? '45%' : '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            padding: '0px',
            background: 'transparent',
            border: 'none',
            borderRadius: '20px',
            overflow: 'visibile',
        },
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            zIndex: SPEED_MARKETS_WIDGET_Z_INDEX,
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

                const IOS_DOWNLOAD_DELAY = 10 * 1000; // 10 seconds
                const MOBILE_TWITTER_TOAST_AUTO_CLOSE = 15 * 1000; // 15 seconds
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
                        link.download = SPEED_IMAGE_NAME;
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
                        TWITTER_MESSAGE_CHECKOUT +
                        LINKS.OvertimeMarkets +
                        (useDownloadImage ? TWITTER_MESSAGE_UPLOAD : TWITTER_MESSAGE_PASTE);

                    // Mobile requires user action in order to open new window, it can't open in async call, so adding <a>
                    isMobile
                        ? isIos()
                            ? setTimeout(() => {
                                  toast.update(
                                      toastIdParam,
                                      getSuccessToastOptions(
                                          <a onClick={() => window.open(twitterLinkWithStatusMessage)}>
                                              {t('common.flex-card.click-open-twitter')}
                                          </a>,
                                          { autoClose: MOBILE_TWITTER_TOAST_AUTO_CLOSE }
                                      )
                                  );
                              }, IOS_DOWNLOAD_DELAY)
                            : toast.update(
                                  toastIdParam,
                                  getSuccessToastOptions(
                                      <a onClick={() => window.open(twitterLinkWithStatusMessage)}>
                                          {t('common.flex-card.click-open-twitter')}
                                      </a>,
                                      { autoClose: MOBILE_TWITTER_TOAST_AUTO_CLOSE }
                                  )
                              )
                        : toast.update(
                              toastIdParam,
                              getSuccessToastOptions(
                                  <>
                                      {!useDownloadImage &&
                                          `${t('common.flex-card.image-in-clipboard')} ${t(
                                              'common.flex-card.open-twitter'
                                          )}`}
                                  </>
                              )
                          );

                    if (!isMobile) {
                        setTimeout(() => {
                            window.open(twitterLinkWithStatusMessage);
                        }, defaultToastOptions.autoClose);
                    }
                    onClose();
                } catch (e) {
                    console.log(e);
                    setIsLoading(false);
                    toast.update(toastIdParam, getErrorToastOptions(t('common.flex-card.save-image-error')));
                }
            }
        },
        [isLoading, useDownloadImage, isMobile, t, onClose]
    );

    const onTwitterShareClick = () => {
        if (!isLoading) {
            if (isMetamaskBrowser) {
                // Metamask dosn't support image download neither clipboard.write
                toast.error(t('market.toast-message.metamask-not-supported'), defaultToastOptions);
            } else {
                const id = toast.loading(
                    useDownloadImage ? t('common.flex-card.download-image') : t('common.flex-card.save-image')
                );
                setToastId(id);
                setIsLoading(true);

                // If image creation is not postponed with timeout toaster is not displayed immediately, it is rendered in parallel with toPng() execution.
                // Function toPng is causing UI to freez for couple of seconds and there is no notification message during that time, so it confuses user.
                setTimeout(() => {
                    saveImageAndOpenTwitter(id);
                }, 300);
            }
        }
    };

    const onModalClose = () => {
        if (isLoading) {
            toast.update(toastId, getErrorToastOptions(t('common.flex-card.save-image-cancel')));
        }
        onClose();
    };

    const borderColor =
        data.type === 'speed-potential'
            ? theme.speedMarkets.flexCard.background.potential
            : data.type === 'speed-won'
            ? theme.speedMarkets.flexCard.background.won
            : theme.speedMarkets.flexCard.background.loss;

    const textColor =
        data.type === 'speed-potential'
            ? theme.speedMarkets.flexCard.textColor.potential
            : data.type === 'speed-won'
            ? theme.speedMarkets.flexCard.textColor.won
            : theme.speedMarkets.flexCard.background.loss;

    return (
        <ReactModal
            isOpen
            onRequestClose={onModalClose}
            shouldCloseOnOverlayClick
            style={customStyles}
            contentElement={(props, children) => (
                <>
                    <div {...props}>{children}</div>
                    {isMobile && <CloseIcon $textColor={textColor} className={`icon icon--close`} onClick={onClose} />}
                </>
            )}
        >
            <Container ref={ref}>
                {!isMobile && <CloseIcon $textColor={textColor} className={`icon icon--close`} onClick={onClose} />}
                <SpeedMarketFlexCard
                    type={data.type}
                    asset={data.asset}
                    position={data.position}
                    strikePrice={data.strikePrice}
                    paid={data.paid}
                    payout={data.payout}
                    collateral={data.collateral}
                    marketDuration={data.marketDuration}
                />
                <TwitterShare disabled={isLoading} onClick={onTwitterShareClick} $borderColor={borderColor}>
                    <TwitterShareContent>
                        <TwitterIcon
                            className="icon-home icon-home--twitter-x"
                            disabled={isLoading}
                            $textColor={textColor}
                        />
                        <TwitterShareLabel $textColor={textColor}>
                            {t('speed-markets.flex-card.share')}
                        </TwitterShareLabel>
                    </TwitterShareContent>
                </TwitterShare>
            </Container>
        </ReactModal>
    );
};

// Aspect ratio is important for Twitter: horizontal 2:1 and vertical min 3:4
const Container = styled(FlexDivColumnCentered)`
    width: 383px;
    max-height: 510px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: 357px;
        max-height: 476px;
    }
`;

const CloseIcon = styled.i<{ $textColor: string }>`
    position: absolute;
    top: -20px;
    right: -20px;
    font-size: 20px;
    cursor: pointer;
    color: ${(props) => props.$textColor};
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        top: 10px;
        right: 10px;
    }
`;

const TwitterShare = styled(FlexDivColumnCentered)<{ $borderColor: string; disabled?: boolean }>`
    align-items: center;
    position: absolute;
    left: 0;
    right: 0;
    bottom: -80px;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 55px;
    border-radius: 15px;
    padding: 2px;
    background: ${(props) => props.$borderColor};
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
    opacity: ${(props) => (props.disabled ? '0.4' : '1')};
`;

const TwitterShareContent = styled(FlexDivCentered)`
    width: 100%;
    height: 100%;
    background: ${(props) => props.theme.button.background.primary};
    border-radius: 15px;
`;

const TwitterIcon = styled.i<{ $textColor: string; disabled?: boolean }>`
    font-size: 30px;
    color: ${(props) => props.$textColor};
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
    opacity: ${(props) => (props.disabled ? '0.4' : '1')};
    margin-right: 10px;
`;

const TwitterShareLabel = styled.span<{ $textColor: string }>`
    font-weight: 800;
    font-size: 18px;
    line-height: 25px;
    text-transform: uppercase;
    color: ${(props) => props.$textColor};
`;

export default React.memo(ShareSpeedPositionModal);
