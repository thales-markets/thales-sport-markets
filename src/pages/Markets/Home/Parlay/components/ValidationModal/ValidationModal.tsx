import validationFiveMarketsAnimation from 'assets/lotties/validation-five-markets.json';
import Modal from 'components/Modal';
import { ParlayErrorCode } from 'constants/markets';
import useInterval from 'hooks/useInterval';
import Lottie from 'lottie-react';
import React, { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getParlayError, resetParlayError } from 'redux/modules/parlay';
import styled from 'styled-components';
import { FlexDivColumnCentered } from 'styles/common';

type ValidationModalProps = {
    onClose: () => void;
};

export const ValidationModal: React.FC<ValidationModalProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const parlayError = useSelector(getParlayError);

    useInterval(async () => {
        dispatch(resetParlayError());
    }, 5800);

    return (
        <Modal title={t('markets.parlay.validation.title')} onClose={() => onClose()} shouldCloseOnOverlayClick={true}>
            <Container>
                {parlayError.code === ParlayErrorCode.MAX_4_MATCHES && (
                    <Lottie animationData={validationFiveMarketsAnimation} style={fiveMarketsStyle} />
                )}
                {parlayError.code === ParlayErrorCode.SAME_TEAM_TWICE && (
                    <ErrorMessage>
                        {t('markets.parlay.validation.team-in-parlay', { team: parlayError.data })}
                    </ErrorMessage>
                )}
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

const ErrorMessage = styled.p`
    margin-top: 20px;
    font-style: normal;
    font-size: 15px;
    line-height: 22px;
    color: #ffffff;
    text-transform: uppercase;
`;

const fiveMarketsStyle: CSSProperties = {
    width: 350,
};

export default ValidationModal;
