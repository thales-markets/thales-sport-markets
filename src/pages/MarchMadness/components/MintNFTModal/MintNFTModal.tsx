import styled from 'styled-components';
import React, { CSSProperties } from 'react';
import ReactModal from 'react-modal';
import Button from 'components/Button';
import { useTranslation } from 'react-i18next';
import nftImage from 'assets/images/march-madness/march-madness-nft.png';

type MintNFTModalProps = {
    isMinted: boolean;
    isMinting: boolean;
    isUpdating: boolean;
    isError: boolean;
    handleSubmit: () => void;
    handleClose: () => void;
};

const MintNFTModal: React.FC<MintNFTModalProps> = ({ isMinted, isMinting, isUpdating, handleSubmit, handleClose }) => {
    const { t } = useTranslation();

    return (
        <ReactModal isOpen shouldCloseOnOverlayClick={true} onRequestClose={handleClose} style={customStyle}>
            <Container>
                <CloseIcon className={`icon icon--close`} onClick={handleClose} />
                <TextWrapper>
                    <Text>
                        {isMinted
                            ? t('march-madness.brackets.modal-mint.update-text')
                            : t('march-madness.brackets.modal-mint.finish-text-1')}
                    </Text>
                    {!isMinted && <Text>{t('march-madness.brackets.modal-mint.finish-text-2')}</Text>}
                </TextWrapper>
                <NftImage alt="March Madness NFT" src={nftImage} />
                <Button style={buttonStyle} disabled={isMinting || isUpdating} onClick={handleSubmit}>
                    {isMinted
                        ? isUpdating
                            ? t('march-madness.brackets.modal-mint.button-updating')
                            : t('march-madness.brackets.modal-mint.button-update')
                        : isMinting
                        ? t('march-madness.brackets.modal-mint.button-minting')
                        : t('march-madness.brackets.modal-mint.button-mint')}
                </Button>
            </Container>
        </ReactModal>
    );
};

const customStyle = {
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
        boxShadow: '0px 0px 59px 11px rgba(100, 217, 254, 0.89)',
        overflow: 'visibile',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        zIndex: '1501',
    },
};

const buttonStyle: CSSProperties = {
    fontFamily: "'NCAA' !important",
    fontSize: '30px',
    lineHeight: '35px',
    letterSpacing: '2px',
    color: '#1A1C2B',
    textTransform: 'uppercase',
    background: '#FFFFFF',
    border: '2px solid #021631',
    borderRadius: '0',
    width: '320px',
    height: '50px',
    marginTop: '34px',
};

const Container = styled.div`
    width: 717px;
    height: 630px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
        284.91deg,
        #da252f -3.75%,
        #5c2c3b 11.81%,
        #021630 33.38%,
        #0c99d0 66.39%,
        #02223e 98.43%
    );
    border: 3px solid #021631;
    border-radius: 8px;
`;

const CloseIcon = styled.i`
    position: absolute;
    top: 22px;
    right: 36px;
    font-size: 15px;
    cursor: pointer;
    color: #ffffff;
`;

const TextWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Text = styled.span`
    font-family: 'NCAA' !important;
    font-style: normal;
    font-weight: 400;
    font-size: 40px;
    line-height: 46px;
    letter-spacing: 2px;
    color: #ffffff;
`;

export const NftImage = styled.img`
    width: 280px;
    height: 351px;
    margin-top: 20px;
`;

export default MintNFTModal;
