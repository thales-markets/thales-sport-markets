import Tooltip from 'components/Tooltip';
import { OverdropTab } from 'enums/ui';
import useUserDataQuery from 'queries/overdrop/useUserDataQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import styled from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumn, FlexDivRow } from 'styles/common';
import { OverdropUserData } from 'types/overdrop';
import { RootState } from 'types/redux';
import { OverdropLevel } from 'types/ui';
import { formatPoints, getCurrentLevelByPoints, getNextLevelItemByPoints } from 'utils/overdrop';
import { useAccount } from 'wagmi';
import CurrentLevelProgressLine from '../CurrentLevelProgressLine';

type XPOverviewProps = {
    setSelectedTab: (tab: OverdropTab) => void;
};

const XPOverview: React.FC<XPOverviewProps> = ({ setSelectedTab }) => {
    const { t } = useTranslation();

    const { address, isConnected } = useAccount();

    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const userDataQuery = useUserDataQuery(address as string, {
        enabled: isConnected,
    });

    const userData: OverdropUserData | undefined = useMemo(() => {
        if (userDataQuery?.isSuccess && userDataQuery?.data) {
            return userDataQuery.data;
        }
        return;
    }, [userDataQuery.data, userDataQuery?.isSuccess]);

    const levelItem: OverdropLevel | undefined = useMemo(() => {
        const levelItem = getCurrentLevelByPoints(userData?.points ?? 0);
        return levelItem;
    }, [userData]);

    const nextLevelItem: OverdropLevel = useMemo(() => {
        return getNextLevelItemByPoints(userData?.points);
    }, [userData]);

    return (
        <GradientBorder>
            <Wrapper>
                <Badge src={levelItem ? levelItem.largeBadge : nextLevelItem?.largeBadge} />
                <ProgressOverviewWrapper>
                    <InfoWrapper>
                        {!isMobile && (
                            <>
                                <LevelWrapper>
                                    <Label>{levelItem?.levelName ? levelItem?.levelName : '-'}</Label>
                                    <Level>
                                        {t('overdrop.overdrop-home.level')} {levelItem?.level}
                                    </Level>
                                </LevelWrapper>
                                <InfoItemTotal>
                                    <Label>{t('overdrop.overdrop-home.my-total-xp')}</Label>
                                    <TotalValue>{formatPoints(userData?.points ? userData?.points : 0)}</TotalValue>
                                </InfoItemTotal>
                                <InfoItem onClick={() => setSelectedTab(OverdropTab.LEADERBOARD)}>
                                    <Label> {t('overdrop.overdrop-home.rank')} </Label>
                                    <FlexDivCentered>
                                        <Value>{userData ? `#${userData.rank}` : '-'}</Value>{' '}
                                        <Tooltip
                                            overlay={<>{t(`overdrop.overdrop-home.rank-tooltip`)}</>}
                                            iconFontSize={14}
                                            marginLeft={3}
                                        />
                                    </FlexDivCentered>
                                </InfoItem>
                            </>
                        )}
                        {isMobile && (
                            <>
                                <LevelWrapper>
                                    <Level>
                                        {t('overdrop.overdrop-home.level')} {levelItem?.level}
                                    </Level>
                                    <InfoItem onClick={() => setSelectedTab(OverdropTab.LEADERBOARD)}>
                                        <Label> {t('overdrop.overdrop-home.rank')} </Label>
                                        <FlexDivCentered>
                                            <Value>{userData ? `#${userData.rank}` : '-'}</Value>{' '}
                                            <Tooltip
                                                overlay={<>{t(`overdrop.overdrop-home.rank-tooltip`)}</>}
                                                iconFontSize={14}
                                                marginLeft={3}
                                            />
                                        </FlexDivCentered>
                                    </InfoItem>
                                </LevelWrapper>
                                <InfoItemTotal>
                                    <TotalValue>{formatPoints(userData?.points ? userData?.points : 0)}</TotalValue>
                                </InfoItemTotal>
                            </>
                        )}
                    </InfoWrapper>

                    <CurrentLevelProgressLine height={'26px'} hideLevelLabel={true} />
                </ProgressOverviewWrapper>
            </Wrapper>
        </GradientBorder>
    );
};

const GradientBorder = styled.div`
    border-radius: 6px;
    background: ${(props) => props.theme.overdrop.borderColor.secondary};
    padding: 1px;
`;

const Wrapper = styled(FlexDiv)`
    padding: 10px 20px;
    border-radius: 6px;
    flex-direction: row;

    border-radius: 6px;
    background: ${(props) => props.theme.overdrop.background.active};
    position: relative;
    align-items: center;
    height: 120px;
    @media (max-width: 767px) {
        height: 150px;
        padding: 8px;
    }
`;

const ProgressOverviewWrapper = styled(FlexDivColumn)`
    gap: 16px;
    height: 100%;
    @media (max-width: 767px) {
        gap: 0px;
        align-items: center;
        justify-content: center;
    }
`;

const InfoWrapper = styled(FlexDivRow)`
    align-items: flex-end;
    justify-content: space-between;
    @media (max-width: 767px) {
        flex-direction: column;
        align-items: center;
    }
`;

const InfoItem = styled(FlexDivColumn)`
    flex: 1;
    gap: 8px;
    align-items: flex-end;
    justify-content: space-between;
    cursor: pointer;
    @media (max-width: 767px) {
        flex-direction: row;
        justify-content: flex-start;
    }
`;

const InfoItemTotal = styled(FlexDivColumn)`
    flex: 1;
    gap: 8px;
    align-items: center;
    @media (max-width: 767px) {
        margin-top: 6px;
        justify-content: center;
        align-items: center;
        gap: 0;
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
    font-weight: 700;
    font-size: 25px;
    line-height: 20px;
    color: ${(props) => (props.highlight ? props.theme.textColor.primary : props.theme.textColor.primary)};
    @media (max-width: 767px) {
        font-size: 14px;
    }
`;

const TotalValue = styled.span<{ highlight?: boolean }>`
    font-family: ${(props) => props.theme.fontFamily.primary};
    color: ${(props) => props.theme.overdrop.textColor.primary};
    font-size: 27px;
    line-height: 20px;
    font-weight: 700;
    letter-spacing: 0.675px;
    text-transform: uppercase;
    white-space: pre;
    @media (max-width: 767px) {
        font-size: 22px;
    }
`;

const Badge = styled.img`
    width: 190px;
    height: 190px;
    @media (max-width: 767px) {
        width: 130px;
        height: 130px;
    }
`;

const LevelWrapper = styled(FlexDivColumn)`
    align-items: flex-start;
`;

const Level = styled(Label)`
    font-size: 25px;
    font-weight: 700;
    margin-top: 8px;
    margin-right: 20px;
    white-space: pre;
    @media (max-width: 767px) {
        font-size: 20px;
    }
`;

export default XPOverview;
