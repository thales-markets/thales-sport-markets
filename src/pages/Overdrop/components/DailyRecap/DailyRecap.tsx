import useUserMultipliersQuery from 'queries/overdrop/useUserMultipliersQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivColumnCentered } from 'styles/common';
import { MultiplierType } from 'types/overdrop';
import { getMultiplierValueFromQuery } from 'utils/overdrop';
import LevelCircles from '../LevelCircles';

const DailyRecap: React.FC = () => {
    const { t } = useTranslation();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';

    const userMultipliersQuery = useUserMultipliersQuery(walletAddress, {
        enabled: !!isAppReady,
    });

    const userMultipliers = useMemo(() => {
        if (userMultipliersQuery?.isSuccess && userMultipliersQuery?.data) {
            return userMultipliersQuery.data;
        }
        return;
    }, [userMultipliersQuery.data, userMultipliersQuery?.isSuccess]);

    return (
        <Wrapper>
            <ItemContainer>
                <Label>{t('overdrop.overdrop-home.daily-streak')}</Label>
                <Value>{`${getMultiplierValueFromQuery(userMultipliers, MultiplierType.DAILY)}%`}</Value>
                <LevelCircles
                    levels={[2, 3, 4, 5, 6, 7]}
                    currentLevel={getMultiplierValueFromQuery(userMultipliers, MultiplierType.DAILY) / 5}
                />
            </ItemContainer>
            <ItemContainer>
                <Label>{t('overdrop.overdrop-home.weekly-streak')}</Label>
                <Value>{`${getMultiplierValueFromQuery(userMultipliers, MultiplierType.WEEKLY)}%`}</Value>
                <LevelCircles
                    levels={[1, 2, 3, 4]}
                    currentLevel={getMultiplierValueFromQuery(userMultipliers, MultiplierType.WEEKLY) / 5}
                />
            </ItemContainer>
            <ItemContainer>
                <Label>{t('overdrop.overdrop-home.twitter-share')}</Label>
                <Value>{`${getMultiplierValueFromQuery(userMultipliers, MultiplierType.TWITTER)}%`}</Value>
            </ItemContainer>
            <ItemContainer>
                <Label>{t('overdrop.overdrop-home.twitter-xp-boost-resets')}</Label>
                <Value>{'08:30:55'}</Value>
            </ItemContainer>
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivColumn)`
    height: fit-content;
    padding: 30px 19px;
    border: 3px solid transparent;
    border-radius: 6px;
    background: linear-gradient(${(props) => props.theme.background.quinary} 0 0) padding-box,
        linear-gradient(40deg, rgba(92, 68, 44, 1) 0%, rgba(23, 25, 42, 1) 50%, rgba(92, 68, 44, 1) 100%) border-box;
    @media (max-width: 767px) {
        flex-direction: row;
        flex-wrap: wrap;
    }
`;

const ItemContainer = styled(FlexDivColumnCentered)`
    justify-content: center;
    text-align: center;
    margin-bottom: 10px;
    @media (max-width: 767px) {
        min-width: 200px;
    }
`;

const Label = styled.span`
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 2px;
`;

const Value = styled.span`
    font-size: 25px;
    font-weight: 700;
    text-transform: uppercase;
    color: ${(props) => props.theme.overdrop.textColor.primary};
`;

export default DailyRecap;
