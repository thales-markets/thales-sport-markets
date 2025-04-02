import Modal from 'components/Modal';
import { getErrorToastOptions, getInfoToastOptions } from 'config/toast';
import { t } from 'i18next';
import React from 'react';
import QRCode from 'react-qr-code';
import { toast } from 'react-toastify';
import styled, { useTheme } from 'styled-components';
import { FlexDivRow } from 'styles/common';
import { truncateAddress } from 'thales-utils';

type QRCodeModalProps = {
    onClose: () => void;
    walletAddress: string;
};

const QRCodeModal: React.FC<QRCodeModalProps> = ({ onClose, walletAddress }) => {
    const theme = useTheme();

    const handleCopy = () => {
        const id = toast.loading(t('deposit.copying-address'));
        try {
            navigator.clipboard.writeText(walletAddress);
            toast.update(id, getInfoToastOptions(t('deposit.copied') + ': ' + truncateAddress(walletAddress, 6, 4)));
        } catch (e) {
            toast.update(id, getErrorToastOptions('Error'));
        }
    };

    return (
        <Modal
            customStyle={{
                overlay: {
                    zIndex: 1000,
                },
            }}
            containerStyle={{
                background: theme.background.secondary,
                border: 'none',
            }}
            hideHeader
            title=""
            onClose={onClose}
        >
            <Wrapper>
                <FlexDivRow>{<CloseIcon onClick={onClose} />}</FlexDivRow>
                <LogoIcon className="icon icon--overtime" />
                <Header>{t('qr-code.title')}</Header>
                <SubTitle>{t('qr-code.description')}</SubTitle>
                <QRCode value={walletAddress} style={{ padding: '20px', background: 'white', borderRadius: '20px' }} />
                <AddressLabel>{t('qr-code.your-address')}:</AddressLabel>
                <AddressContainer onClick={handleCopy}>
                    {walletAddress} <CopyIcon className="icon icon--copy" />
                </AddressContainer>
            </Wrapper>
        </Modal>
    );
};

const Wrapper = styled.div`
    flex-direction: column;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const LogoIcon = styled.i`
    font-size: 250px;
    line-height: 56px;
    color: ${(props) => props.theme.textColor.primary};
    @media (max-width: 575px) {
        font-size: 200px;
        line-height: 48px;
    }
`;

const CloseIcon = styled.i.attrs({ className: 'icon icon--close' })`
    color: ${(props) => props.theme.textColor.secondary};
    font-size: 14px;
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
`;

const Header = styled.h2`
    color: ${(props) => props.theme.textColor.primary};
    text-align: center;
    font-size: 22px;
    line-height: 24px;
    font-weight: 600;
    margin-top: 25px;
    margin-bottom: 10px;
    @media (max-width: 575px) {
        font-size: 20px;
    }
`;

const SubTitle = styled.p`
    max-width: 420px;
    color: ${(props) => props.theme.textColor.secondary};
    text-align: center;
    font-size: 16px;
    font-weight: 600;
    line-height: 16px;
    margin-bottom: 20px;
    @media (max-width: 575px) {
        font-size: 14px;
    }
`;

const AddressLabel = styled.p`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 14px;
    font-weight: 500;
    line-height: 16px;
    margin-bottom: 6px;
    margin-top: 20px;
    @media (max-width: 575px) {
        margin-bottom: 4px;
    }
`;

const AddressContainer = styled.div`
    color: ${(props) => props.theme.textColor.quinary};
    font-size: 14px;
    line-height: 16px;
    width: 100%;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: space-between;
    @media (max-width: 575px) {
        font-size: 12px;
    }
`;

const CopyIcon = styled.i`
    font-size: 20px;
    font-weight: 200;
    color: ${(props) => props.theme.textColor.quinary};
    cursor: pointer;
    margin-left: 4px;
    @media (max-width: 575px) {
        font-size: 18px;
        margin-left: 2px;
    }
`;

export default QRCodeModal;
