import React from 'react';
import styled from 'styled-components';
import { FlexDivEnd } from 'styles/common';
import ReactModal from 'react-modal';

type MobileModalProps = {
    shouldCloseOnOverlayClick?: boolean;
    onClose: () => void;
};

ReactModal.setAppElement('#root');

const customStyles = {
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
        width: '320px',
        overflow: 'visible',
    },
    overlay: {
        backgroundColor: 'rgba(26, 28, 43, 1)',
        zIndex: 2,
    },
};

export const MobileModal: React.FC<MobileModalProps> = ({ onClose, children, shouldCloseOnOverlayClick }) => {
    return (
        <ReactModal
            isOpen
            onRequestClose={onClose}
            shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
            style={customStyles}
        >
            <Header>{<CloseIcon onClick={onClose} />}</Header>
            <Container>{children}</Container>
        </ReactModal>
    );
};

const Container = styled.div`
    background: ${(props) => props.theme.background.secondary};
    overflow: auto;
    border-radius: 23px;
    overflow-y: auto;
    max-height: 80vh;
`;

const Header = styled(FlexDivEnd)`
    margin-right: -18px;
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

export default MobileModal;
