import Button from 'components/Button';
import Modal from 'components/Modal';
import { OddsType } from 'enums/markets';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setOddsType } from 'redux/modules/ui';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered, FlexDivRow } from 'styles/common';

type OddsSelectorModalProps = {
    onClose: () => void;
};

const OddsSelectorModal: React.FC<OddsSelectorModalProps> = ({ onClose }) => {
    const theme = useTheme();
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
            customStyle={{
                overlay: {
                    zIndex: 201,
                },
            }}
            containerStyle={{
                background: theme.background.secondary,
                border: 'none',
            }}
            hideHeader
            title=""
            onClose={onClose}
        >
            <Container>
                <FlexDivRow>{<CloseIcon onClick={onClose} />}</FlexDivRow>
                <LogoIcon className="icon icon--overtime" />
                <Title>{t('common.odds-modal.title')}</Title>
                <Description>{t('common.odds-modal.description')}</Description>
                <Note>{t('common.odds-modal.info')}</Note>
                <Container>
                    <Button
                        margin="5px"
                        width="100%"
                        height="44px"
                        fontSize="16px"
                        backgroundColor={
                            selectedOdds == OddsType.AMERICAN ? theme.background.quaternary : 'transparent'
                        }
                        borderRadius="8px"
                        borderColor={
                            selectedOdds == OddsType.AMERICAN ? theme.borderColor.quaternary : theme.borderColor.primary
                        }
                        textColor={
                            selectedOdds == OddsType.AMERICAN ? theme.textColor.tertiary : theme.textColor.primary
                        }
                        onClick={() => setSelectedOdds(OddsType.AMERICAN)}
                    >
                        {t('common.odds-modal.american-odds')}
                    </Button>
                    <Button
                        margin="5px"
                        width="100%"
                        height="44px"
                        fontSize="16px"
                        backgroundColor={selectedOdds == OddsType.DECIMAL ? theme.background.quaternary : 'transparent'}
                        borderRadius="8px"
                        borderColor={
                            selectedOdds == OddsType.DECIMAL ? theme.borderColor.quaternary : theme.borderColor.primary
                        }
                        textColor={
                            selectedOdds == OddsType.DECIMAL ? theme.textColor.tertiary : theme.textColor.primary
                        }
                        onClick={() => setSelectedOdds(OddsType.DECIMAL)}
                    >
                        {t('common.odds-modal.decimal-odds')}
                    </Button>
                    <Button
                        margin="5px"
                        width="100%"
                        height="44px"
                        fontSize="16px"
                        backgroundColor={selectedOdds == OddsType.AMM ? theme.background.quaternary : 'transparent'}
                        borderRadius="8px"
                        borderColor={
                            selectedOdds == OddsType.AMM ? theme.borderColor.quaternary : theme.borderColor.primary
                        }
                        textColor={selectedOdds == OddsType.AMM ? theme.textColor.tertiary : theme.textColor.primary}
                        onClick={() => setSelectedOdds(OddsType.AMM)}
                    >
                        {t('common.odds-modal.normalized-odds')}
                    </Button>
                </Container>
                <ButtonContainer>
                    <Button
                        margin="20px 0 0 0"
                        width="100%"
                        height="44px"
                        fontSize="16px"
                        backgroundColor={theme.background.quaternary}
                        borderRadius="8px"
                        borderColor={theme.borderColor.quaternary}
                        textColor={theme.textColor.tertiary}
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
    align-items: center;
    width: 100%;
`;

const Title = styled.div`
    color: ${(props) => props.theme.textColor.primary};
    text-align: center;
    font-size: 22px;
    line-height: 24px;
    font-weight: 600;
    margin-top: 25px;
    margin-bottom: 15px;
    @media (max-width: 575px) {
        font-size: 20px;
    }
`;

const Note = styled.div`
    max-width: 420px;
    color: ${(props) => props.theme.textColor.secondary};
    text-align: center;
    font-size: 14px;
    font-weight: 600;
    line-height: 16px;
    margin-bottom: 30px;
    @media (max-width: 575px) {
        font-size: 14px;
    }
`;

const Description = styled(Note)`
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 2px;
`;

const ButtonContainer = styled(FlexDivCentered)`
    margin: 30px 0 10px 0;
    width: 100%;
`;

const LogoIcon = styled.i`
    font-size: 250px;
    line-height: 56px;
    color: ${(props) => props.theme.textColor.primary};
    @media (max-width: 575px) {
        font-size: 200px;
        line-height: 48px;
    }
`;

const CloseIcon = styled.i.attrs({ className: 'icon icon--close' })`
    color: ${(props) => props.theme.textColor.secondary};
    font-size: 14px;
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
`;

export default OddsSelectorModal;
