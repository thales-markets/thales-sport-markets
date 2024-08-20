import React, { useState } from 'react';

import { OVERDROP_LEVELS } from 'constants/overdrop';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow } from 'styles/common';
import { ModalTypes } from 'types/overdrop';
import { OverdropLevel } from 'types/ui';
import BaseModal from '../BaseModal';
import LargeBadge from '../LargeBadge';

type LevelUpModalProps = {
    currentLevel: number;
    onClose: () => void;
};

const NUMBER_OF_CARDS = 3;

const LevelUpModal: React.FC<LevelUpModalProps> = ({ currentLevel, onClose }) => {
    const { t } = useTranslation();

    const [currentStep, setCurrentStep] = useState<number>(currentLevel - 1);

    const handleOnNext = () => {
        if (currentStep + 1 + NUMBER_OF_CARDS == OVERDROP_LEVELS.length + 1) return;
        setCurrentStep(currentStep + 1);
    };

    const handleOnPrevious = () => {
        if (currentStep - 1 <= -1) return;
        setCurrentStep(currentStep - 1);
    };

    const levelItem = OVERDROP_LEVELS.find((item) => item.level == currentLevel) as OverdropLevel;

    return (
        <BaseModal type={ModalTypes.LEVEL_UP} onClose={() => onClose()}>
            <Wrapper>
                <TextWrapper>
                    <Header>{t('overdrop.modal.congratulation')}</Header>
                    <SubHeader>
                        <Trans
                            i18nKey={
                                levelItem.voucherAmount
                                    ? 'overdrop.modal.reached-level'
                                    : 'overdrop.modal.unlocked-level'
                            }
                            values={{ amount: levelItem.voucherAmount, level: levelItem.level }}
                        />
                    </SubHeader>
                </TextWrapper>
                <BadgeWrapper>
                    <Arrow className={'icon-homepage icon--arrow-left'} onClick={() => handleOnPrevious()} />
                    {OVERDROP_LEVELS.slice(currentStep, currentStep + NUMBER_OF_CARDS).map((item, index) => {
                        return (
                            <LargeBadge
                                key={`${index}-level`}
                                requiredPointsForLevel={item.minimumPoints}
                                level={item.level}
                                reached={item.level <= currentLevel}
                                levelName={item.levelName}
                                voucherAmount={item.voucherAmount}
                                highlight={item.level == currentLevel}
                            />
                        );
                    })}
                    <Arrow className={'icon-homepage icon--arrow-right'} onClick={() => handleOnNext()} />
                </BadgeWrapper>
            </Wrapper>
        </BaseModal>
    );
};

const Wrapper = styled(FlexDivColumn)`
    font-family: 'Roboto' !important;
    align-items: center;
    justify-content: center;
    padding: 20px;
    @media (max-width: 767px) {
        width: 95%;
    }
`;

const TextWrapper = styled(FlexDivColumn)`
    margin-bottom: 12px;
    align-items: center;
    justify-content: center;
    text-align: center;
`;

const Header = styled.span`
    color: ${(props) => props.theme.overdrop.textColor.septenary};
    font-size: 22px;
    font-weight: 700;
    text-transform: uppercase;
    line-height: 130%;
    margin-bottom: 24px;
`;

const SubHeader = styled.span`
    color: ${(props) => props.theme.overdrop.textColor.septenary};
    font-size: 14px;
    font-weight: 500;
    width: 80%;
`;

const BadgeWrapper = styled(FlexDivRow)`
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 40px;
`;

const Arrow = styled.i`
    color: ${(props) => props.theme.button.background.senary};
    font-size: 18px;
    cursor: pointer;
`;

export default LevelUpModal;
