import { useConnectModal } from '@rainbow-me/rainbowkit';
import disclaimer from 'assets/docs/overtime-markets-disclaimer.pdf';
import termsOfUse from 'assets/docs/thales-terms-of-use.pdf';
import SimpleLoader from 'components/SimpleLoader';
import Checkbox from 'components/fields/Checkbox';
import ROUTES from 'constants/routes';
import { SUPPORTED_PARTICAL_CONNECTORS } from 'constants/wallet';
import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getWalletConnectModalOrigin } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivRow } from 'styles/common';
import {
    getClassNameForParticalLogin,
    getLabelForParticalLogin,
    getSpecificConnectorFromConnectorsArray,
} from 'utils/particleWallet/utils';
import { navigateTo } from 'utils/routes';
import { Connector, useConnect } from 'wagmi';

ReactModal.setAppElement('#root');

const getDefaultStyle = (isMobile: boolean) => ({
    content: {
        top: isMobile ? '0' : '50%',
        left: isMobile ? '0' : '50%',
        right: 'auto',
        bottom: 'auto',
        padding: isMobile ? '20px 5px' : '25px',
        backgroundColor: '#151B36',
        border: `1px solid #7983A9`,
        width: isMobile ? '100%' : '720px',
        borderRadius: '15px',
        marginRight: isMobile ? 'unset' : '-48%',
        transform: isMobile ? 'unset' : 'translate(-50%, -50%)',
        overflow: 'auto',
        height: isMobile ? '100%' : 'auto',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 2000,
    },
});

type ConnectWalletModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();

    const { connectors, isPending, isSuccess, connect } = useConnect();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const { openConnectModal } = useConnectModal();
    const [termsAccepted, setTerms] = useState(false);
    const [isPartical, setIsPartical] = useState<boolean>(false);

    const modalOrigin = useSelector((state: RootState) => getWalletConnectModalOrigin(state));

    const handleConnect = (connector: Connector) => {
        try {
            connect({ connector });
            connector?.id == 'particle' ? setIsPartical(true) : setIsPartical(false);
        } catch (e) {
            console.log('Error occurred');
        }
    };

    useEffect(() => {
        if (isSuccess) {
            if (modalOrigin == 'sign-up') navigateTo(ROUTES.Wizard);
            onClose();
        }
    }, [isSuccess, isPartical, modalOrigin, onClose]);

    return (
        <ReactModal
            isOpen={isOpen}
            onRequestClose={onClose}
            shouldCloseOnOverlayClick={true}
            style={getDefaultStyle(isMobile)}
        >
            <CloseIconContainer>
                <CloseIcon onClick={onClose} />
            </CloseIconContainer>
            {!isPending && (
                <>
                    <HeaderContainer>
                        <Header>{t('common.wallet.connect-wallet-modal-title')}</Header>
                    </HeaderContainer>
                    <ButtonsContainer disabled={!termsAccepted}>
                        <SocialLoginWrapper>
                            <SocialButtonsWrapper>
                                {SUPPORTED_PARTICAL_CONNECTORS.map((item, index) => {
                                    const connector = getSpecificConnectorFromConnectorsArray(connectors, item, true);
                                    if (index == 0 && connector) {
                                        return (
                                            <Button
                                                key={index}
                                                onClick={() => handleConnect(connector)}
                                                oneButtoninRow={true}
                                            >
                                                <SocialIcon className={getClassNameForParticalLogin(item)} />
                                                {t(getLabelForParticalLogin(item))}
                                            </Button>
                                        );
                                    }
                                })}
                            </SocialButtonsWrapper>
                            <SocialButtonsWrapper>
                                {SUPPORTED_PARTICAL_CONNECTORS.map((item, index) => {
                                    const connector = getSpecificConnectorFromConnectorsArray(connectors, item, true);
                                    if (index > 0 && index < 3 && connector) {
                                        return (
                                            <Button key={index} onClick={() => handleConnect(connector)}>
                                                <SocialIcon className={getClassNameForParticalLogin(item)} />
                                                {t(getLabelForParticalLogin(item))}
                                            </Button>
                                        );
                                    }
                                })}
                            </SocialButtonsWrapper>
                            <SocialButtonsWrapper>
                                {SUPPORTED_PARTICAL_CONNECTORS.map((item, index) => {
                                    const connector = getSpecificConnectorFromConnectorsArray(connectors, item, true);
                                    if (index > 2 && index < 5 && connector) {
                                        return (
                                            <Button key={index} onClick={() => handleConnect(connector)}>
                                                <SocialIcon className={getClassNameForParticalLogin(item)} />
                                                {t(getLabelForParticalLogin(item))}
                                            </Button>
                                        );
                                    }
                                })}
                            </SocialButtonsWrapper>
                            <SocialButtonsWrapper>
                                {SUPPORTED_PARTICAL_CONNECTORS.map((item, index) => {
                                    const connector = getSpecificConnectorFromConnectorsArray(connectors, item, true);

                                    if (index > 4 && index < 7 && connector) {
                                        return (
                                            <Button key={index} onClick={() => handleConnect(connector)}>
                                                <SocialIcon className={getClassNameForParticalLogin(item)} />
                                                {t(getLabelForParticalLogin(item))}
                                            </Button>
                                        );
                                    }
                                })}
                            </SocialButtonsWrapper>
                        </SocialLoginWrapper>
                        <ConnectWithLabel>{t('common.wallet.or-connect-with')}</ConnectWithLabel>
                        <WalletIconsWrapper>
                            <WalletIconContainer
                                onClick={() => {
                                    onClose();
                                    openConnectModal?.();
                                }}
                            >
                                <WalletIcon className={'icon-homepage icon--wallet'} />
                                <WalletName>{t('common.wallet.connect-with-wallet')}</WalletName>
                            </WalletIconContainer>
                        </WalletIconsWrapper>
                    </ButtonsContainer>
                    <FooterContainer disabled={!termsAccepted}>
                        <FooterText>
                            <Trans
                                i18nKey="common.wallet.disclaimer"
                                components={{
                                    disclaimer: (
                                        <Link href={disclaimer}>
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
                        <Checkbox value={''} checked={termsAccepted} onChange={setTerms.bind(this, !termsAccepted)} />
                    </FooterContainer>
                </>
            )}
            {isPending && (
                <LoaderContainer>
                    <SimpleLoader />
                </LoaderContainer>
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
    font-size: 16px;
    margin-top: 1px;
    cursor: pointer;
    &:before {
        font-family: OvertimeIconsV2 !important;
        content: '\\0031';
        color: ${(props) => props.theme.textColor.primary};
    }
    @media (max-width: 575px) {
        padding: 15px;
    }
`;

const Header = styled.h2`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 20px;
    font-weight: 400;
`;

const Link = styled.a`
    color: ${(props) => props.theme.textColor.primary};
    text-decoration: underline;
    text-decoration-color: ${(props) => props.theme.textColor.primary};
    line-height: 18px;
`;

const SecondaryText = styled.p`
    color: ${(props) => props.theme.connectWalletModal.secondaryText};
    font-size: 13px;
    font-weight: 400;
`;

const FooterText = styled(SecondaryText)`
    margin: auto;
`;

const FooterContainer = styled(FlexDivCentered)<{ disabled: boolean }>`
    margin: 0px 90px;
    margin-top: 28px;
    padding-top: 20px;

    @media (max-width: 575px) {
        margin: 0px 40px;
        margin-top: 28px;
    }
    border-top: 1px solid ${(props) => (props.disabled ? props.theme.borderColor.quaternary : 'transparent')};
`;
const WalletIconsWrapper = styled(FlexDivCentered)`
    justify-content: center;
    padding: 0px 90px;
    align-items: center;
    @media (max-width: 575px) {
        padding: 0px 40px;
    }
`;

const WalletIcon = styled.i`
    font-size: 20px;
    margin-right: 5px;
    color: ${(props) => props.theme.textColor.primary};
`;

const WalletName = styled.span`
    color: ${(props) => props.theme.textColor.primary};
    text-transform: capitalize;
    font-size: 18px;
    padding: 6px 0;
    font-weight: 600;
`;

const ButtonsContainer = styled.div<{ disabled: boolean }>`
    opacity: ${(props) => (props.disabled ? 0.2 : 1)};
    pointer-events: ${(props) => (props.disabled ? 'none' : '')};
`;

const WalletIconContainer = styled(FlexDivCentered)`
    cursor: pointer;
    flex-direction: row;
    width: 100%;
    border-radius: 8px;
    border: ${(props) => `1px ${props.theme.connectWalletModal.border} solid`};
    &:hover {
        border: ${(props) => `1px ${props.theme.connectWalletModal.hover} solid`};
        ${WalletName} {
            color: ${(props) => props.theme.connectWalletModal.hover};
        }
        ${WalletIcon} {
            color: ${(props) => props.theme.connectWalletModal.hover};
        }
    }
`;

const SocialLoginWrapper = styled(FlexDivCentered)`
    position: relative;
    padding: 0px 90px;
    flex-direction: column;
    gap: 10px;
    @media (max-width: 575px) {
        padding: 0px 40px;
    }
`;

const ConnectWithLabel = styled(SecondaryText)`
    margin: 32px 0px;
    text-align: center;
`;

const SocialButtonsWrapper = styled(FlexDivRow)`
    justify-content: space-between;
    width: 100%;
    gap: 20px;
    @media (max-width: 575px) {
        gap: 10px;
        flex-wrap: wrap;
    }
`;

const SocialIcon = styled.i`
    font-size: 22px;
    margin-right: 7px;
    font-weight: 400;
    text-transform: none;
`;

const Button = styled(FlexDivCentered)<{ oneButtoninRow?: boolean; active?: boolean }>`
    border-radius: 8px;
    width: 100%;
    height: 34px;
    border: 1px ${(props) => props.theme.borderColor.primary} solid;
    color: ${(props) => props.theme.textColor.primary};
    background-color: ${(props) => (props.oneButtoninRow ? props.theme.button.background.tertiary : '')};
    font-size: 18px;
    font-weight: 600;
    text-transform: capitalize;
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

export default ConnectWalletModal;
