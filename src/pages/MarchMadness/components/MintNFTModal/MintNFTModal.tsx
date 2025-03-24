import nftImage from 'assets/images/march-madness/march-madness-nft.png';
import { TwitterIcon } from 'pages/Markets/Home/Parlay/components/styled-components';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered } from 'styles/common';
import { ThemeInterface } from 'types/ui';
import { Share } from '../Brackets/styled-components';

type MintNFTModalProps = {
    isUpdate: boolean;
    bracketId: number;
    handleClose: () => void;
    onTwitterIconClick: () => void;
};

const MintNFTModal: React.FC<MintNFTModalProps> = ({ isUpdate, bracketId, handleClose, onTwitterIconClick }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const [selectedBracketId, setSelectedBracketId] = useState(bracketId);

    useEffect(() => {
        setSelectedBracketId(bracketId);
    }, [bracketId]);

    return (
        <ReactModal isOpen shouldCloseOnOverlayClick={true} onRequestClose={handleClose} style={getCustomStyle(theme)}>
            <Container>
                <CloseIcon className={`icon icon--close`} onClick={handleClose} />
                <TextWrapper>
                    <TextHeader>{t('march-madness.brackets.modal-mint.hedaer')}</TextHeader>
                    <Text>
                        {isUpdate
                            ? t('march-madness.brackets.modal-mint.update-text')
                            : t('march-madness.brackets.modal-mint.mint-text')}
                    </Text>
                    <Text></Text>
                </TextWrapper>
                <NFTImageWrapper>
                    <BracketText>
                        {t('march-madness.brackets.bracket-id', {
                            id: selectedBracketId >= 0 ? selectedBracketId : '...',
                        })}
                    </BracketText>
                    <NftImage alt="March Madness NFT" src={nftImage} />
                </NFTImageWrapper>
                <ShareWrapper>
                    <ShareCont onClick={onTwitterIconClick} marginTop={0}>
                        <TwitterIcon padding="0 0 8px 0" />
                        {t('march-madness.brackets.share')}
                    </ShareCont>
                </ShareWrapper>
                <Text>{t('march-madness.brackets.modal-mint.footer-text')}</Text>

                <GoBack onClick={handleClose}>{t('march-madness.brackets.modal-mint.back')}</GoBack>
            </Container>
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

const Container = styled(FlexDivColumnCentered)`
    align-items: center;
    width: 690px;
    background: ${(props) => props.theme.marchMadness.background.primary};
    border: 3px solid ${(props) => props.theme.marchMadness.borderColor.quaternary};
    border-radius: 8px;
    @media (max-width: 575px) {
        width: 100%;
        padding: 5px;
    }
`;

const CloseIcon = styled.i`
    position: absolute;
    top: 22px;
    right: 36px;
    font-size: 15px;
    cursor: pointer;
    color: ${(props) => props.theme.marchMadness.textColor.primary};
    @media (max-width: 575px) {
        top: 12px;
        right: 12px;
    }
`;

const TextWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Text = styled.span`
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 30px;
    text-align: center;
    color: ${(props) => props.theme.marchMadness.textColor.primary};
    @media (max-width: 575px) {
        font-size: 16px;
        line-height: 20px;
    }
`;

const TextHeader = styled(Text)`
    font-family: ${(props) => props.theme.fontFamily.tertiary};
    font-size: 40px;
    line-height: 60px;
    letter-spacing: 2px;
    color: ${(props) => props.theme.marchMadness.textColor.senary};
    text-shadow: ${(props) => props.theme.marchMadness.shadow.image};
    margin-top: 30px;
    @media (max-width: 575px) {
        font-size: 30px;
        margin-top: 10px;
    }
`;

const BracketText = styled(Text)`
    font-size: 16px;
    color: ${(props) => props.theme.marchMadness.textColor.senary};
`;

const NFTImageWrapper = styled(FlexDivColumnCentered)`
    margin: 20px 0 30px 0;
    border-radius: 4px;
    @media (max-width: 575px) {
        margin: 20px 0;
    }
`;

const NftImage = styled.img`
    @media (max-width: 575px) {
        width: 230px;
        height: 230px;
    }
`;

const GoBack = styled(FlexDivCentered)`
    font-family: ${(props) => props.theme.fontFamily.primary};
    width: 281px;
    height: 32px;
    background: ${(props) => props.theme.marchMadness.background.senary};
    border-radius: 4px;
    color: ${(props) => props.theme.marchMadness.textColor.primary};
    cursor: pointer;
    margin: 10px 0 30px 0;
    @media (max-width: 575px) {
        margin: 10px 0 20px 0;
    }
`;

const ShareWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin-bottom: 10px;
`;

const ShareCont = styled(Share)`
    font-family: ${(props) => props.theme.fontFamily.primary};
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 14px;
    text-transform: uppercase;
    color: ${(props) => props.theme.marchMadness.textColor.primary};
    cursor: pointer;
`;

export default MintNFTModal;
