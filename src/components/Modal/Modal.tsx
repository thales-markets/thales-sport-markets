import React from 'react';
import styled from 'styled-components';
import { FlexDiv, FlexDivRow } from 'styles/common';
import ReactModal from 'react-modal';

type ModalProps = {
    title: string;
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
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
};

export const Modal: React.FC<ModalProps> = ({ title, onClose, children, shouldCloseOnOverlayClick }) => {
    return (
        <ReactModal
            isOpen
            onRequestClose={onClose}
            shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
            style={customStyles}
        >
            <Container>
                <Header>
                    <Title>{title}</Title>
                    <FlexDivRow>{<CloseIcon onClick={onClose} />}</FlexDivRow>
                </Header>
                {children}
            </Container>
        </ReactModal>
    );
};

const Container = styled.div`
    border: 1px solid ${(props) => props.theme.borderColor.primary};
    background: ${(props) => props.theme.background.primary};
    padding: 25px 30px 35px 30px;
    overflow: auto;
    border-radius: 23px;
    @media (max-width: 575px) {
        padding: 25px 20px 35px 20px;
    }
    overflow-y: auto;
    max-height: 100vh;
    height: fit-content;
`;

const Header = styled(FlexDivRow)`
    margin-bottom: 20px;
`;

const Title = styled(FlexDiv)`
    font-style: normal;
    font-weight: bold;
    font-size: 25px;
    line-height: 100%;
    text-align: center;
    color: ${(props) => props.theme.textColor.primary};
`;

const CloseIcon = styled.i`
    font-size: 18px;
    margin-top: 1px;
    cursor: pointer;
    &:before {
        font-family: ExoticIcons !important;
        content: '\\004F';
        color: ${(props) => props.theme.textColor.primary};
    }
`;

export default Modal;
