import axios from 'axios';
import Button from 'components/Button';
import { Input } from 'components/fields/common';
import Toggle from 'components/Toggle';
import { generalConfig } from 'config/general';
import { defaultToastOptions, getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { LINKS } from 'constants/links';
import { SPEED_MARKETS_WIDGET_Z_INDEX } from 'constants/ui';
import { secondsToMilliseconds } from 'date-fns';
import { toPng } from 'html-to-image';
import { t } from 'i18next';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useGetReffererIdQuery from 'queries/referral/useGetReffererIdQuery';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactModal from 'react-modal';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/app';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivColumnCentered, FlexDivRowCentered } from 'styles/common';
import { Coins, isFirefox, isIos, isMetamask } from 'thales-utils';
import { Rates } from 'types/collateral';
import { RootState } from 'types/redux';
import { ShareSpeedPositionData } from 'types/speedMarkets';
import { ShareTicketData } from 'types/tickets';
import { ShareModalProps, ThemeInterface } from 'types/ui';
import { isStableCurrency } from 'utils/collaterals';
import { refetchOverdropMultipliers } from 'utils/queryConnector';
import { useAccount, useChainId, useClient } from 'wagmi';
import { isOverCurrency } from '../../utils/collaterals';
import MyTicket from './components/MyTicket';
import SpeedMarketFlexCard from './components/SpeedMarketFlexCard';

const PARLAY_IMAGE_NAME = 'ParlayImage.png';
const SPEED_IMAGE_NAME = 'SpeedImage.png';

const TWITTER_MESSAGES_TEXT = [
    `Another day, another bet locked in on @Overtime_io. Let’s ride this one out! 🌪️ ${LINKS.OvertimeMarkets}`,
    `If this bet cashes, beers on me! 💰 Come join the action on @Overtime_io: ${LINKS.OvertimeMarkets}`,
    `Smokin’ odds, guaranteed payouts, and I keep my privacy? @Overtime_io is where it’s at. 👀 ${LINKS.OvertimeMarkets}`,
    `I’m running it up on @Overtime_io. No bans, no limits, just straight betting 🔥 ${LINKS.OvertimeMarkets}`,
    `Just placed my bet on @Overtime_io. No sweat, smart contracts got me covered! 💸 ${LINKS.OvertimeMarkets}`,
    `Made this bet on @Overtime_io, and I’m ready to flex hard. Who’s joining? 💪 ${LINKS.OvertimeMarkets}`,
    `Betting where it counts. On-chain, guaranteed payouts, and the best odds with @Overtime_io. 🙌 ${LINKS.OvertimeMarkets}`,
    `Just secured another bet on @Overtime_io. Let’s cash this in and flex hard! 💪 ${LINKS.OvertimeMarkets}`,
    `This bet hits, and it’s beers all weekend! 🍻 @Overtime_io making it easy to stay winning. ${LINKS.OvertimeMarkets}`,
    `Running the odds like a boss on @Overtime_io – no bans, all gains. 💥 ${LINKS.OvertimeMarkets}`,
    `Great odds, smart contracts, and I’m fully in. You betting on @Overtime_io yet? 💪 ${LINKS.OvertimeMarkets}`,
    `Taking my betting game to the next level with @Overtime_io. Join the movement! ⚡ ${LINKS.OvertimeMarkets}`,
    `Leveling up my game with @Overtime_io! Are you ready to take the plunge? 🔥 ${LINKS.OvertimeMarkets}`,
    `The betting revolution is here. Best odds, full control, no limits. Welcome to @Overtime_io. 🔥 ${LINKS.OvertimeMarkets}`,
    `Seamless on-chain betting @Overtime_io + the best odds in the game = an absolute no-brainer. 🚀 ${LINKS.OvertimeMarkets}`,
    `Revolutionizing sports betting one bet at a time @Overtime_io. The best odds are now on-chain. 🚀 ${LINKS.OvertimeMarkets}`,
    `A new era for sports betting. Best odds, full transparency, and a token built to change the industry. You betting on @Overtime_io yet? 🔥 ${LINKS.OvertimeMarkets}`,
    `Winning is great. Winning with a system that actually benefits bettors? Even better. 💥 Only with @Overtime_io ${LINKS.OvertimeMarkets}`,
];

const OVER_COLLATERAL_TWITTER_MESSAGES_TEXT = [
    `Betting with $OVER = better odds, bigger wins, and a new way to play. @Overtime_io is where it’s at. 🚀 ${LINKS.OvertimeMarkets}`,
    `A token built to change the sports betting industry @Overtime_io. Betting with $OVER just hits different. 📈 ${LINKS.OvertimeMarkets}`,
    `With $OVER, every bet isn’t just a bet—it’s a stake in the future of sports betting. 💰 @Overtime_io ${LINKS.OvertimeMarkets}`,
    `The future of betting is here @Overtime_io. With $OVER, you're not just betting—you’re leading the game. 🏆 ${LINKS.OvertimeMarkets}`,
    `A new standard for sports betting. Built for the players, powered by $OVER. 🚀 Come join the action on @Overtime_io:${LINKS.OvertimeMarkets}`,
    `Here to stack $OVER and bets on @Overtime_io – let’s gooo! 💥 ${LINKS.OvertimeMarkets}`,
    `Another day, another $OVER bet locked in on @Overtime_io – Who’s joining the action? 🦓 ${LINKS.OvertimeMarkets}`,
];

const TWITTER_MESSAGE_PASTE = '%0A<PASTE YOUR IMAGE>';

const getTwitterMessageUpload = (isTicket: boolean) =>
    `%0A<UPLOAD YOUR ${isTicket ? PARLAY_IMAGE_NAME : SPEED_IMAGE_NAME}>`;

const ShareModal: React.FC<ShareModalProps> = ({ data, onClose }) => {
    const theme: ThemeInterface = useTheme();

    const walletAddress = useAccount()?.address || '';
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const networkId = useChainId();
    const client = useClient();

    const [isLoading, setIsLoading] = useState(false);
    const [toastId, setToastId] = useState<string | number>(0);
    const [isMetamaskBrowser, setIsMetamaskBrowser] = useState(false);
    const [tweetUrl, setTweetUrl] = useState('');
    const [convertToStableValue, setConvertToStableValue] = useState(false);

    const reffererIDQuery = useGetReffererIdQuery(walletAddress || '');
    const [reffererID, setReffererID] = useState('');

    useEffect(() => {
        if (reffererIDQuery.isSuccess) {
            setReffererID(reffererIDQuery.data);
        }
    }, [reffererIDQuery.isSuccess, reffererIDQuery.data]);

    const ref = useRef<HTMLDivElement>(null);

    const ticketData = data as ShareTicketData;
    const isTicketData = ticketData.isTicketOpen !== undefined;
    const speedPositionData = data as ShareSpeedPositionData;

    const isOver = useMemo(() => isOverCurrency(data.collateral), [data.collateral]);

    const isNonStableCollateral = useMemo(() => !isStableCurrency(data.collateral), [data.collateral]);

    const exchangeRatesQuery = useExchangeRatesQuery({ networkId, client }, { enabled: isNonStableCollateral });
    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

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
            // .rc-tooltip has 1501 and validation message pops up from background
            zIndex: isTicketData ? '1502' : SPEED_MARKETS_WIDGET_Z_INDEX,
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
                        link.download = isTicketData ? PARLAY_IMAGE_NAME : SPEED_IMAGE_NAME;
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
                    let twitterLinkWithStatusMessage = '';

                    const aiResponse = await axios.get(`${generalConfig.OVERDROP_API_URL}/generate-social-content`);

                    if (aiResponse.data) {
                        twitterLinkWithStatusMessage =
                            LINKS.TwitterTweetStatus +
                            encodeURIComponent(aiResponse.data) +
                            ' ' +
                            LINKS.OvertimeMarkets +
                            `${reffererID ? '?referrerId=' + reffererID : ''}` +
                            (useDownloadImage ? getTwitterMessageUpload(isTicketData) : TWITTER_MESSAGE_PASTE);
                    } else {
                        twitterLinkWithStatusMessage =
                            LINKS.TwitterTweetStatus +
                            (isOver
                                ? OVER_COLLATERAL_TWITTER_MESSAGES_TEXT[
                                      Math.floor(Math.random() * OVER_COLLATERAL_TWITTER_MESSAGES_TEXT.length)
                                  ]
                                : TWITTER_MESSAGES_TEXT[Math.floor(Math.random() * TWITTER_MESSAGES_TEXT.length)]) +
                            `${reffererID ? '?referrerId=' + reffererID : ''}` +
                            (useDownloadImage ? getTwitterMessageUpload(isTicketData) : TWITTER_MESSAGE_PASTE);
                    }

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
        [isLoading, isMobile, isOver, useDownloadImage, reffererID, isTicketData]
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

    const speedBorderColor = isTicketData
        ? undefined
        : speedPositionData.type === 'speed-potential'
        ? theme.speedMarkets.flexCard.background.potential
        : speedPositionData.type === 'speed-won'
        ? theme.speedMarkets.flexCard.background.won
        : theme.speedMarkets.flexCard.background.loss;

    const speedTextColor = isTicketData
        ? undefined
        : speedPositionData.type === 'speed-potential'
        ? theme.speedMarkets.flexCard.textColor.potential
        : speedPositionData.type === 'speed-won'
        ? theme.speedMarkets.flexCard.textColor.won
        : theme.speedMarkets.flexCard.background.loss;

    const speedButtonBackgroundColor = isTicketData ? undefined : theme.background.primary;

    return (
        <ReactModal
            isOpen
            onRequestClose={onModalClose}
            shouldCloseOnOverlayClick={true}
            style={customStyles}
            contentElement={(props, children) => (
                <>
                    <div {...props}>{children}</div>
                    {isMobile && <CloseIcon className={`icon icon--close`} onClick={onClose} color={speedTextColor} />}
                </>
            )}
        >
            <Container ref={ref} isTicket={isTicketData}>
                {!isMobile && <CloseIcon className={`icon icon--close`} onClick={onClose} color={speedTextColor} />}
                {isTicketData ? (
                    <MyTicket
                        markets={ticketData.markets}
                        multiSingle={ticketData.multiSingle}
                        paid={
                            convertToStableValue && isNonStableCollateral && exchangeRates?.[data.collateral]
                                ? data.paid * exchangeRates?.[data.collateral]
                                : data.paid
                        }
                        payout={
                            convertToStableValue && isNonStableCollateral && exchangeRates?.[data.collateral]
                                ? data.payout * exchangeRates?.[data.collateral]
                                : data.payout
                        }
                        isTicketLost={ticketData.isTicketLost}
                        collateral={
                            convertToStableValue && isNonStableCollateral
                                ? (CRYPTO_CURRENCY_MAP.USDC as Coins)
                                : data.collateral
                        }
                        isLive={ticketData.isLive}
                        isSgp={ticketData.isSgp}
                        applyPayoutMultiplier={ticketData.applyPayoutMultiplier}
                        systemBetData={
                            ticketData.systemBetData && convertToStableValue && isNonStableCollateral && exchangeRates
                                ? {
                                      ...ticketData.systemBetData,
                                      minPayout: ticketData.systemBetData?.minPayout * exchangeRates[data.collateral],
                                      maxPayout: ticketData.systemBetData?.maxPayout * exchangeRates[data.collateral],
                                      buyInPerCombination:
                                          ticketData.systemBetData?.buyInPerCombination *
                                          exchangeRates[data.collateral],
                                  }
                                : ticketData.systemBetData
                        }
                        isTicketOpen={ticketData.isTicketOpen}
                    />
                ) : (
                    <SpeedMarketFlexCard
                        type={speedPositionData.type}
                        asset={speedPositionData.asset}
                        position={speedPositionData.position}
                        strikePrice={speedPositionData.strikePrice}
                        paid={
                            convertToStableValue && isNonStableCollateral && exchangeRates?.[data.collateral]
                                ? speedPositionData.paid * exchangeRates[speedPositionData.collateral]
                                : speedPositionData.paid
                        }
                        payout={
                            convertToStableValue && isNonStableCollateral && exchangeRates?.[data.collateral]
                                ? speedPositionData.payout * exchangeRates[speedPositionData.collateral]
                                : speedPositionData.payout
                        }
                        collateral={
                            convertToStableValue && isNonStableCollateral
                                ? (CRYPTO_CURRENCY_MAP.USDC as Coins)
                                : speedPositionData.collateral
                        }
                        marketDuration={speedPositionData.marketDuration}
                    />
                )}

                <ButtonsWrapper toggleVisible={isNonStableCollateral}>
                    <ShareButton
                        disabled={isLoading}
                        onClick={() => onTwitterShareClick()}
                        borderColor={speedBorderColor}
                    >
                        <ShareButtonBackground color={speedButtonBackgroundColor}>
                            <TwitterIcon disabled={isLoading} fontSize={'22px'} color={speedTextColor} />
                            <ButtonLabel color={speedTextColor}>{t('markets.parlay.share-ticket.share')}</ButtonLabel>
                        </ShareButtonBackground>
                    </ShareButton>
                    <ShareButton
                        disabled={isLoading}
                        onClick={() => onTwitterShareClick(true)}
                        borderColor={speedBorderColor}
                    >
                        <ShareButtonBackground color={speedButtonBackgroundColor}>
                            {!useDownloadImage && (
                                <CopyIcon disabled={isLoading} fontSize={'22px'} color={speedTextColor} />
                            )}
                            <ButtonLabel color={speedTextColor}>
                                {useDownloadImage
                                    ? t('markets.parlay.share-ticket.download')
                                    : t('markets.parlay.share-ticket.copy')}
                            </ButtonLabel>
                        </ShareButtonBackground>
                    </ShareButton>
                </ButtonsWrapper>
                {isNonStableCollateral && (
                    <SwitchWrapper>
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
                )}
                <ShareWrapper toggleVisible={isNonStableCollateral}>
                    <HintText>{t('markets.parlay.share-ticket.generate-content-flex')}</HintText>
                    <Label>{t('markets.parlay.share-ticket.submit-url')}</Label>
                    <Input
                        height="32px"
                        minHeight="32px" // fix for iOS
                        disabled={isLoading}
                        value={tweetUrl}
                        onChange={(e) => setTweetUrl(e.target.value)}
                    />
                    <Button
                        height="32px"
                        disabled={isLoading || !tweetUrl.trim()}
                        margin="8px 0"
                        onClick={onSubmit}
                        textColor={speedTextColor}
                        borderColor={speedButtonBackgroundColor}
                        backgroundColor={speedButtonBackgroundColor}
                        padding={isTicketData ? undefined : '0'}
                    >
                        <ShareButtonBackgroundWrapper color={speedBorderColor}>
                            <ShareButtonBackground color={speedButtonBackgroundColor}>
                                {t('common.submit')}
                            </ShareButtonBackground>
                        </ShareButtonBackgroundWrapper>
                    </Button>
                </ShareWrapper>
            </Container>
        </ReactModal>
    );
};

// Aspect ratio is important for Twitter: horizontal (Simple View) 2:1 and vertical min 3:4
const Container = styled(FlexDivColumnCentered)<{ isTicket: boolean }>`
    position: relative;
    width: ${(props) => (props.isTicket ? '386px' : '383px')};
    ${(props) => (props.isTicket ? '' : 'max-height: 510px;')}
    ${(props) => (props.isTicket ? 'padding: 15px;' : '')}
    ${(props) => (props.isTicket ? 'flex: none;' : '')}
    ${(props) =>
        props.isTicket
            ? `background: linear-gradient(180deg, ${props.theme.flexCard.background.primary} 0%, ${props.theme.flexCard.background.secondary} 100%);`
            : ''}    
    ${(props) => (props.isTicket ? 'border-radius: 10px;' : '')}      
    
    @media (max-width: 950px) {
        width: 357px;
        ${(props) => (props.isTicket ? '' : 'max-height: 476px;')}
    }
`;

const CloseIcon = styled.i<{ color?: string }>`
    position: absolute;
    top: -20px;
    right: -20px;
    font-size: 20px;
    cursor: pointer;
    color: ${(props) => props.color || props.theme.textColor.primary};
    @media (max-width: 950px) {
        top: 10px;
        right: 10px;
    }
`;

const ShareButtonBackground = styled(FlexDivCentered)<{ color?: string }>`
    width: 100%;
    height: 100%;
    border-radius: 5px;
    ${(props) => (props.color ? `background: ${props.color};` : '')}
`;
const ShareButtonBackgroundWrapper = styled(ShareButtonBackground)`
    ${(props) => (props.color ? 'padding: 2px;' : '')}
`;

const ShareButton = styled(FlexDivRowCentered)<{ disabled?: boolean; borderColor?: string }>`
    height: 32px;
    font-size: 15px;
    align-items: center;
    border-radius: 5px;
    background: ${(props) => props.theme.button.background.primary};
    background: ${(props) => props.borderColor || props.theme.button.background.primary};
    ${(props) => (props.borderColor ? 'padding: 2px;' : '')}
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
    opacity: ${(props) => (props.disabled ? '0.4' : '1')};
    justify-content: center;
    flex: 1;
`;

const ButtonsWrapper = styled(FlexDivRowCentered)<{ toggleVisible?: boolean }>`
    left: 0;
    right: 0;
    bottom: ${(props) => (props?.toggleVisible ? '-72px' : '-46px')};
    height: 32px;
    position: absolute;
    gap: 10px;
`;

const ButtonLabel = styled.span<{ color?: string }>`
    font-weight: 600;
    font-size: 15px;
    line-height: 24px;
    padding: 0 20px;
    text-align: center;
    text-transform: uppercase;
    color: ${(props) => props.color || props.theme.button.textColor.primary};
`;

const TwitterIcon = styled.i<{ disabled?: boolean; fontSize?: string; padding?: string; color?: string }>`
    font-weight: 500;
    margin-bottom: 3px;
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
    margin-bottom: 2px;
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

const SwitchWrapper = styled(FlexDivRowCentered)`
    position: absolute;
    left: 0;
    right: 0;
    height: 0px;
    bottom: -17px;
    width: 100%;
    justify-content: space-between;
`;

const ShareWrapper = styled(FlexDivColumn)<{ toggleVisible?: boolean }>`
    position: absolute;
    left: 0;
    right: 0;
    height: 0px;
    bottom: ${(props) => (props?.toggleVisible ? '-80px' : '-60px')};
`;

const Label = styled.span`
    font-weight: 400;
    font-size: 12px;
    line-height: 20px;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.quaternary};
`;

const HintText = styled.span`
    font-size: 11px;
    color: ${(props) => props.theme.textColor.secondary};
    margin: 6px 0 12px 0; /* top, right/left, bottom */
    display: block;
    text-align: left;
`;

export default React.memo(ShareModal);
