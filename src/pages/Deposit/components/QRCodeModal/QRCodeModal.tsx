import Modal from 'components/Modal';
import React from 'react';
import QRCode from 'react-qr-code';

type QRCodeModalProps = {
    onClose: () => void;
    walletAddress: string;
};

const QRCodeModal: React.FC<QRCodeModalProps> = ({ onClose, walletAddress }) => {
    return (
        <Modal title={''} onClose={() => onClose()}>
            <QRCode value={walletAddress} />
        </Modal>
    );
};

export default QRCodeModal;
