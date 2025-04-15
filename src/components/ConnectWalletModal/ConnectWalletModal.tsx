import { useConnectModal } from '@rainbow-me/rainbowkit';
import disclaimer from 'assets/docs/overtime-markets-disclaimer.pdf';
import privacyPolicy from 'assets/docs/overtime-privacy-policy.pdf';
import termsOfUse from 'assets/docs/overtime-terms-of-use.pdf';
import Coinbase from 'assets/images/logins-icons/coinbase.svg?react';
import Discord from 'assets/images/logins-icons/discord.svg?react';
import Google from 'assets/images/logins-icons/google.svg?react';
import Metamask from 'assets/images/logins-icons/metamask.svg?react';
import Rabby from 'assets/images/logins-icons/rabby.svg?react';
import WalletConnect from 'assets/images/logins-icons/walletConnect.svg?react';
import X from 'assets/images/logins-icons/x.svg?react';
import Checkbox from 'components/fields/Checkbox';
import SimpleLoader from 'components/SimpleLoader';
import { LINKS } from 'constants/links';
import { DEFAULT_NETWORK } from 'constants/network';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { SUPPORTED_PARTICAL_CONNECTORS_MODAL, SUPPORTED_WALLET_CONNECTORS_MODAL } from 'constants/wallet';
import useLocalStorage from 'hooks/useLocalStorage';
import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getIsBiconomy, setIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivStart } from 'styles/common';
import { localStore } from 'thales-utils';
import { RootState } from 'types/redux';
import { ThemeInterface } from 'types/ui';
import { ParticalTypes, WalletConnections } from 'types/wallet';
import { isNetworkSupported } from 'utils/network';
import { getSpecificConnectorFromConnectorsArray, getWalletLabel } from 'utils/particleWallet/utils';
import { Connector, useConnect } from 'wagmi';

ReactModal.setAppElement('#root');

const getDefaultStyle = (theme: ThemeInterface, isMobile: boolean, isLoading: boolean) => ({
    content: {
        top: isMobile ? '0' : '50%',
        left: isMobile ? '0' : '50%',
        right: 'auto',
        bottom: 'auto',
        padding: isMobile ? '20px 5px' : '32px',
        paddingTop: '16px',
        backgroundColor: theme.background.secondary,
        border: `none`,
        width: isMobile ? '100%' : '480px',
        borderRadius: isMobile ? '0' : '15px',
        marginRight: isMobile ? 'unset' : '-48%',
        transform: isMobile ? 'unset' : 'translate(-50%, -50%)',
        overflow: 'auto',
        height: isMobile ? '100%' : 'auto',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: isMobile ? 33 : isLoading ? 3 : 4000, // validations tooltips has 3001, wallet connect modal has 89 and claim free bet has 32
    },
});

type ConnectWalletModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const dispatch = useDispatch();
    const { connectors, isPending, connect } = useConnect();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const { openConnectModal } = useConnectModal();

    const [termsAccepted, setTerms] = useLocalStorage(LOCAL_STORAGE_KEYS.TERMS_AND_CONDITIONS, false);

    const [isConnecting, setIsConnecting] = useState(false);

    const handleParticleConnect = (connector: Connector) => {
        try {
            connect({ connector });
            onClose();
        } catch (e) {
            console.log('Error occurred');
        }
    };

    const handleConnect = async (connector: Connector) => {
        try {
            setIsConnecting(true);

            await connector.connect();

            const walletChainId = await connector.getChainId();
            if (!isNetworkSupported(walletChainId) && connector.switchChain) {
                await connector.switchChain({ chainId: DEFAULT_NETWORK.networkId });
            }

            connect({ connector });
            onClose();
        } catch (e) {
            console.log('Error occurred', e);
        }
        setIsConnecting(false);
    };

    useEffect(() => {
        const isBiconomyLocalStorage = localStore.get(LOCAL_STORAGE_KEYS.USE_BICONOMY);
        if (isBiconomyLocalStorage === undefined) {
            const overdropState = localStore.get(LOCAL_STORAGE_KEYS.OVERDROP_STATE);
            if (overdropState === undefined) {
                dispatch(setIsBiconomy(true));
                localStore.set(LOCAL_STORAGE_KEYS.USE_BICONOMY, true);
            } else {
                dispatch(setIsBiconomy(false));
                localStore.set(LOCAL_STORAGE_KEYS.USE_BICONOMY, false);
            }
        }
    }, [dispatch]);

    return (
        <ReactModal
            isOpen={isOpen}
            onRequestClose={onClose}
            shouldCloseOnOverlayClick={true}
            style={getDefaultStyle(theme, isMobile, isPending || isConnecting)}
        >
            <CloseIconContainer>
                <CloseIcon onClick={onClose} />
            </CloseIconContainer>
            {isPending || isConnecting ? (
                <LoaderContainer>
                    <SimpleLoader />
                </LoaderContainer>
            ) : (
                <>
                    <HeaderContainer>
                        <Title>
                            <OvertimeIcon className="icon icon--overtime" />
                        </Title>
                        <Subtitle>{t('common.wallet.connect-wallet-modal-subtitle')}</Subtitle>
                    </HeaderContainer>
                    <ButtonsContainer disabled={!termsAccepted}>
                        <SocialLoginWrapper>
                            {SUPPORTED_PARTICAL_CONNECTORS_MODAL.map((item, index) => {
                                const connector = getSpecificConnectorFromConnectorsArray(connectors, item);
                                if (connector) {
                                    return (
                                        <Button
                                            key={index}
                                            onClick={() => handleParticleConnect(connector)}
                                            oneButtoninRow={true}
                                        >
                                            {<> {getIcon(item)}</>}
                                            {t(getWalletLabel(item))}
                                        </Button>
                                    );
                                }
                            })}
                        </SocialLoginWrapper>
                        <BoxForLabel>
                            <ConnectWithLabel>{t('common.wallet.or-connect-with')}</ConnectWithLabel>
                        </BoxForLabel>
                        <SocialLoginWrapper>
                            {SUPPORTED_WALLET_CONNECTORS_MODAL.map((item, index) => {
                                const connector = getSpecificConnectorFromConnectorsArray(connectors, item);
                                if (connector) {
                                    return (
                                        <Button
                                            key={index}
                                            onClick={() => handleConnect(connector)}
                                            oneButtoninRow={true}
                                        >
                                            {<> {getIcon(item)}</>}
                                            {t(getWalletLabel(item))}
                                        </Button>
                                    );
                                }
                            })}
                        </SocialLoginWrapper>
                        <WalletIconsWrapper>
                            <Subtitle
                                onClick={() => {
                                    onClose();
                                    openConnectModal?.();
                                }}
                            >
                                {t('common.wallet.view-all-wallets')}
                                <DownIcon className="icon icon--arrow-down" />
                            </Subtitle>
                        </WalletIconsWrapper>
                    </ButtonsContainer>

                    <BiconomyContainer disabled={!termsAccepted}>
                        <Checkbox
                            value={''}
                            checked={isBiconomy}
                            onChange={() => {
                                if (isBiconomy) {
                                    dispatch(setIsBiconomy(false));
                                    localStore.set(LOCAL_STORAGE_KEYS.USE_BICONOMY, false);
                                } else {
                                    dispatch(setIsBiconomy(true));
                                    localStore.set(LOCAL_STORAGE_KEYS.USE_BICONOMY, true);
                                }
                            }}
                        />
                        <Label
                            onClick={() => {
                                if (isBiconomy) {
                                    dispatch(setIsBiconomy(false));
                                    localStore.set(LOCAL_STORAGE_KEYS.USE_BICONOMY, false);
                                } else {
                                    dispatch(setIsBiconomy(true));
                                    localStore.set(LOCAL_STORAGE_KEYS.USE_BICONOMY, true);
                                }
                            }}
                        >
                            {t('common.wallet.use-biconomy')}
                        </Label>
                        <LearnMore href={LINKS.OvertimeAccount}>({t('common.wallet.use-biconomy-info')})</LearnMore>
                    </BiconomyContainer>

                    <CheckboxContainer disabled={false}>
                        <Checkbox value={''} checked={termsAccepted} onChange={() => setTerms(!termsAccepted)} />
                        <Label onClick={() => setTerms(!termsAccepted)}>{t('common.wallet.agree-terms')}</Label>
                    </CheckboxContainer>

                    <FooterContainer>
                        <FooterText>
                            <Trans
                                i18nKey="common.wallet.disclaimer"
                                components={{
                                    disclaimer: (
                                        <Link href={disclaimer}>
                                            <></>
                                        </Link>
                                    ),
                                    privacyPolicy: (
                                        <Link href={privacyPolicy}>
                                            <></>
                                        </Link>
                                    ),
                                    terms: (
                                        <Link href={termsOfUse}>
                                            <></>
                                        </Link>
                                    ),
                                }}
                            />
                        </FooterText>
                    </FooterContainer>
                </>
            )}
        </ReactModal>
    );
};

const HeaderContainer = styled(FlexDivCentered)`
    flex-direction: column;
    margin-bottom: 40px;
`;

const CloseIconContainer = styled(FlexDiv)`
    justify-content: flex-end;
`;

const CloseIcon = styled.i`
    font-size: 14px;
    margin-top: 1px;
    margin-right: -10px;
    cursor: pointer;
    &:before {
        font-family: OvertimeIconsV2 !important;
        content: '\\0031';
        color: ${(props) => props.theme.textColor.secondary};
    }
    @media (max-width: 575px) {
        padding: 15px;
    }
`;

const OvertimeIcon = styled.i`
    font-size: 200px;
    font-weight: 400;
    line-height: 30px;
`;

