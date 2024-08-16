import React from 'react';

import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import { ModalTypes } from 'types/overdrop';
import BaseModal from '../BaseModal';
import LevelCircles from '../LevelCircles';

const DailyModal: React.FC = () => {
    const { t } = useTranslation();

    return (
        <BaseModal onClose={() => console.log('Test')} type={ModalTypes.DAILY_STREAK}>
            <Wrapper>
                <TextWrapper>
                    <Header>{t('overdrop.modal.you-are-rocking')}</Header>
                    <SubHeader>
                        <Trans
                            i18nKey={'overdrop.modal.day-streak'}
                            values={{ days: 4 }}
                            components={{ bold: <DayBold />, br: <br /> }}
                        />
                    </SubHeader>
                </TextWrapper>
                <DetailsWrapper>
                    <Label>{t('overdrop.modal.active-daily-streak')}</Label>
                    <Percentage>{'20%'}</Percentage>
                    <LevelCircles
                        currentLevel={4}
                        levels={[1, 2, 3, 4, 5, 6, 7]}
                        customCircleSize={'30px'}
                        customGap="12px"
                        displayAdditionalLabelsBelow={true}
                        displayLevelNumberInsideCircle={true}
                        additionalLabelsForLevels={['5%', '10%', '15%', '20%', '25%', '30%', '35%']}
                    />
                </DetailsWrapper>
            </Wrapper>
        </BaseModal>
    );
};

const Wrapper = styled(FlexDivColumn)`
    font-family: 'Roboto' !important;
    align-items: center;
    justify-content: center;
    padding: 15px 20px 30px 20px;
`;

const TextWrapper = styled(FlexDivColumn)`
    margin-bottom: 40px;
    align-items: center;
    justify-content: center;
    text-align: center;
`;

const Header = styled.span`
    color: ${(props) => props.theme.overdrop.textColor.septenary};
    font-size: 18px;
    font-weight: 700;
    text-transform: uppercase;
    line-height: 100%;
    margin-bottom: 10px;
`;

const SubHeader = styled.span`
    color: ${(props) => props.theme.overdrop.textColor.septenary};
    font-size: 18px;
    font-weight: 700;
`;

const DayBold = styled.p`
    font-size: 71px;
    font-weight: 700;
    color: ${(props) => props.theme.overdrop.textColor.septenary};
`;

const DetailsWrapper = styled(FlexDivColumn)`
    margin-top: 40px;
    align-items: flex-start;
    justify-content: center;
    min-width: 500px;
    text-align: left;
`;

const Label = styled.span`
    font-size: 12px;
    font-weight: 600;
    color: ${(props) => props.theme.textColor.primary};
    text-transform: uppercase;
`;

const Percentage = styled.span`
    color: ${(props) => props.theme.overdrop.textColor.septenary};
    font-size: 31px;
    font-weight: 700;
    margin: 10px 0px;
`;

export default DailyModal;
