import React, { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import styled from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivRow } from 'styles/common';

import disclaimer from 'assets/docs/overtime-markets-disclaimer.pdf';
import termsOfUse from 'assets/docs/thales-terms-of-use.pdf';

import { useConnectModal } from '@rainbow-me/rainbowkit';
import SimpleLoader from 'components/SimpleLoader';
import { SUPPORTED_PARTICAL_CONNECTORS } from 'constants/wallet';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import { getClassNameForParticalLogin, getSpecificConnectorFromConnectorsArray } from 'utils/biconomy';
import { Connector, useConnect } from 'wagmi';

ReactModal.setAppElement('#root');

const defaultStyle = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        padding: '25px',
        backgroundColor: '#181A20',
        border: 'none',
        width: '720px',
        borderRadius: '15px',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        overflow: 'none',
        height: 'auto',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 2,
    },
};

type ConnectWalletModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { connect, connectors, isLoading, isSuccess } = useConnect();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const { openConnectModal } = useConnectModal();

    useEffect(() => {
        if (isMobile) {
            defaultStyle.content.width = '100%';
            defaultStyle.content.padding = '20px 5px';
            defaultStyle.content.height = '100%';
        } else {
            defaultStyle.content.width = '720px';
            defaultStyle.content.padding = '25px';
            defaultStyle.content.height = 'auto';
        }
    }, [isMobile]);

    const handleConnect = (connector: Connector) => {
        try {
            connect({ connector });
        } catch (e) {
            console.log('Error occurred');
        }
    };

    useEffect(() => {
        if (isSuccess) onClose();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSuccess]);

    return (
        <ReactModal isOpen={isOpen} onRequestClose={onClose} shouldCloseOnOverlayClick={true} style={defaultStyle}>
            <CloseIconContainer>
                <CloseIcon onClick={onClose} />
            </CloseIconContainer>
            {!isLoading && (
                <>
                    <HeaderContainer>
                        <Header>{t('common.wallet.connect-wallet-modal-title')}</Header>
                    </HeaderContainer>
                    <SocialLoginWrapper>
                        <SocialButtonsWrapper>
                            {SUPPORTED_PARTICAL_CONNECTORS.map((item, index) => {
                                const connector = getSpecificConnectorFromConnectorsArray(connectors, item, true);
                                if (index <= 1 && connector && connector?.ready) {
                                    return (
                                        <Button key={index} onClick={() => handleConnect(connector)}>
                                            <SocialIcon className={getClassNameForParticalLogin(item)} />
                                            {item}
                                        </Button>
                                    );
                                }
                            })}
                        </SocialButtonsWrapper>
                        <SocialButtonsWrapper>
                            {SUPPORTED_PARTICAL_CONNECTORS.map((item, index) => {
                                const connector = getSpecificConnectorFromConnectorsArray(connectors, item, true);
                                if (index > 1 && connector && connector?.ready) {
                                    return (
                                        <Button key={index} onClick={() => handleConnect(connector)}>
                                            <SocialIcon className={getClassNameForParticalLogin(item)} />
                                            {item}
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
                            <WalletIcon className={'social-icon icon--wallet'} />
                            <WalletName>{t('common.wallet.connect-with-wallet')}</WalletName>
                        </WalletIconContainer>
                    </WalletIconsWrapper>
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
                </>
            )}
            {isLoading && (
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
        font-family: ExoticIcons !important;
        content: '\\004F';
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
`;

const SecondaryText = styled.p`
    color: ${(props) => props.theme.connectWalletModal.secondaryText};
    font-size: 13px;
    font-weight: 400;
`;

const FooterText = styled(SecondaryText)`
    margin-top: 48px;
`;

const WalletIconsWrapper = styled(FlexDivCentered)`
    justify-content: center;
    padding: 0px 23px;
    align-items: center;
`;

const WalletIcon = styled.i`
    font-size: 24px;
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
    padding: 0px 23px;
    flex-direction: column;
`;

const ConnectWithLabel = styled(SecondaryText)`
    margin: 32px 0px;
    text-align: center;
`;

const SocialButtonsWrapper = styled(FlexDivRow)`
    justify-content: space-around;
    width: 100%;
    @media (max-width: 575px) {
        flex-wrap: wrap;
    }
`;

const SocialIcon = styled.i`
    font-size: 22px;
    margin-right: 7px;
`;

const Button = styled(FlexDivCentered)<{ active?: boolean }>`
    border-radius: 8px;
    width: 100%;
    height: 34px;
    border: 1px ${(props) => props.theme.borderColor.primary} solid;
    color: ${(props) => props.theme.textColor.primary};
    margin-left: 3px;
    margin-right: 3px;
    margin-bottom: 5px;
    font-size: 18px;
    font-weight: 700;
    text-transform: uppercase;
    cursor: pointer;
    &:hover {
        background-color: ${(props) => props.theme.connectWalletModal.hover};
        color: ${(props) => props.theme.connectWalletModal.hoverText};
    }
`;

const LoaderContainer = styled.div`
    height: 180px !important;
    width: 80px;
    overflow: none;
`;

export default ConnectWalletModal;
