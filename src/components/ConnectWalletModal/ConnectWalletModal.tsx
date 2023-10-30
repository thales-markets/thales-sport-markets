import React from 'react';
import ReactModal from 'react-modal';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivRow } from 'styles/common';
import { Trans, useTranslation } from 'react-i18next';

import MetaMaskIcon from 'assets/images/wallets/metamask.svg';
import WalletConnectIcon from 'assets/images/wallets/wallet_connect.svg';
import disclaimer from 'assets/docs/overtime-markets-disclaimer.pdf';
import termsOfUse from 'assets/docs/thales-terms-of-use.pdf';

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

const onClose = () => {
    console.log('Test');
};

const ConnectWalletModal: React.FC = () => {
    const { t } = useTranslation();

    return (
        <ReactModal isOpen onRequestClose={onClose} shouldCloseOnOverlayClick={true} style={defaultStyle}>
            <HeaderContainer>
                <Header>{t('common.wallet.connect-your-wallet')}</Header>
                <SecondaryText>{t('common.wallet.please-connect')}</SecondaryText>
            </HeaderContainer>
            <WalletIconsWrapper>
                <WalletIconContainer>
                    <WalletIcon src={MetaMaskIcon} />
                    <WalletName>{t('common.wallet.metamask')}</WalletName>
                </WalletIconContainer>
                <WalletIconContainer>
                    <WalletIcon src={WalletConnectIcon} />
                    <WalletName>{t('common.wallet.wallet-connect')}</WalletName>
                </WalletIconContainer>
            </WalletIconsWrapper>
            <SocialLoginWrapper>
                <ConnectWithLabel>{t('common.wallet.or-connect-with')}</ConnectWithLabel>
                <SocialButtonsWrapper>
                    <Button>{'Twitter'}</Button>
                    <Button>{'Twitter'}</Button>
                </SocialButtonsWrapper>
                <SocialButtonsWrapper>
                    <Button>{'Twitter'}</Button>
                    <Button>{'Twitter'}</Button>
                    <Button>{'Twitter'}</Button>
                </SocialButtonsWrapper>
                <ShowMoreLabel>{t('common.wallet.view-more-options')}</ShowMoreLabel>
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
        </ReactModal>
    );
};

const HeaderContainer = styled(FlexDivCentered)`
    flex-direction: column;
    margin-bottom: 24px;
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

const WalletIconContainer = styled(FlexDivCentered)`
    cursor: pointer;
    flex-direction: column;
    width: 120px;
    height: 120px;
    margin: 0 10px;
    border-radius: 15px;
    border: ${(props) => `1px ${props.theme.connectWalletModal.border} solid`};
`;

const WalletIcon = styled.img`
    width: 60px;
    height: 60px;
`;

const WalletName = styled.span`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 13px;
    font-weight: 400;
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
    width: 100px;
`;

const SocialButtonsWrapper = styled(FlexDivRow)`
    justify-content: space-around;
    width: 100%;
`;

const ShowMoreLabel = styled(SecondaryText)`
    text-transform: capitalize;
`;

const Button = styled(FlexDivCentered)<{ active?: boolean }>`
    border-radius: 8px;
    width: 100%;
    height: 34px;
    background-color: ${(props) => props.theme.connectWalletModal.buttonBackground};
    color: ${(props) => props.theme.connectWalletModal.secondaryText};
    margin-left: 3px;
    margin-right: 3px;
    margin-bottom: 5px;
    font-size: 18px;
    font-weight: 700;
    text-transform: uppercase;
`;

export default ConnectWalletModal;
