import Modal from 'components/Modal';
import Lottie from 'lottie-react';
import React, { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivColumnCentered } from 'styles/common';
import validationFiveMarketsAnimation from 'assets/lotties/validation-five-markets.json';

type ValidationModalProps = {
    onClose: () => void;
};

export const ValidationModal: React.FC<ValidationModalProps> = ({ onClose }) => {
    const { t } = useTranslation();

    return (
        <Modal title={t('markets.parlay.validation.title')} onClose={() => onClose()} shouldCloseOnOverlayClick={true}>
            <Container>
                <Lottie animationData={validationFiveMarketsAnimation} style={fiveMarketsStyle} />
            </Container>
        </Modal>
    );
};

const Container = styled(FlexDivColumnCentered)`
    width: 400px;
    margin-top: 20px;
    align-items: center;
    @media (max-width: 575px) {
        width: auto;
    }
`;

const fiveMarketsStyle: CSSProperties = {
    // height: 200,
    width: 350,
};

export default ValidationModal;
