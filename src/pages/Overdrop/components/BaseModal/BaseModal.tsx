import ModalBackground from 'assets/images/overdrop/modal-background.png';
import Trophy from 'assets/images/overdrop/trophy.webp';
import WelcomeModalBackground from 'assets/images/overdrop/welcome-modal-background.png';
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
        borderRadius: '9px',
        backgroundImage: `url(${ModalBackground})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 2000,
    },
};

const BaseModal: React.FC<ModalProps> = ({ type, onClose, children, mobileStyle }) => {
    const customStyle = {
        overlay: { ...defaultCustomStyles.overlay },
        content: {
            ...defaultCustomStyles.content,
        },
    };

    return (
        <ReactModal isOpen onRequestClose={onClose} shouldCloseOnOverlayClick={true} style={customStyle}>
            <Container mobileStyle={mobileStyle?.container} type={type}>
                <Header mobileStyle={mobileStyle?.header}>
                    <FlexDivRow>{<CloseIcon onClick={onClose} />}</FlexDivRow>
                </Header>
                {children}
                {type == ModalTypes.DAILY_STREAK && <TrophyImage src={Trophy} />}
            </Container>
        </ReactModal>
    );
};

const Container = styled.div<{ mobileStyle?: CSSProperties; removeBackground?: boolean; type: ModalTypes }>`
    border: 1px solid ${(props) => props.theme.borderColor.primary};
    padding: 0px;
    position: relative;
    overflow: hidden;
    border-radius: 9px;
    ${(props) => (props.type == ModalTypes.LEVEL_UP ? `background-color: ${props.theme.background.primary};` : '')}
    ${(props) => (props.type == ModalTypes.LEVEL_UP ? `background-image: url(${ModalBackground});` : '')}
    ${(props) => (props.type == ModalTypes.DAILY_STREAK ? `background-color: ${props.theme.background.primary};` : '')}
    ${(props) => (props.type == ModalTypes.DAILY_STREAK ? `background-image: url(${ModalBackground});` : '')}
    ${(props) => (props.type == ModalTypes.WELCOME ? `background-image: url(${WelcomeModalBackground});` : '')}
    ${(props) => (props.type == ModalTypes.WELCOME ? `background-color: none;` : '')}
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    ${(props) => (props.type == ModalTypes.LEVEL_UP ? `` : '')}
    ${(props) => (props.type == ModalTypes.LEVEL_UP ? `` : '')}
    
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
        color: ${(props) => props.theme.overdrop.textColor.primary};
    }
`;

const TrophyImage = styled.img`
    position: absolute;
    bottom: -90px;
    right: -90px;
    width: 400px;
    height: 400px;
`;
export default BaseModal;
