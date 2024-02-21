import Button from 'components/Button';
import Modal from 'components/Modal';
import { OddsType } from 'enums/markets';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getOddsType, setOddsType } from 'redux/modules/ui';
import styled from 'styled-components';
import { Colors, FlexDivCentered, FlexDivColumnCentered } from 'styles/common';

type OddsSelectorModalProps = {
    onClose: () => void;
};

const OddsSelectorModal: React.FC<OddsSelectorModalProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const selectedOddsType = useSelector(getOddsType);
    const setSelectedOddsType = useCallback(
        (oddsType: OddsType) => {
            return dispatch(setOddsType(oddsType));
        },
        [dispatch]
    );

    return (
        <Modal
            title={t('common.odds-modal.title')}
            onClose={onClose}
            shouldCloseOnOverlayClick={false}
            customStyle={{ overlay: { zIndex: 201 } }}
        >
            <Container>
                <Description>{t('common.odds-modal.description')}</Description>
                <Note>{t('common.odds-modal.info')}</Note>
                <Container>
                    <Button
                        margin="5px"
                        backgroundColor={Colors.GRAY}
                        borderColor={selectedOddsType == OddsType.American ? Colors.BLUE : Colors.GRAY}
                        textColor={selectedOddsType == OddsType.American ? Colors.BLUE : Colors.WHITE}
                        onClick={() => setSelectedOddsType(OddsType.American)}
                    >
                        {t('common.odds-modal.american-odds')}
                    </Button>
                    <Button
                        margin="5px"
                        backgroundColor={Colors.GRAY}
                        borderColor={selectedOddsType == OddsType.Decimal ? Colors.BLUE : Colors.GRAY}
                        textColor={selectedOddsType == OddsType.Decimal ? Colors.BLUE : Colors.WHITE}
                        onClick={() => setSelectedOddsType(OddsType.Decimal)}
                    >
                        {t('common.odds-modal.decimal-odds')}
                    </Button>
                    <Button
                        margin="5px"
                        backgroundColor={Colors.GRAY}
                        borderColor={selectedOddsType == OddsType.AMM ? Colors.BLUE : Colors.GRAY}
                        textColor={selectedOddsType == OddsType.AMM ? Colors.BLUE : Colors.WHITE}
                        onClick={() => setSelectedOddsType(OddsType.AMM)}
                    >
                        {t('common.odds-modal.normalized-odds')}
                    </Button>
                </Container>
                <ButtonContainer>
                    <Button onClick={onClose}>{t('common.odds-modal.save')}</Button>
                </ButtonContainer>
            </Container>
        </Modal>
    );
};

const Container = styled(FlexDivColumnCentered)`
    width: 350px;
    @media (max-width: 575px) {
        width: auto;
    }
`;

const Description = styled.div`
    font-style: normal;
    font-weight: 400;
    font-size: 18px;
    line-height: 20px;
    color: ${(props) => props.theme.textColor.primary};
`;

const Note = styled.div`
    font-style: normal;
    font-weight: 400;
    font-size: 13px;
    line-height: 20px;
    margin-bottom: 15px;
    color: ${(props) => props.theme.textColor.secondary};
`;

const ButtonContainer = styled(FlexDivCentered)`
    margin: 30px 0 10px 0;
`;

export default OddsSelectorModal;
