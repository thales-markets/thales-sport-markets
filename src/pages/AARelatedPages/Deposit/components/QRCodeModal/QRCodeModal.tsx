import Modal from 'components/Modal';
import React from 'react';
import QRCode from 'react-qr-code';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';

type QRCodeModalProps = {
    onClose: () => void;
    walletAddress: string;
    title: string;
};

const QRCodeModal: React.FC<QRCodeModalProps> = ({ onClose, walletAddress, title }) => {
    return (
        <Modal title={title} onClose={() => onClose()}>
            <Wrapper>
                <QRCode value={walletAddress} style={{ padding: '10px', background: 'white' }} />
            </Wrapper>
        </Modal>
    );
};

const Wrapper = styled(FlexDiv)`
    width: 100%;
    align-items: center;
    justify-content: center;
`;

export default QRCodeModal;
