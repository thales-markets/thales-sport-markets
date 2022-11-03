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
        width: '100%',
        height: '100%',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    border: 1px solid ${(props) => props.theme.borderColor.primary};
    background: ${(props) => props.theme.background.secondary};
    padding: 25px 30px 35px 30px;
    overflow: auto;
    border-radius: 23px;
    @media (max-width: 575px) {
        padding: 25px 0px 0px 0px;
    }
    overflow-y: auto;
    max-height: 90vh;
    height: fit-content;
`;

const Header = styled(FlexDivRow)`
    justify-content: end;
    padding: 0px 20px;
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
