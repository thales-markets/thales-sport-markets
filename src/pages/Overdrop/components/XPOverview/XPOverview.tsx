import useUserDataQuery from 'queries/overdrop/useUserDataQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivRow } from 'styles/common';
import { OverdropUserData } from 'types/overdrop';
import { OverdropLevel } from 'types/ui';
import { formatPoints, getCurrentLevelByPoints, getNextLevelItemByPoints, getProgressLevel } from 'utils/overdrop';
import ProgressLine from '../ProgressLine';

const XPOverview: React.FC = () => {
    const { t } = useTranslation();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';

    const userDataQuery = useUserDataQuery(walletAddress, {
        enabled: !!isAppReady,
    });

    const userData: OverdropUserData | undefined = useMemo(() => {
        if (userDataQuery?.isSuccess && userDataQuery?.data) {
            return userDataQuery.data;
        }
        return;
    }, [userDataQuery.data, userDataQuery?.isSuccess]);

    const levelItem: OverdropLevel | undefined = useMemo(() => {
        if (userData) {
            const levelItem = getCurrentLevelByPoints(userData.points);
            return levelItem;
        }
    }, [userData]);

    const nextLevelItem: OverdropLevel | undefined = useMemo(() => {
        if (userData) {
            const levelItem = getNextLevelItemByPoints(userData.points);
            return levelItem;
        }
    }, [userData]);

    return (
        <Wrapper>
            <Badge src={levelItem ? levelItem.largeBadge : ''} />
            <ProgressOverviewWrapper>
                <InfoWrapper>
                    <InfoItem>
                        <Label>{levelItem?.levelName}</Label>
                        <Value>{'#420'}</Value>
                    </InfoItem>
                    <InfoItemTotal>
                        <Label>{t('overdrop.overdrop-home.my-total-xp')}</Label>
                        <TotalValue>{userData ? formatPoints(userData?.points) : ''}</TotalValue>
                    </InfoItemTotal>
                </InfoWrapper>
                {levelItem && nextLevelItem && (
                    <ProgressLine
                        progress={
                            userData && nextLevelItem
                                ? getProgressLevel(userData.points, nextLevelItem.minimumPoints)
                                : 0
                        }
                        currentPoints={userData?.points || 0}
                        nextLevelPoints={nextLevelItem?.minimumPoints}
                        level={levelItem?.level}
                    />
                )}
            </ProgressOverviewWrapper>
        </Wrapper>
    );
};

const Wrapper = styled(FlexDiv)`
    padding: 18px;
    border-radius: 6px;
    flex-direction: row;
    border: 3px solid transparent;
    border-radius: 6px;
    background: linear-gradient(${(props) => props.theme.background.quinary} 0 0) padding-box,
        linear-gradient(40deg, rgba(92, 68, 44, 1) 0%, rgba(23, 25, 42, 1) 50%, rgba(92, 68, 44, 1) 100%) border-box;
    position: relative;
    align-items: center;
    height: 120px;
    @media (max-width: 767px) {
        height: 115px;
        padding: 8px;
    }
`;

const ProgressOverviewWrapper = styled(FlexDivColumn)``;

const InfoWrapper = styled(FlexDivRow)`
    align-items: center;
    justify-content: space-between;
    @media (max-width: 767px) {
        flex-direction: column;
        flex-wrap: wrap;
    }
`;

const InfoItem = styled(FlexDivColumn)`
    align-items: flex-start;
    @media (max-width: 767px) {
        flex-direction: row;
        justify-content: flex-start;
    }
`;

const InfoItemTotal = styled(FlexDivColumn)`
    align-items: flex-start;
    @media (max-width: 767px) {
        justify-content: center;
        align-items: center;
    }
`;

const Label = styled.span`
    text-transform: uppercase;
    font-weight: 300;
    font-size: 17px;
    line-height: 20px;
    color: ${(props) => props.theme.textColor.primary};
    @media (max-width: 767px) {
        font-size: 14px;
    }
`;

const Value = styled.span<{ highlight?: boolean }>`
    font-weight: 800;
    font-size: 17px;
    line-height: 20px;
    color: ${(props) => (props.highlight ? props.theme.textColor.primary : props.theme.textColor.primary)};
    @media (max-width: 767px) {
        font-size: 14px;
    }
`;

const TotalValue = styled.span<{ highlight?: boolean }>`
    font-weight: 800;
    font-size: 17px;
    line-height: 20px;
    color: ${(props) => (props.highlight ? props.theme.textColor.primary : props.theme.textColor.primary)};
    @media (max-width: 767px) {
        font-size: 27px;
        color: ${(props) => props.theme.overdrop.textColor.primary};
        font-weight: 700;
    }
`;

const Badge = styled.img`
    width: 190px;
    height: 190px;
    @media (max-width: 767px) {
        width: 170px;
        height: 170px;
    }
`;

export default XPOverview;
