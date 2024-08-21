import { OVERDROP_LEVELS } from 'constants/overdrop';
import useUserDataQuery from 'queries/overdrop/useUserDataQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRowCentered } from 'styles/common';
import { OverdropUserData } from 'types/overdrop';
import { OverdropLevel } from 'types/ui';
import { getCurrentLevelByPoints } from 'utils/overdrop';
import LargeBadge from '../LargeBadge';

const LOYALTY_BOOST = ['5%', '10%', '15%', '20%', '25%'];

const LevelRecap: React.FC = () => {
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

    return (
        <Wrapper>
            <Heading>{t('overdrop.leveling-tree.heading')}</Heading>
            <BadgeContainer>
                <LoyaltyBoost>
                    {LOYALTY_BOOST[0]} {t('overdrop.leveling-tree.explainer.loyalty-boost')}
                </LoyaltyBoost>
                <BadgeWrapper>
                    {OVERDROP_LEVELS.slice(1, 6).map((item, index) => {
                        return (
                            <LargeBadge
                                key={`${index + 1}-level`}
                                requiredPointsForLevel={item.minimumPoints}
                                level={item.level}
                                reached={levelItem ? item.level <= levelItem.level : false}
                                levelName={item.levelName}
                                voucherAmount={item.voucherAmount}
                            />
                        );
                    })}
                </BadgeWrapper>
            </BadgeContainer>
            <BadgeContainer>
                <LoyaltyBoost>
                    {LOYALTY_BOOST[1]} {t('overdrop.leveling-tree.explainer.loyalty-boost')}
                </LoyaltyBoost>
                <BadgeWrapper>
                    {OVERDROP_LEVELS.slice(6, 11).map((item, index) => {
                        return (
                            <LargeBadge
                                key={`${index + 6}-level`}
                                requiredPointsForLevel={item.minimumPoints}
                                level={item.level}
                                reached={levelItem ? item.level <= levelItem.level : false}
                                levelName={item.levelName}
                                voucherAmount={item.voucherAmount}
                            />
                        );
                    })}
                </BadgeWrapper>
            </BadgeContainer>
            <BadgeContainer>
                <LoyaltyBoost>
                    {LOYALTY_BOOST[2]} {t('overdrop.leveling-tree.explainer.loyalty-boost')}
                </LoyaltyBoost>
                <BadgeWrapper>
                    {OVERDROP_LEVELS.slice(11, 16).map((item, index) => {
                        return (
                            <LargeBadge
                                key={`${index + 11}-level`}
                                requiredPointsForLevel={item.minimumPoints}
                                level={item.level}
                                reached={levelItem ? item.level <= levelItem.level : false}
                                levelName={item.levelName}
                                voucherAmount={item.voucherAmount}
                            />
                        );
                    })}
                </BadgeWrapper>
            </BadgeContainer>

            <LastRowWrapper>
                <LastContainer>
                    <LoyaltyBoost>
                        {LOYALTY_BOOST[3]} {t('overdrop.leveling-tree.explainer.loyalty-boost')}
                    </LoyaltyBoost>
                    <BadgeWrapper fullWidth>
                        {OVERDROP_LEVELS.slice(16, 20).map((item, index) => {
                            return (
                                <LargeBadge
                                    key={`${index + 19}-level`}
                                    requiredPointsForLevel={item.minimumPoints}
                                    level={item.level}
                                    reached={levelItem ? item.level <= levelItem.level : false}
                                    levelName={item.levelName}
                                    voucherAmount={item.voucherAmount}
                                />
                            );
                        })}
                    </BadgeWrapper>
                </LastContainer>
                <LastContainer>
                    <LoyaltyBoost>
                        {LOYALTY_BOOST[4]} {t('overdrop.leveling-tree.explainer.loyalty-boost')}
                    </LoyaltyBoost>

                    <BadgeWrapper>
                        {OVERDROP_LEVELS.slice(20).map((item, index) => {
                            return (
                                <LargeBadge
                                    key={`${index}-level`}
                                    requiredPointsForLevel={item.minimumPoints}
                                    level={item.level}
                                    reached={levelItem ? item.level <= levelItem.level : false}
                                    levelName={item.levelName}
                                    voucherAmount={item.voucherAmount}
                                />
                            );
                        })}
                    </BadgeWrapper>
                </LastContainer>
            </LastRowWrapper>
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivColumn)`
    flex-grow: 4;
    justify-content: center;
    align-items: center;
    gap: 28px;
    width: 100%;
`;

const BadgeContainer = styled.div`
    width: 100%;
`;

const LastContainer = styled.div`
    width: 100%;
    flex: 1;
`;

const LoyaltyBoost = styled.div`
    height: 35px;
    width: 100%;
    background-color: ${(props) => props.theme.overdrop.background.senary};
    color: ${(props) => props.theme.overdrop.textColor.secondary};
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    border-radius: 6px;
    &:before {
        content: ' ';
        position: absolute;
        background-color: ${(props) => props.theme.overdrop.background.quinary};
        bottom: -26px;
        right: -4px;
        height: 30px;
        width: 50%;
        transform: rotate(-7deg);
    }
    &:after {
        content: ' ';
        position: absolute;
        background-color: ${(props) => props.theme.overdrop.background.quinary};
        bottom: -26px;
        left: -4px;
        height: 30px;
        width: 50%;
        transform: rotate(7deg);
    }
`;

const BadgeWrapper = styled(FlexDivRowCentered)<{ fullWidth?: boolean }>`
    flex-flow: ${(props) => (props.fullWidth ? 'nowrap' : 'row wrap')};
    gap: 10px;
    width: ${(props) => (props.fullWidth ? '100%' : '')};
    align-items: flex-start;
    @media (max-width: 767px) {
        flex-flow: wrap;
    }
`;

const LastRowWrapper = styled(FlexDivRowCentered)`
    width: 100%;
    gap: 10px;

    ${LastContainer}:first-child {
        flex: 4;
    }
    @media (max-width: 767px) {
        flex-direction: column;
    }
`;

const Heading = styled.h1`
    color: ${(props) => props.theme.overdrop.textColor.primary};
    font-size: 30px;
    font-weight: 400;
    text-transform: capitalize;
    margin: 15px 0px;
`;

export default LevelRecap;
