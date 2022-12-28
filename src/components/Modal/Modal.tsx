import React from 'react';
import styled, { CSSProperties } from 'styled-components';
import { FlexDiv, FlexDivRow } from 'styles/common';
import ReactModal from 'react-modal';
import { convertCssToStyledProperties } from 'utils/style';

type ModalProps = {
    title: string;
    shouldCloseOnOverlayClick?: boolean;
    customStyle?: ReactModal.Styles;
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
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        padding: '0px',
        background: 'transparent',
        border: 'none',
        overflow: 'none',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 2,
    },
};

export const Modal: React.FC<ModalProps> = ({
    title,
    onClose,
    children,
    shouldCloseOnOverlayClick,
    customStyle,
    mobileStyle,
}) => {
    const customStylesOverride = customStyle
        ? {
              content: { ...defaultCustomStyles.content, ...customStyle.content },
              overlay: { ...defaultCustomStyles.overlay, ...customStyle.overlay },
          }
        : defaultCustomStyles;

    return (
        <ReactModal
            isOpen
            onRequestClose={onClose}
            shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
            style={customStylesOverride}
        >
            <Container mobileStyle={mobileStyle?.container}>
                <Header mobileStyle={mobileStyle?.header}>
                    <Title>{title}</Title>
                    <FlexDivRow>{<CloseIcon onClick={onClose} />}</FlexDivRow>
                </Header>
                {children}
            </Container>
        </ReactModal>
    );
};

const Container = styled.div<{ mobileStyle?: CSSProperties }>`
    border: 1px solid ${(props) => props.theme.borderColor.primary};
    background: ${(props) => props.theme.background.primary};
    padding: 25px 30px 35px 30px;
    border-radius: 23px;
    @media (max-width: 575px) {
        ${(props) =>
            props.mobileStyle ? convertCssToStyledProperties(props.mobileStyle) : 'padding: 25px 20px 35px 20px;'}
    }
    max-height: 100vh;
    height: fit-content;
`;

const Header = styled(FlexDivRow)<{ mobileStyle?: CSSProperties }>`
    margin-bottom: 20px;
    @media (max-width: 575px) {
        ${(props) => props.mobileStyle && convertCssToStyledProperties(props.mobileStyle)}
    }
`;

const Title = styled(FlexDiv)`
    font-style: normal;
    font-weight: bold;
    font-size: 20px;
    line-height: 100%;
    text-align: center;
    color: ${(props) => props.theme.textColor.primary};
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

export default Modal;
