import React, { useEffect, useState } from 'react';
import ReactModal from 'react-modal';
import styled from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivRow } from 'styles/common';
import { Trans, useTranslation } from 'react-i18next';

import disclaimer from 'assets/docs/overtime-markets-disclaimer.pdf';
import termsOfUse from 'assets/docs/thales-terms-of-use.pdf';

import { Connector, useConnect } from 'wagmi';
import { SUPPORTED_HOSTED_WALLETS, SUPPORTED_PARTICAL_CONNECTORS } from 'constants/wallet';
import {
    getClassNameForParticalLogin,
    getSpecificConnectorFromConnectorsArray,
    getWalletIcon,
    getWalleti18Label,
} from 'utils/biconomy';
import SimpleLoader from 'components/SimpleLoader';

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
        borderRadius: '15px',
        width: '720px',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        overflow: 'none',
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
    const { connect, connectors, isLoading, error, isSuccess } = useConnect();

    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        if (error && error.message && errorMessage !== error.message) {
            setErrorMessage(error.message);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error]);

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
                        <Header>{t('common.wallet.connect-your-wallet')}</Header>
                        <SecondaryText>{t('common.wallet.please-connect')}</SecondaryText>
                    </HeaderContainer>
                    <WalletIconsWrapper>
                        {SUPPORTED_HOSTED_WALLETS.map((walletId) => {
                            const connector = getSpecificConnectorFromConnectorsArray(connectors, walletId);
                            if (connector) {
                                return (
                                    <WalletIconContainer onClick={() => handleConnect(connector)} key={connector.id}>
                                        <WalletIcon src={getWalletIcon(walletId)} />
                                        <WalletName>{t(getWalleti18Label(walletId))}</WalletName>
                                    </WalletIconContainer>
                                );
                            }
                        })}
                    </WalletIconsWrapper>
                    <ErrorMessage>{errorMessage}</ErrorMessage>
                    <SocialLoginWrapper>
                        <ConnectWithLabel>{t('common.wallet.or-connect-with')}</ConnectWithLabel>
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
    margin-bottom: 24px;
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
`;

const Header = styled.h2`
    color: ${(props) => props.theme.textColor.primary};
    text-transform: uppercase;
    font-size: 24px;
    font-weight: 600;
    line-height: 45.96px;
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

const WalletIconsWrapper = styled(FlexDivCentered)``;

const WalletIcon = styled.img`
    width: 60px;
    height: 60px;
`;

const WalletName = styled.span`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 13px;
    font-weight: 400;
`;

const WalletIconContainer = styled(FlexDivCentered)`
    cursor: pointer;
    flex-direction: column;
    width: 120px;
    height: 120px;
    margin: 0 10px;
    border-radius: 15px;
    border: ${(props) => `1px ${props.theme.connectWalletModal.border} solid`};
    &:hover {
        border: ${(props) => `1px ${props.theme.connectWalletModal.hover} solid`};
        ${WalletName} {
            color: ${(props) => props.theme.connectWalletModal.hover};
        }
    }
`;

const SocialLoginWrapper = styled(FlexDivCentered)`
    position: relative;
    padding: 23px 40px;
    margin-top: 50px;
    flex-direction: column;
    border: ${(props) => `1px ${props.theme.connectWalletModal.border} solid`};
    border-radius: 15px;
`;

const ConnectWithLabel = styled(SecondaryText)`
    position: absolute;
    padding: 0 5px;
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
    top: -8px;
    text-align: center;
    width: 120px;
    background-color: ${(props) => props.theme.connectWalletModal.modalBackground};
`;

const SocialButtonsWrapper = styled(FlexDivRow)`
    justify-content: space-around;
    width: 100%;
`;

const SocialIcon = styled.i`
    font-size: 22px;
    margin-right: 7px;
`;

const Button = styled(FlexDivCentered)<{ active?: boolean }>`
    border-radius: 8px;
    width: 100%;
    height: 34px;
    background-color: ${(props) => props.theme.connectWalletModal.buttonBackground};
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

const ErrorMessage = styled(FlexDiv)`
    margin-top: 15px;
    align-items: center;
    justify-content: center;
    color: ${(props) => props.theme.connectWalletModal.errorMessage};
    font-size: 17px;
`;

export default ConnectWalletModal;
