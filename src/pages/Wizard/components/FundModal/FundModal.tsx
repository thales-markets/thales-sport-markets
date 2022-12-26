import banxa from 'assets/images/wizard/logo-banxa.svg';
import bungee from 'assets/images/wizard/logo-bungee.svg';
import layerSwap from 'assets/images/wizard/logo-layerswap.svg';
import mtPelerin from 'assets/images/wizard/logo-mt-pelerin.svg';
import BungeePlugin from 'components/BungeePlugin';
import Modal from 'components/Modal';
import SimpleLoader from 'components/SimpleLoader';
import { t } from 'i18next';
import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { useSelector } from 'react-redux';
import { getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumnCentered, FlexDivRowCentered } from 'styles/common';
import { buildHref } from 'utils/routes';

type FundModalProps = {
    onClose: () => void;
};

enum Provider {
    BANXA,
    MT_PELERIN,
    BUNGEE,
    LAYER_SWAP,
}

const getProviderUrl = (provider: Provider | undefined) => {
    switch (provider) {
        case Provider.BANXA:
            return 'https://thalesmarket.banxa.com/iframe?code=x68QxHYZ2hQU0rccKDgDSeUO7QonDXsY&coinType=ETH&fiatType=EUR&blockchain=OPTIMISM';
        case Provider.MT_PELERIN:
            const baseUrl = 'https://widget.mtpelerin.com/';
            const queryParams = '?type=popup&lang=en&primary=%235F6180&net=optimism_mainnet&bsc=EUR&bdc=ETH&crys=ETH';
            const queryParamMyLogo = `&mylogo=${window.location.origin + buildHref('/overtime-logo-black.svg')}`;
            return baseUrl + queryParams + queryParamMyLogo;
        case Provider.BUNGEE:
            return '';
        case Provider.LAYER_SWAP:
            return 'https://www.layerswap.io/?destNetwork=optimism_mainnet&lockNetwork=true&sourceExchangeName=binance&asset=usdc';
        default:
            return '';
    }
};

const FundModal: React.FC<FundModalProps> = ({ onClose }) => {
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';

    const [iframeProvider, setIframeProvider] = useState<Provider | undefined>(undefined);
    const [iframeLoader, setIframeLoader] = useState(false);
    const [showBungeePlugin, setShowBungeePlugin] = useState(false);
    const [addressCoppied, setAddressCoppied] = useState(false);

    const onBuyBanxaClickHandler = () => {
        setIframeProvider(Provider.BANXA);
        setIframeLoader(true);
    };

    const onBuyMtPelerinClickHandler = () => {
        setIframeProvider(Provider.MT_PELERIN);
        setIframeLoader(true);
    };

    const onBridgeClickHandler = () => setShowBungeePlugin(true);

    const onCopyAddressClickHandler = () => {
        navigator.clipboard.writeText(walletAddress);
        setAddressCoppied(true);
    };

    return (
        <>
            <Modal title={t('wizard.fund-modal.title')} onClose={onClose} shouldCloseOnOverlayClick={false}>
                <Container>
                    <Row>
                        <ButtonWrapper>
                            <ButtonDiv onClick={onBuyBanxaClickHandler}>{t('wizard.fund-modal.buy')}</ButtonDiv>
                        </ButtonWrapper>
                        <Logo logoType={Provider.BANXA} />
                    </Row>
                    <Row>
                        <ButtonWrapper>
                            <ButtonDiv onClick={onBuyMtPelerinClickHandler}>{t('wizard.fund-modal.buy')}</ButtonDiv>
                        </ButtonWrapper>
                        <Logo logoType={Provider.MT_PELERIN} />
                    </Row>
                    <Row>
                        <ButtonWrapper>
                            <ButtonDiv onClick={onBridgeClickHandler}>{t('wizard.fund-modal.bridge')}</ButtonDiv>
                        </ButtonWrapper>
                        <Logo logoType={Provider.BUNGEE} />
                    </Row>
                    <Row>
                        <ButtonWrapper>
                            <Link target="_blank" rel="noreferrer" href={getProviderUrl(Provider.LAYER_SWAP)}>
                                <ButtonDiv>{t('wizard.fund-modal.exchange')}</ButtonDiv>
                            </Link>
                        </ButtonWrapper>
                        <Logo logoType={Provider.LAYER_SWAP} />
                    </Row>
                    <Row>
                        <ButtonWrapper>
                            <ButtonDiv onClick={onCopyAddressClickHandler}>
                                {addressCoppied ? t('wizard.fund-modal.copied') : t('wizard.fund-modal.copy-address')}
                            </ButtonDiv>
                        </ButtonWrapper>
                        <YourAddress>
                            <QRCode size={70} value={walletAddress} />
                            <YourAddressLabel>{t('wizard.fund-modal.address')}</YourAddressLabel>
                        </YourAddress>
                    </Row>
                </Container>
            </Modal>
            {iframeProvider !== undefined && (
                <Modal
                    title={
                        iframeProvider === Provider.BANXA
                            ? t('wizard.fund-modal.buy-banxa')
                            : iframeProvider === Provider.MT_PELERIN
                            ? t('wizard.fund-modal.buy-mt-pelerin')
                            : ''
                    }
                    onClose={() => setIframeProvider(undefined)}
                    shouldCloseOnOverlayClick={false}
                    mobileStyle={{
                        container: { paddingLeft: '10px', paddingRight: '10px' },
                    }}
                >
                    <IFrameWrapper height={iframeProvider === Provider.MT_PELERIN ? 588 : 635}>
                        {iframeLoader && <SimpleLoader />}
                        <IFrame src={getProviderUrl(iframeProvider)} onLoad={() => setIframeLoader(false)} />
                    </IFrameWrapper>
                </Modal>
            )}
            {showBungeePlugin && (
                <Modal
                    title={t('wizard.fund-modal.bridge')}
                    onClose={() => setShowBungeePlugin(false)}
                    shouldCloseOnOverlayClick={false}
                    mobileStyle={{
                        container: { paddingLeft: 0, paddingRight: 0 },
                        header: { paddingLeft: '15px', paddingRight: '15px' },
                    }}
                >
                    <BungeePlugin />
                </Modal>
            )}
        </>
    );
};

const Container = styled(FlexDivColumnCentered)``;

const Row = styled(FlexDivRowCentered)`
    justify-content: start;
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

const Logo = styled(FlexDivRowCentered)<{ logoType?: Provider }>`
    ${(props) => (props.logoType !== undefined ? `content: url(${handleLogoType(props.logoType)});` : '')}
    margin-left: 20px;
`;

const YourAddress = styled(FlexDivColumnCentered)`
    align-items: center;
    margin-left: 20px;
`;

const YourAddressLabel = styled.span`
    font-weight: 400;
    font-size: 15px;
    line-height: 18px;
    color: #ffffff;
    text-transform: capitalize;
    margin-top: 3px;
`;

const Link = styled.a``;

const IFrameWrapper = styled.div<{ height?: number }>`
    width: 530px;
    height: ${(props) => (props.height ? props.height : '635')}px;
    margin: auto;
    background: white;
    margin-top: 10px;
    border-radius: 15px;
    outline: none;
    @media (max-width: 950px) {
        width: 340px;
        height: 470px;
    }
`;

const IFrame = styled.iframe`
    width: 100%;
    height: 100%;
`;

export default FundModal;
