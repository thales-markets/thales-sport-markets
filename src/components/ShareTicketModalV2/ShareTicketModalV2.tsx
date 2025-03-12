import Background545 from 'assets/images/flex-600-800.png';
import axios from 'axios';
import Button from 'components/Button';
import { Input } from 'components/fields/common';
import Toggle from 'components/Toggle';
import { generalConfig } from 'config/general';
import { defaultToastOptions, getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { LINKS } from 'constants/links';
import { secondsToMilliseconds } from 'date-fns';
import { toPng } from 'html-to-image';
import { t } from 'i18next';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactModal from 'react-modal';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/app';
import styled, { useTheme } from 'styled-components';
import { FlexDivColumnCentered, FlexDivRowCentered } from 'styles/common';
import { Coins, isFirefox, isIos, isMetamask } from 'thales-utils';
import { Rates } from 'types/collateral';
import { RootState } from 'types/redux';
import { ShareTicketModalProps } from 'types/tickets';
import { ThemeInterface } from 'types/ui';
import { isStableCurrency } from 'utils/collaterals';
import { refetchOverdropMultipliers } from 'utils/queryConnector';
import { useAccount, useChainId, useClient } from 'wagmi';
import { isOverCurrency } from '../../utils/collaterals';
import MyTicket from './components/MyTicket';

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
    isSgp,
    applyPayoutMultiplier,
    isTicketOpen,
    systemBetData,
}) => {
    const theme: ThemeInterface = useTheme();

    const walletAddress = useAccount()?.address || '';
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const networkId = useChainId();
    const client = useClient();

    const [isLoading, setIsLoading] = useState(false);
    const [toastId, setToastId] = useState<string | number>(0);
    const [isMetamaskBrowser, setIsMetamaskBrowser] = useState(false);
    const [tweetUrl, setTweetUrl] = useState('');
    const [convertToStableValue, setConvertToStableValue] = useState<boolean>(false);

    const ref = useRef<HTMLDivElement>(null);

    const isOver = useMemo(() => isOverCurrency(collateral), [collateral]);

    const isNonStableCollateral = useMemo(() => !isStableCurrency(collateral), [collateral]);

    const exchangeRatesQuery = useExchangeRatesQuery({ networkId, client }, { enabled: isNonStableCollateral });
    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    const customStyles = {
        content: {
            top: isMobile ? '35px' : '45%',
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
            zIndex: '1502', // .rc-tooltip has 1501 and validation message pops up from background
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
        async (toastIdParam: string | number, copyOnly?: boolean) => {
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

                    if (copyOnly) {
                        toast.update(
                            toastIdParam,
                            getSuccessToastOptions(
                                <>
                                    {useDownloadImage
                                        ? t('market.toast-message.image-downloaded')
                                        : t('market.toast-message.image-in-clipboard')}
                                </>
                            )
                        );
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

    const onTwitterShareClick = (copyOnly?: boolean) => {
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
                    await saveImageAndOpenTwitter(id, copyOnly);
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
                </>
            )}
        >
            <Container ref={ref}>
                <MyTicket
                    markets={markets}
                    multiSingle={multiSingle}
                    paid={
                        convertToStableValue && isNonStableCollateral && exchangeRates?.[collateral]
                            ? paid * exchangeRates?.[collateral]
                            : paid
                    }
                    payout={
                        convertToStableValue && isNonStableCollateral && exchangeRates?.[collateral]
                            ? payout * exchangeRates?.[collateral]
                            : payout
                    }
                    isTicketLost={isTicketLost}
                    collateral={
                        convertToStableValue && isNonStableCollateral ? (CRYPTO_CURRENCY_MAP.USDC as Coins) : collateral
                    }
                    isLive={isLive}
                    isSgp={isSgp}
                    applyPayoutMultiplier={applyPayoutMultiplier}
                    systemBetData={
                        systemBetData && convertToStableValue && isNonStableCollateral && exchangeRates
                            ? {
                                  ...systemBetData,
                                  minPayout: systemBetData?.minPayout * exchangeRates[collateral],
                                  maxPayout: systemBetData?.maxPayout * exchangeRates[collateral],
                                  buyInPerCombination: systemBetData?.buyInPerCombination * exchangeRates[collateral],
                              }
                            : systemBetData
                    }
                    isTicketOpen={isTicketOpen}
                />

                <ButtonsWrapper toggleVisible={isNonStableCollateral}>
                    <SwitchWrapper show={isNonStableCollateral}>
                        <Toggle
                            height="20px"
                            active={convertToStableValue}
                            dotSize="12px"
                            dotBackground={theme.background.secondary}
                            dotBorder={`3px solid ${theme.borderColor.quaternary}`}
                            handleClick={() => {
                                setConvertToStableValue(!convertToStableValue);
                            }}
                            label={{
                                firstLabel: t('markets.parlay.share-ticket.display-as-usdc'),
                            }}
                        />
                    </SwitchWrapper>
                    <ShareButton disabled={isLoading} onClick={() => onTwitterShareClick()}>
                        <TwitterIcon disabled={isLoading} fontSize={'22px'} />
                        <ButtonLabel>{t('markets.parlay.share-ticket.share')}</ButtonLabel>
                    </ShareButton>
                    <ShareButton disabled={isLoading} onClick={() => onTwitterShareClick(true)}>
                        {!useDownloadImage && <CopyIcon disabled={isLoading} fontSize={'22px'} />}
                        <ButtonLabel>
                            {useDownloadImage
                                ? t('markets.parlay.share-ticket.download')
                                : t('markets.parlay.share-ticket.copy')}
                        </ButtonLabel>
                    </ShareButton>
                </ButtonsWrapper>
                <ShareWrapper toggleVisible={isNonStableCollateral}>
                    <Input
                        height="32px"
                        minHeight="32px" // fix for iOS
                        width="auto"
                        disabled={isLoading}
                        value={tweetUrl}
                        onChange={(e) => setTweetUrl(e.target.value)}
                        placeholder={t('markets.parlay.share-ticket.submit-url')}
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
    aspect-ratio: 3/4;
    max-height: 800px;
    max-width: 600px;
    min-width: 545px;
    padding: 10px;
    flex: none;
    background-image: linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url(${Background545});
    background-repeat: no-repeat;
    border-radius: 10px;
    @media (max-width: 950px) {
        transform: scale(0.65);
    }
    @media (max-height: 900px) {
        transform: scale(0.8);
    }
`;

const ShareButton = styled(FlexDivRowCentered)<{ disabled?: boolean }>`
    width: 145px;
    height: 32px;
    font-size: 15px;
    align-items: center;
    border-radius: 5px;
    background: ${(props) => props.theme.button.background.primary};
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
    opacity: ${(props) => (props.disabled ? '0.4' : '1')};
    justify-content: center;
`;

const ButtonsWrapper = styled(FlexDivRowCentered)<{ toggleVisible?: boolean }>`
    left: 0;
    right: 0;
    bottom: -35px;
    height: 32px;
    position: absolute;
    gap: 10px;
`;

const ButtonLabel = styled.span`
    font-weight: 600;
    font-size: 15px;
    line-height: 24px;
    padding: 7px 20px;
    text-align: center;
    text-transform: uppercase;
    color: ${(props) => props.theme.button.textColor.primary};
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

const CopyIcon = styled.i<{ disabled?: boolean; fontSize?: string; padding?: string; color?: string }>`
    font-weight: 500;
    margin-right: 3px;
    font-size: ${(props) => (props.fontSize ? props.fontSize : '20px')};
    color: ${(props) => (props.color ? props.color : props.theme.textColor.tertiary)};
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
    opacity: ${(props) => (props.disabled ? '0.4' : '1')};
    ${(props) => (props.padding ? `padding: ${props.padding};` : '')}
    text-transform: lowercase;
    &:before {
        font-family: OvertimeIconsV2 !important;
        content: '\\00F1';
    }
`;

const SwitchWrapper = styled(FlexDivRowCentered)<{ show?: boolean }>`
    visibility: ${(props) => (props.show ? 'visible' : 'hidden')};
    flex: 2;
    & > div {
        justify-content: flex-start;
    }
`;

const ShareWrapper = styled(FlexDivRowCentered)<{ toggleVisible?: boolean }>`
    position: absolute;
    left: 0;
    right: 0;
    height: 30px;
    bottom: -75px;
    gap: 10px;
    button {
        width: 145px;
        border-radius: 5px;
    }
    input {
        flex: 1;
    }
`;

export default React.memo(ShareTicketModal);
