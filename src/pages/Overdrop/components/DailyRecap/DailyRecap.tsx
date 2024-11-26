import { hoursToMilliseconds, intervalToDuration } from 'date-fns';
import { MultiplierType } from 'enums/overdrop';
import { t } from 'i18next';
import useUserDataQuery from 'queries/overdrop/useUserDataQuery';
import useUserMultipliersQuery from 'queries/overdrop/useUserMultipliersQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivColumnCentered } from 'styles/common';
import biconomyConnector from 'utils/biconomyWallet';
import { formattedDurationFull } from 'utils/formatters/date';
import { getMultiplierValueFromQuery } from 'utils/overdrop';
import { useAccount } from 'wagmi';
import LevelCircles from '../LevelCircles';

const dateTimeTranslationMap = {
    'days-short': t('common.time-remaining.days-short'),
    'hours-short': t('common.time-remaining.hours-short'),
    'minutes-short': t('common.time-remaining.minutes-short'),
};

const DailyRecap: React.FC = () => {
    const { t } = useTranslation();

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const { address, isConnected } = useAccount();
    const walletAddress = (isBiconomy ? biconomyConnector.address : address) || '';

    const userMultipliersQuery = useUserMultipliersQuery(walletAddress, {
        enabled: isConnected,
    });

    const userDataQuery = useUserDataQuery(walletAddress, {
        enabled: isConnected,
    });

    const userMultipliers =
        userMultipliersQuery.isSuccess && userMultipliersQuery.data ? userMultipliersQuery.data : undefined;
    const userData = userDataQuery.isSuccess && userDataQuery.data ? userDataQuery.data : undefined;

    const duration = useMemo(() => {
        if (userData && userData.lastTwitterActivity) {
            const duration = intervalToDuration({ start: userData.lastTwitterActivity, end: Date.now() });
            if (duration && duration.days) {
                if (duration.days >= 3) return 'expired';
            }
            const resetsIn = intervalToDuration({
                start: Date.now(),
                end: userData.lastTwitterActivity + hoursToMilliseconds(72),
            });

            return formattedDurationFull(resetsIn, dateTimeTranslationMap);
        }
        return '--:--';
    }, [userData]);

    return (
        <GradientBorder>
            <Wrapper>
                <ItemContainer>
                    <Label>{t('overdrop.overdrop-home.daily-streak')}</Label>
                    <Value>{`${getMultiplierValueFromQuery(userMultipliers, MultiplierType.DAILY)}%`}</Value>
                    <LevelCircles
                        additionalStyles={{ flexFlow: 'nowrap' }}
                        levels={[1, 2, 3, 4, 5, 6, 7]}
                        currentLevel={getMultiplierValueFromQuery(userMultipliers, MultiplierType.DAILY) / 5}
                    />
                </ItemContainer>
                <ItemContainer>
                    <Label>{t('overdrop.overdrop-home.weekly-streak')}</Label>
                    <Value>{`${getMultiplierValueFromQuery(userMultipliers, MultiplierType.WEEKLY)}%`}</Value>
                    <LevelCircles
                        additionalStyles={{ flexFlow: 'nowrap' }}
                        levels={[1, 2, 3, 4]}
                        currentLevel={getMultiplierValueFromQuery(userMultipliers, MultiplierType.WEEKLY) / 5}
                    />
                </ItemContainer>
                <ItemContainer>
                    <Label>{t('overdrop.overdrop-home.loyalty-boost')}</Label>
                    <Value>{`${getMultiplierValueFromQuery(userMultipliers, MultiplierType.LOYALTY)}%`}</Value>
                </ItemContainer>
                <ItemContainer>
                    <Label>{t('overdrop.overdrop-home.twitter-share')}</Label>
                    <Value>{`${getMultiplierValueFromQuery(userMultipliers, MultiplierType.TWITTER)}%`}</Value>
                </ItemContainer>

                <ItemContainer>
                    <Label>{t('overdrop.overdrop-home.twitter-xp-boost-resets')}</Label>
                    <Value>{duration}</Value>
                </ItemContainer>
            </Wrapper>
        </GradientBorder>
    );
};

const GradientBorder = styled.div`
    border-radius: 6px;
    background: ${(props) => props.theme.overdrop.borderColor.secondary};
    padding: 1px;
`;

const Wrapper = styled(FlexDivColumn)`
    height: fit-content;
    padding: 11px 10px;
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
    margin-bottom: 4px;
`;

const Value = styled.span`
    font-size: 25px;
    font-weight: 700;
    text-transform: uppercase;
    color: ${(props) => props.theme.overdrop.textColor.primary};
    position: relative;
`;

export default DailyRecap;
