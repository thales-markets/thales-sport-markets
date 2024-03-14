import nftImage from 'assets/images/march-madness/march-madness-nft.svg';
import nftBackground from 'assets/images/march-madness/mm-nft-background.svg';
import ROUTES from 'constants/routes';
import { TAGS_LIST } from 'constants/tags';
import { GlobalFiltersEnum, SportFilterEnum } from 'enums/markets';
import { TAGS_FLAGS } from 'enums/tags';
import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import styled, { useTheme } from 'styled-components';
import { ThemeInterface } from 'types/ui';
import { buildHref } from 'utils/routes';

type MintNFTModalProps = {
    isUpdate: boolean;
    handleClose: () => void;
};

const MintNFTModal: React.FC<MintNFTModalProps> = ({ isUpdate, handleClose }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const [isImageLoaded, setIsImageLoaded] = useState(false);

    const NCAABasketballLink =
        ROUTES.Markets.Home +
        '?globalFilter=' +
        GlobalFiltersEnum.OpenMarkets +
        '&sport=' +
        SportFilterEnum.Basketball +
        '&tag=' +
        TAGS_LIST.find((tag) => tag.id === TAGS_FLAGS.NCAA_BASKETBALL)?.label;

    return (
        <ReactModal isOpen shouldCloseOnOverlayClick={true} onRequestClose={handleClose} style={getCustomStyle(theme)}>
            {isImageLoaded && (
                <Container>
                    <Wrapper>
                        <CloseIcon className={`icon icon--close`} onClick={handleClose} />
                        <TextWrapper>
                            <Text fontSize={50} lineHeight={60} letterSpacing={2} margin="30px 0 0 0">
                                {t('march-madness.brackets.modal-mint.hedaer')}
                            </Text>
                            <Text margin={'-10px 0 0 0'}>
                                {isUpdate
                                    ? t('march-madness.brackets.modal-mint.update-text')
                                    : t('march-madness.brackets.modal-mint.mint-text')}
                            </Text>
                        </TextWrapper>
                        <NFTImageWrapper>
                            <NftImage alt="March Madness NFT" src={nftImage} />
                        </NFTImageWrapper>
                        <Text margin="40px 0">
                            <Trans
                                i18nKey="march-madness.brackets.modal-mint.footer-text"
                                components={{
                                    marketsLink: (
                                        <Link target="_blank" rel="noreferrer" href={buildHref(NCAABasketballLink)} />
                                    ),
                                }}
                            />
                        </Text>
                    </Wrapper>
                </Container>
            )}
            <img
                alt="Wait to load"
                src={nftBackground}
                style={{ display: 'none' }}
                onLoad={() => setIsImageLoaded(true)}
            />
        </ReactModal>
    );
};

const getCustomStyle = (theme: ThemeInterface) => ({
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        padding: '0px',
        background: 'transparent',
        border: 'none',
        borderRadius: '20px',
        boxShadow: theme.marchMadness.shadow.modal,
        overflow: 'visibile',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        zIndex: '1501',
    },
});

const Container = styled.div`
    width: 690px;
    background: linear-gradient(
        284.91deg,
        #da252f -3.75%,
        #5c2c3b 11.81%,
        #021630 33.38%,
        #0c99d0 66.39%,
        #02223e 98.43%
    );
    border: 3px solid ${(props) => props.theme.marchMadness.borderColor.quaternary};
    border-radius: 8px;
`;

const Wrapper = styled.div`
    width: 100%;
    height: 100%;
    background: url('${nftBackground}');
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const CloseIcon = styled.i`
    position: absolute;
    top: 22px;
    right: 36px;
    font-size: 15px;
    cursor: pointer;
    color: ${(props) => props.theme.marchMadness.textColor.primary};
`;

const TextWrapper = styled.div`
    width: 575px;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Text = styled.span<{ fontSize?: number; lineHeight?: number; letterSpacing?: number; margin?: string }>`
    font-family: 'NCAA' !important;
    font-style: normal;
    font-weight: 400;
    font-size: ${(props) => (props.fontSize ? props.fontSize : 30)}px;
    line-height: ${(props) => (props.lineHeight ? props.lineHeight : 40)}px;
    letter-spacing: ${(props) => (props.letterSpacing ? props.letterSpacing : -1)}px;
    ${(props) => (props.margin ? `margin: ${props.margin};` : '')}
    text-align: center;
    color: ${(props) => props.theme.marchMadness.textColor.primary};
`;

const BorderGradient = styled.div`
    background: linear-gradient(270deg, #da252f -3.75%, #5c2c3b 11.81%, #021630 33.38%, #0c99d0 66.39%, #02223e 98.43%);
    display: flex;
    justify-content: center;
    align-items: center;
`;

const NftImage = styled.img`
    width: 337px;
    height: 468px;
`;

const NFTImageWrapper = styled(BorderGradient)`
    width: 347px;
    height: 478px;
    margin-top: 20px;
    box-shadow: ${(props) => props.theme.marchMadness.shadow.image};
`;

const Link = styled.a`
    font-family: 'NCAA' !important;
    font-style: normal;
    font-weight: 400;
    font-size: 30px;
    line-height: 40px;
    text-decoration: underline;
    color: ${(props) => props.theme.marchMadness.link.textColor.primary};
    :hover {
        color: ${(props) => props.theme.marchMadness.link.textColor.secondary};
    }
`;

export default MintNFTModal;
