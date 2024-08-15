import React from 'react';
import ReactModal from 'react-modal';
import styled, { CSSProperties } from 'styled-components';
import { FlexDivRow } from 'styles/common';
import { convertCssToStyledProperties } from 'thales-utils';
import { ModalTypes } from 'types/overdrop';

type ModalProps = {
    type: ModalTypes;
    mobileStyle?: {
        container?: CSSProperties;
        header?: CSSProperties;
    };
    onClose: () => void;
};

ReactModal.setAppElement('#root');

const defaultCustomStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-48%',
        transform: 'translate(-50%, -50%)',
        padding: '0px',
        border: 'none',
        overflow: 'auto',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 2000,
    },
};

const BaseModal: React.FC<ModalProps> = ({ type, onClose, children, mobileStyle }) => {
    console.log('type ', type);

    const customStyle = {
        overlay: { ...defaultCustomStyles.overlay },
        content: {
            ...defaultCustomStyles.content,
        },
    };

    return (
        <ReactModal isOpen onRequestClose={onClose} shouldCloseOnOverlayClick={true} style={customStyle}>
            <Container mobileStyle={mobileStyle?.container}>
                <Header mobileStyle={mobileStyle?.header}>
                    <FlexDivRow>{<CloseIcon onClick={onClose} />}</FlexDivRow>
                </Header>
                {children}
            </Container>
        </ReactModal>
    );
};

const Container = styled.div<{ mobileStyle?: CSSProperties; removeBackground?: boolean }>`
    border: 1px solid ${(props) => props.theme.borderColor.primary};
    padding: 0px;
    border-radius: 5px;
    background: linear-gradient(${(props) => props.theme.overdrop.background.active} 0 0) padding-box,
        linear-gradient(40deg, rgba(92, 68, 44, 1) 0%, rgba(23, 25, 42, 1) 50%, rgba(92, 68, 44, 1) 100%) border-box;
    @media (max-width: 575px) {
        ${(props) =>
            props.mobileStyle ? convertCssToStyledProperties(props.mobileStyle) : 'padding: 20px 15px 30px 15px;'}
    }
    max-height: 100vh;
    height: fit-content;
`;

const Header = styled(FlexDivRow)<{ mobileStyle?: CSSProperties }>`
    margin-bottom: 20px;
    width: 100%;
    align-items: center;
    padding: 15px 15px 0px 0px;
    justify-content: flex-end;
    @media (max-width: 575px) {
        ${(props) => props.mobileStyle && convertCssToStyledProperties(props.mobileStyle)}
    }
`;

const CloseIcon = styled.i`
    font-size: 16px;
    margin-top: 1px;
    cursor: pointer;
    &:before {
        font-family: OvertimeIconsV2 !important;
        content: '\\0031';
        color: ${(props) => props.theme.textColor.primary};
    }
`;

export default BaseModal;
