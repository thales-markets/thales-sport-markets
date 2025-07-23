import { MultiplierType } from 'enums/overdrop';
import useUserMultipliersQuery from 'queries/overdrop/useUserMultipliersQuery';
import React from 'react';
import { useTranslation } from 'react-i18next';

import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered } from 'styles/common';

import { getMultiplierValueFromQuery } from 'utils/overdrop';
import { useAccount } from 'wagmi';
import LevelCircles from '../LevelCircles';

const DailyRecap: React.FC = () => {
    const { t } = useTranslation();

    const { address, isConnected } = useAccount();

    const userMultipliersQuery = useUserMultipliersQuery(address as string, {
        enabled: isConnected,
    });

    const userMultipliers =
        userMultipliersQuery.isSuccess && userMultipliersQuery.data ? userMultipliersQuery.data : undefined;

    return (
        <Wrapper>
            <ItemContainer>
                <Label>{t('overdrop.overdrop-home.daily-streak')}</Label>
                <ValueWrapper>
                    <Value>{`${getMultiplierValueFromQuery(userMultipliers, MultiplierType.DAILY)}%`}</Value>
                    <LevelCircles
                        displayLevelNumberInsideCircle
                        additionalStyles={{ flexFlow: 'nowrap' }}
                        levels={[1, 2, 3, 4, 5, 6, 7]}
                        currentLevel={getMultiplierValueFromQuery(userMultipliers, MultiplierType.DAILY) / 5}
                    />
                </ValueWrapper>
            </ItemContainer>
            <ItemContainer>
                <Label>{t('overdrop.overdrop-home.weekly-streak')}</Label>
                <ValueWrapper>
                    <Value>{`${getMultiplierValueFromQuery(userMultipliers, MultiplierType.WEEKLY)}%`}</Value>
                    <LevelCircles
                        displayLevelNumberInsideCircle
                        additionalStyles={{ flexFlow: 'nowrap' }}
                        levels={[1, 2, 3, 4]}
                        currentLevel={getMultiplierValueFromQuery(userMultipliers, MultiplierType.WEEKLY) / 5}
                    />
                </ValueWrapper>
            </ItemContainer>
            <ItemContainer>
                <Label>{t('overdrop.overdrop-home.loyalty-boost')}</Label>
                <Value>{`${getMultiplierValueFromQuery(userMultipliers, MultiplierType.LOYALTY)}%`}</Value>
            </ItemContainer>
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivCentered)`
    height: 52px;
    background: ${(props) => props.theme.overdrop.background.active};
    border-radius: 6px;
    @media (max-width: 767px) {
        flex-direction: row;
        flex-wrap: wrap;
    }
`;

const ItemContainer = styled(FlexDivColumnCentered)`
    justify-content: center;
    text-align: center;
    gap: 2px;
    @media (max-width: 767px) {
        min-width: 200px;
    }
    &:nth-child(2) {
        border-right: 2px solid ${(props) => props.theme.overdrop.borderColor.quaternary};
        border-left: 2px solid ${(props) => props.theme.overdrop.borderColor.quaternary};
    }
`;

const Label = styled.span`
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 4px;
`;

const Value = styled.span`
    font-size: 20px;
    font-weight: 700;
    text-transform: uppercase;
    color: ${(props) => props.theme.overdrop.textColor.primary};
    position: relative;
`;

const ValueWrapper = styled(FlexDivCentered)`
    gap: 8px;
    height: 23px;
`;

export default DailyRecap;