const Title = styled.h1`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    font-size: 24px;
    font-weight: 500;
    color: ${(props) => props.theme.textColor.primary};
    width: 100%;
    text-align: center;
    margin-bottom: 6px;
    text-transform: uppercase;
`;

const Subtitle = styled.h2`
    font-size: 16px;
    color: ${(props) => props.theme.textColor.secondary};
    font-weight: 600;
    line-height: 16px; /* 100% */
`;

const Link = styled.a.attrs({
    target: '_blank',
    rel: 'noopener noreferrer',
})`
    color: ${(props) => props.theme.link.textColor.primary};
    text-decoration: underline;
    text-decoration-color: ${(props) => props.theme.link.textColor.primary};
    line-height: 18px;
`;

const LearnMore = styled(Link)`
    font-size: 12px;
    margin-left: 4px;
    white-space: pre;
`;

const FooterText = styled(Subtitle)`
    font-size: 12px;
    font-weight: 400;
    margin: auto;
    text-align: justify;
`;

const Label = styled(Subtitle)`
    cursor: pointer;
    font-size: 12px;
    margin-left: 4px;
    line-height: 19px;
    color: ${(props) => props.theme.textColor.primary};
    white-space: pre;
`;

const CheckboxContainer = styled(FlexDivStart)<{ disabled: boolean }>`
    border-top: 1px solid ${(props) => (props.disabled ? props.theme.borderColor.quaternary : 'transparent')};
    align-items: center;
`;

const BiconomyContainer = styled(CheckboxContainer)`
    margin-top: 20px;
    margin-bottom: 10px;
    padding-top: 20px;
`;

const FooterContainer = styled(FlexDivStart)`
    padding-top: 8px;
`;

const WalletIconsWrapper = styled(FlexDivCentered)`
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    cursor: pointer;
    @media (max-width: 575px) {
        padding: 0px 40px;
    }
`;

const ButtonsContainer = styled.div<{ disabled: boolean }>`
    opacity: ${(props) => (props.disabled ? 0.2 : 1)};
    pointer-events: ${(props) => (props.disabled ? 'none' : '')};
`;

const SocialLoginWrapper = styled(FlexDivCentered)`
    position: relative;
    flex-direction: column;
    gap: 10px;
`;

const BoxForLabel = styled.div`
    position: relative;
    display: block;
    width: 100%;
    padding: 0 130px;
    height: 1px;
    background: ${(props) => props.theme.textColor.secondary};
    margin: 40px 0;
`;

const ConnectWithLabel = styled.span`
    position: absolute;
    top: -40px;
    padding: 0 10px;
    color: ${(props) => props.theme.textColor.secondary};
    font-size: 14px;
    font-weight: 400;
    margin: 32px 0px;
    text-align: center;
    background: ${(props) => props.theme.background.secondary};
`;

const Button = styled(FlexDivCentered)<{ oneButtoninRow?: boolean; active?: boolean }>`
    border-radius: 8px;
    width: 100%;
    height: 50px;
    border: 1px ${(props) => props.theme.borderColor.primary} solid;
    color: ${(props) => props.theme.textColor.primary};
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    &:hover {
        background-color: ${(props) => (props.oneButtoninRow ? props.theme.connectWalletModal.hover : '')};
        color: ${(props) =>
            props.oneButtoninRow ? props.theme.button.textColor.primary : props.theme.button.textColor.quaternary};
        border: ${(props) => (props.oneButtoninRow ? 'none' : `1px ${props.theme.button.borderColor.secondary} solid`)};
    }
`;

const LoaderContainer = styled.div`
    position: relative;
    min-height: 200px;
`;

const IconHolder = styled.div`
    margin-right: 12px;
    display: flex;
    flex-direction: row;
    svg {
        height: 20px;
        :first-child:not(:last-child) {
            margin-right: 6px;
        }
    }
`;

const DownIcon = styled.i`
    font-size: 14px;
    margin-left: 4px;
`;

const getIcon = (socialId: ParticalTypes | WalletConnections): any => {
    switch (socialId) {
        case ParticalTypes.GOOGLE:
            return (
                <IconHolder>
                    <Google />
                </IconHolder>
            );
        case ParticalTypes.DISCORD:
            return (
                <IconHolder>
                    <Discord />
                </IconHolder>
            );

        case ParticalTypes.TWITTER:
            return (
                <IconHolder>
                    <X />
                </IconHolder>
            );

        case WalletConnections.METAMASK:
            return (
                <IconHolder>
                    <Metamask />
                    <Rabby />
                </IconHolder>
            );
        case WalletConnections.WALLET_CONNECT:
            return (
                <IconHolder>
                    <WalletConnect />
                </IconHolder>
            );

        case WalletConnections.COINBASE:
            return (
                <IconHolder>
                    <Coinbase />
                </IconHolder>
            );

        default:
            return <IconHolder />;
    }
};

export default ConnectWalletModal;
