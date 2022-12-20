import React from 'react';
import styled from 'styled-components';
import { FlexDivRow } from 'styles/common';
import ReactModal from 'react-modal';

type MobileModalProps = {
    shouldCloseOnOverlayClick?: boolean;
    onClose: () => void;
};

ReactModal.setAppElement('#root');

const customStyles = {
    content: {
        top: '60%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        padding: '0px',
        background: 'transparent',
        border: 'none',
        width: '320px',
        height: '100%',
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
            <Container>
                <Header>
                    <FlexDivRow>{<CloseIcon onClick={onClose} />}</FlexDivRow>
                </Header>
                {children}
            </Container>
        </ReactModal>
    );
};

const Container = styled.div`
    z-index: 1001;
    background: ${(props) => props.theme.background.secondary};
    overflow: auto;
    border-radius: 23px;
    overflow-y: auto;
    max-height: 90vh;
    height: fit-content;
`;

const Header = styled(FlexDivRow)`
    position: absolute;
    top: -18px;
    right: -18px;
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
