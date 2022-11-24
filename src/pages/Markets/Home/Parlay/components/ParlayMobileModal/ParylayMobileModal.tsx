import MobileModal from 'components/MobileModal';
import React from 'react';
import styled from 'styled-components';
import { FlexDivColumnCentered } from 'styles/common';
import Parlay from '../../Parlay';

type ParylayMobileModalProps = {
    onClose: () => void;
};

export const ParylayMobileModal: React.FC<ParylayMobileModalProps> = ({ onClose }) => {
    return (
        <MobileModal onClose={() => onClose()} shouldCloseOnOverlayClick={true}>
            <Container>
                <Parlay />
            </Container>
        </MobileModal>
    );
};

const Container = styled(FlexDivColumnCentered)`
    margin-top: 20px;
`;

export default ParylayMobileModal;
