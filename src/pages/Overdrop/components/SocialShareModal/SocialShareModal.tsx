import axios from 'axios';
import Button from 'components/Button';
import { Input } from 'components/fields/common';
import GenerateAIContent from 'components/GenerateAIContent';
import { generalConfig } from 'config/general';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { LINKS } from 'constants/links';
import { secondsToMilliseconds } from 'date-fns';
import useGetReffererIdQuery from 'queries/referral/useGetReffererIdQuery';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/app';
import styled from 'styled-components';
import { FlexDivColumnCentered, FlexDivRowCentered } from 'styles/common';
import { isIos } from 'thales-utils';
import { RootState } from 'types/redux';
import { refetchUserOverdrop } from 'utils/queryConnector';
import { useAccount } from 'wagmi';

type SocialShareModalProps = {
    onClose: () => void;
};

const SocialShareModal: React.FC<SocialShareModalProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const { address } = useAccount();

    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const [tweetUrl, setTweetUrl] = useState('');
    const [aiContent, setAiContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const isSocialUrlValid = tweetUrl.startsWith('https://x.com/') || tweetUrl.startsWith('https://twitter.com/');

    const reffererIDQuery = useGetReffererIdQuery(address || '');
    const [reffererID, setReffererID] = useState('');

    useEffect(() => {
        if (reffererIDQuery.isSuccess) {
            setReffererID(reffererIDQuery.data);
        }
    }, [reffererIDQuery.isSuccess, reffererIDQuery.data]);

    const postTweet = useCallback(async () => {
        if (address) {
            setIsLoading(true);
            const toastTwitter = toast.loading(t('markets.parlay.share-ticket.verifying-tweet'));
            try {
                const response = await axios.post(`${generalConfig.OVERDROP_API_URL}/user-twitter`, {
                    walletAddress: address,
                    tweetUrl,
                });
                setIsLoading(false);
                if (response.data.success) {
                    toast.update(toastTwitter, getSuccessToastOptions(response.data.status));
                    refetchUserOverdrop(address);
                } else {
                    toast.update(toastTwitter, getErrorToastOptions(response.data.error));
                }
            } catch (e) {
                console.log(e);
                toast.update(toastTwitter, getErrorToastOptions(t('markets.parlay.share-ticket.network-error')));
            }
        }
    }, [address, tweetUrl, t]);

    const onTwitterShareClick = () => {
        const IOS_DOWNLOAD_DELAY = secondsToMilliseconds(10);
        const MOBILE_TWITTER_TOAST_AUTO_CLOSE = secondsToMilliseconds(15);

        if (!isLoading) {
            const toastIdParam = toast.loading('');
            setIsLoading(true);

            let twitterLinkWithStatusMessage = '';
            twitterLinkWithStatusMessage =
                LINKS.TwitterTweetStatus +
                encodeURIComponent(aiContent) +
                ' ' +
                LINKS.OvertimeMarkets +
                `${reffererID ? '?referrerId=' + reffererID : ''}`;

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
                : toast.update(toastIdParam, getSuccessToastOptions(<>{t('market.toast-message.open-twitter')}</>));

            if (!isMobile) {
                window.open(twitterLinkWithStatusMessage);
            }
            setIsLoading(false);
        }
    };

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
            zIndex: '1502', // .rc-tooltip has 1501 and validation message pops up from background
        },
    };

    return (
        <ReactModal
            isOpen
            onRequestClose={onClose}
            shouldCloseOnOverlayClick={true}
            style={customStyles}
            contentElement={(props, children) => (
                <>
                    <div {...props}>{children}</div>
                    {isMobile && <CloseIcon className={`icon icon--close`} onClick={onClose} />}
                </>
            )}
        >
            <Container>
                {!isMobile && <CloseIcon className={`icon icon--close`} onClick={onClose} />}
                <FlexDivColumnCentered>
                    <Title>{t('overdrop.daily-quest.social.share.title')}</Title>
                    <Description>{t('overdrop.daily-quest.social.share.desc')}</Description>
                </FlexDivColumnCentered>
                <FlexDivColumnCentered>
                    <Label>{t('overdrop.daily-quest.social.share.submit')}</Label>
                    <Input
                        height="32px"
                        minHeight="32px" // fix for iOS
                        // disabled={isLoading}
                        value={tweetUrl}
                        onChange={(e) => setTweetUrl(e.target.value)}
                    />
                    <Button height="32px" disabled={isLoading || !isSocialUrlValid} margin="8px 0" onClick={postTweet}>
                        {t('common.submit')}
                    </Button>
                </FlexDivColumnCentered>
                <FlexDivColumnCentered>
                    <Label>{t('markets.parlay.share-ticket.generate-content')}</Label>
                    <GenerateAIContent aiContent={aiContent} setAiContent={setAiContent} />
                    {aiContent && (
                        <ShareButton disabled={isLoading} onClick={() => onTwitterShareClick()}>
                            <ButtonLabel>Post on</ButtonLabel>
                            <TwitterIcon disabled={isLoading} fontSize={'22px'} />
                        </ShareButton>
                    )}
                </FlexDivColumnCentered>
            </Container>
        </ReactModal>
    );
};

const Container = styled(FlexDivColumnCentered)`
    gap: 20px;
    position: relative;
    width: 450px;
    padding: 15px;
    flex: none;
    background: linear-gradient(180deg, #303656 0%, #1a1c2b 100%);
    border-radius: 10px;
    @media (max-width: 950px) {
        width: 357px;
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

const Label = styled.span`
    font-weight: 400;
    font-size: 12px;
    line-height: 20px;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.quaternary};
    margin-bottom: 5px;
`;

const Title = styled.h3`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 20px;
    font-weight: 500;
    line-height: 30px;
`;

const Description = styled.p`
    color: ${(props) => props.theme.textColor.quinary};
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
`;

const ShareButton = styled(FlexDivRowCentered)<{ disabled?: boolean }>`
    max-height: 32px;
    font-size: 15px;
    align-items: center;
    border-radius: 5px;
    background: ${(props) => props.theme.button.background.primary};
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
    opacity: ${(props) => (props.disabled ? '0.4' : '1')};
    justify-content: center;
    flex: 1;
    margin-top: 8px;
`;

const ButtonLabel = styled.span`
    font-weight: 600;
    font-size: 15px;
    line-height: 24px;
    padding: 5px;
    text-align: center;
    text-transform: uppercase;
    color: ${(props) => props.theme.button.textColor.primary};
`;

const TwitterIcon = styled.i<{ disabled?: boolean; fontSize?: string; padding?: string; color?: string }>`
    font-weight: 500;
    margin-right: 3px;
    margin-bottom: 2px;
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

export default SocialShareModal;
