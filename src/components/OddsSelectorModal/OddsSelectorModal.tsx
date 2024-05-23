import Button from 'components/Button';
import Modal from 'components/Modal';
import { OddsType } from 'enums/markets';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setOddsType } from 'redux/modules/ui';
import styled from 'styled-components';
import { Colors, FlexDivCentered, FlexDivColumnCentered } from 'styles/common';

type OddsSelectorModalProps = {
    onClose: () => void;
};

const OddsSelectorModal: React.FC<OddsSelectorModalProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [selectedOdds, setSelectedOdds] = useState<OddsType>(OddsType.DECIMAL);

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
                        borderColor={selectedOdds == OddsType.AMERICAN ? Colors.BLUE : Colors.GRAY}
                        textColor={selectedOdds == OddsType.AMERICAN ? Colors.BLUE : Colors.WHITE}
                        onClick={() => setSelectedOdds(OddsType.AMERICAN)}
                    >
                        {t('common.odds-modal.american-odds')}
                    </Button>
                    <Button
                        margin="5px"
                        backgroundColor={Colors.GRAY}
                        borderColor={selectedOdds == OddsType.DECIMAL ? Colors.BLUE : Colors.GRAY}
                        textColor={selectedOdds == OddsType.DECIMAL ? Colors.BLUE : Colors.WHITE}
                        onClick={() => setSelectedOdds(OddsType.DECIMAL)}
                    >
                        {t('common.odds-modal.decimal-odds')}
                    </Button>
                    <Button
                        margin="5px"
                        backgroundColor={Colors.GRAY}
                        borderColor={selectedOdds == OddsType.AMM ? Colors.BLUE : Colors.GRAY}
                        textColor={selectedOdds == OddsType.AMM ? Colors.BLUE : Colors.WHITE}
                        onClick={() => setSelectedOdds(OddsType.AMM)}
                    >
                        {t('common.odds-modal.normalized-odds')}
                    </Button>
                </Container>
                <ButtonContainer>
                    <Button
                        onClick={() => {
                            setSelectedOddsType(selectedOdds);
                            onClose();
                        }}
                    >
                        {t('common.odds-modal.save')}
                    </Button>
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
