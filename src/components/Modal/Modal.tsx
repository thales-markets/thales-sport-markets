import { ScreenSizeBreakpoint } from 'enums/ui';
import React from 'react';
import ReactModal from 'react-modal';
import styled, { CSSProperties } from 'styled-components';
import { FlexDiv, FlexDivRow } from 'styles/common';
import { convertCssToStyledProperties } from 'thales-utils';
import { isSmallDevice } from 'utils/device';

type ModalProps = {
    title: string;
    shouldCloseOnOverlayClick?: boolean;
    customStyle?: ReactModal.Styles;
    mobileStyle?: {
        container?: CSSProperties;
        header?: CSSProperties;
    };
    containerStyle?: CSSProperties;
    onClose: () => void;
    hideHeader?: boolean;
    children: React.ReactNode;
};

ReactModal.setAppElement('#root');

const defaultCustomStyles = {
    content: isSmallDevice
        ? {
              top: '0',
              left: '0',
              right: 'auto',
              bottom: 'auto',
              marginRight: '0',
              transform: 'none',
              width: '100%',
              padding: '0px',
              background: 'transparent',
              border: 'none',
              overflow: 'auto',
          }
        : {
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              marginRight: '-48%',
              transform: 'translate(-50%, -50%)',
              padding: '0px',
              background: 'transparent',
              border: 'none',
              overflow: 'auto',
          },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 2000,
    },
};

const Modal: React.FC<ModalProps> = ({
    title,
    onClose,
    children,
    shouldCloseOnOverlayClick,
    customStyle,
    mobileStyle,
    containerStyle,
    hideHeader,
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
            <Container mobileStyle={mobileStyle?.container} containerStyle={containerStyle}>
                {!hideHeader && (
                    <Header mobileStyle={mobileStyle?.header}>
                        <Title>{title}</Title>
                        <FlexDivRow>{<CloseIcon onClick={onClose} />}</FlexDivRow>
                    </Header>
                )}
                {children}
            </Container>
        </ReactModal>
    );
};

const Container = styled.div<{ mobileStyle?: CSSProperties; containerStyle?: CSSProperties }>`
    border: 1px solid ${(props) => props.theme.borderColor.primary};
    background: ${(props) => props.theme.background.primary};
    padding: 25px 30px 35px 30px;
    border-radius: 16px;
    height: fit-content;
    max-height: 100vh;

    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        height: auto;
        border-radius: 10px;
        overflow: auto;
        ${(props) =>
            props.mobileStyle ? convertCssToStyledProperties(props.mobileStyle) : 'padding: 20px 15px 30px 15px;'}
    }
    ${(props) => (props.containerStyle ? convertCssToStyledProperties(props.containerStyle) : '')}
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
        font-family: OvertimeIconsV2 !important;
        content: '\\0031';
        color: ${(props) => props.theme.textColor.primary};
    }
`;

export default Modal;
