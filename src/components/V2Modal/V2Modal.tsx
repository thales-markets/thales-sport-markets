import React, { CSSProperties } from 'react';
import ReactModal from 'react-modal';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { LOCAL_STORAGE_KEYS } from '../../constants/storage';
import useLocalStorage from '../../hooks/useLocalStorage';
import { getIsMobile } from '../../redux/modules/app';
import SPAAnchor from '../SPAAnchor';

const OddsSelectorModal: React.FC = () => {
    const isMobile = useSelector(getIsMobile);
    const [showV2Modal, setShowV2Modal] = useLocalStorage(LOCAL_STORAGE_KEYS.SHOW_V2_MODAL, true);

    return showV2Modal ? (
        <ReactModal
            isOpen
            onRequestClose={() => setShowV2Modal(false)}
            shouldCloseOnOverlayClick={false}
            style={defaultCustomStyles}
        >
            <Container>
                <CloseIcon onClick={() => setShowV2Modal(false)} />
                <SPAAnchor href={'https://v2.overtimemarkets.xyz/'} onClick={() => setShowV2Modal(false)}>
                    <Image src={isMobile ? 'v2-popup-mobile.png' : 'v2-popup.png'} />
                </SPAAnchor>
            </Container>
        </ReactModal>
    ) : null;
};

const Container = styled.div<{ mobileStyle?: CSSProperties }>`
    background: ${(props) => props.theme.background.primary};
    border-radius: 8px;
    position: relative;
    overflow: hidden;
`;

const Image = styled.img`
    cursor: pointer;
`;

const CloseIcon = styled.i`
    position: absolute;
    right: 0px;
    font-size: 12px;
    margin-top: 1px;
    padding: 10px;
    cursor: pointer;
    &:before {
        font-family: ExoticIcons !important;
        content: '\\004F';
        color: ${(props) => props.theme.textColor.primary};
    }
`;

const defaultCustomStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-48%',
        transform: 'translate(-50%, -50%)',
        padding: '0px',
        background: 'transparent',
        border: 'none',
        overflow: 'none',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        zIndex: 202,
    },
};

export default OddsSelectorModal;
