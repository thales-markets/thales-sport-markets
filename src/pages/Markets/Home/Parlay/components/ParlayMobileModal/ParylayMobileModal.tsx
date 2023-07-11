import MobileModal from 'components/MobileModal';
import React from 'react';
import styled from 'styled-components';
import { FlexDivColumnCentered } from 'styles/common';
import Parlay from '../../Parlay';

type ParylayMobileModalProps = {
    onClose: () => void;
};

const ParylayMobileModal: React.FC<ParylayMobileModalProps> = ({ onClose }) => {
    return (
        <MobileModal onClose={() => onClose()} shouldCloseOnOverlayClick={true}>
            <Container>
                <Parlay onBuySuccess={onClose} />
            </Container>
        </MobileModal>
    );
};

const Container = styled(FlexDivColumnCentered)``;

export default ParylayMobileModal;
