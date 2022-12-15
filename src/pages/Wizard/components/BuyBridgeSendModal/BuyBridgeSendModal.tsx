import banxa from 'assets/images/wizard/logo-banxa.svg';
import bungee from 'assets/images/wizard/logo-bungee.svg';
import layerSwap from 'assets/images/wizard/logo-layerswap.svg';
import mtPelerin from 'assets/images/wizard/logo-mt-pelerin.svg';
import Modal from 'components/Modal';
import SimpleLoader from 'components/SimpleLoader';
import { t } from 'i18next';
import React, { useState } from 'react';
import styled from 'styled-components';
import { FlexDivColumnCentered } from 'styles/common';
import { buildHref } from 'utils/routes';

type BuyBridgeSendModalProps = {
    onClose: () => void;
};

enum Provider {
    BANXA = 'https://thalesmarket.banxa.com/iframe?code=x68QxHYZ2hQU0rccKDgDSeUO7QonDXsY&coinType=ETH&fiatType=EUR&blockchain=OPTIMISM',
    MT_PELERIN = 'https://widget.mtpelerin.com/?type=popup&lang=en&primary=%235F6180&net=optimism_mainnet&bsc=EUR&bdc=ETH&crys=ETH',
    BUNGEE = '',
    LAYER_SWAP = 'https://www.layerswap.io/?destNetwork=optimism_mainnet&lockNetwork=true&sourceExchangeName=binance&asset=usdc',
}

const BuyBridgeSendModal: React.FC<BuyBridgeSendModalProps> = ({ onClose }) => {
    const [iframe, setIframe] = useState('');
    const [iframeLoader, setIframeLoader] = useState(false);
    const [showBungeeWidget, setShowBungeeWidget] = useState(false);

    const onBuyBanxaClickHandler = () => {
        setIframe(Provider.BANXA.toString());
        setIframeLoader(true);
    };

    const onBuyMtPelerinClickHandler = () => {
        const queryParamMyLogo = `&mylogo=${window.location.origin + buildHref('/overtime-logo-black.svg')}`;
        setIframe(Provider.MT_PELERIN.toString() + queryParamMyLogo);
        setIframeLoader(true);
    };

    const onBridgeClickHandler = () => {
        setShowBungeeWidget(true);
    };

    return (
        <>
            <Modal title={t('wizard.buy-modal.title')} onClose={onClose} shouldCloseOnOverlayClick={false}>
                <Container>
                    <Row>
                        <ButtonWrapper>
                            <ButtonDiv
                                onClick={() => {
                                    onBuyBanxaClickHandler();
                                }}
                            >
                                {t('wizard.buy-modal.buy')}
                            </ButtonDiv>
                        </ButtonWrapper>
                        <Logo logoType={Provider.BANXA} />
                    </Row>
                    <Row>
                        <ButtonWrapper>
                            <ButtonDiv
                                onClick={() => {
                                    onBuyMtPelerinClickHandler();
                                }}
                            >
                                {t('wizard.buy-modal.buy')}
                            </ButtonDiv>
                        </ButtonWrapper>
                        <Logo logoType={Provider.MT_PELERIN} />
                    </Row>
                    <Row>
                        <ButtonWrapper>
                            <ButtonDiv
                                onClick={() => {
                                    onBridgeClickHandler();
                                }}
                            >
                                {t('wizard.buy-modal.bridge')}
                            </ButtonDiv>
                        </ButtonWrapper>
                        <Logo logoType={Provider.BUNGEE} />
                    </Row>
                    <Row>
                        <ButtonWrapper>
                            <Link target="_blank" rel="noreferrer" href={Provider.LAYER_SWAP}>
                                <ButtonDiv>{t('wizard.buy-modal.exchange')}</ButtonDiv>
                            </Link>
                        </ButtonWrapper>
                        <Logo logoType={Provider.LAYER_SWAP} />
                    </Row>
                </Container>
            </Modal>
            {iframe && (
                <Modal title={''} onClose={() => setIframe('')} shouldCloseOnOverlayClick={false}>
                    <IFrameWrapper>
                        {iframeLoader && <SimpleLoader />}
                        <IFrame src={iframe} onLoad={() => setIframeLoader(false)} />
                    </IFrameWrapper>
                </Modal>
            )}
            {showBungeeWidget && <></>}
        </>
    );
};

const Container = styled(FlexDivColumnCentered)``;

const Row = styled.div`
    display: flex;
`;

const ButtonWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 28px;
    margin-top: 28px;
`;

const ButtonDiv = styled.div`
    display: flex;
    width: 146px;
    height: 28px;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    border: 1px solid #64d9fe;
    border-radius: 30px;
    font-family: 'Sansation';
    font-style: normal;
    font-weight: 400;
    font-size: 12.5px;
    line-height: 14px;
    cursor: pointer;
    color: #ffffff;
    background-color: transparent;
    padding: 5px 0px;
`;

const handleLogoType = (logoType: Provider) => {
    switch (logoType) {
        case Provider.BANXA:
            return banxa;
        case Provider.MT_PELERIN:
            return mtPelerin;
        case Provider.BUNGEE:
            return bungee;
        case Provider.LAYER_SWAP:
            return layerSwap;
        default:
            return '';
    }
};

const Logo = styled.div<{ logoType: Provider }>`
    content: url(${(props) => handleLogoType(props.logoType)});
    margin-left: 20px;
`;

const Link = styled.a``;

const IFrameWrapper = styled.div`
    width: 530px;
    height: 635px;
    margin: auto;
    background: white;
    margin-top: 10px;
    border-radius: 15px;
    outline: none;
`;

const IFrame = styled.iframe`
    width: 100%;
    height: 100%;
`;

// const CloseIcon = styled.i`
//     font-size: 16px;
//     margin-top: 1px;
//     cursor: pointer;
//     &:before {
//         font-family: ExoticIcons !important;
//         content: '\\004F';
//         color: ${(props) => props.theme.textColor.primary};
//     }
// `;

export default BuyBridgeSendModal;
