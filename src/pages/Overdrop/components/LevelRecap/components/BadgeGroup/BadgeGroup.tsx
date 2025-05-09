import { OVERDROP_LEVELS } from 'constants/overdrop';
import LargeBadge from 'pages/Overdrop/components/LargeBadge';
import useUserDataQuery from 'queries/overdrop/useUserDataQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivRowCentered } from 'styles/common';
import { OverdropUserData } from 'types/overdrop';
import { RootState } from 'types/redux';
import { OverdropLevel } from 'types/ui';
import { getCurrentLevelByPoints } from 'utils/overdrop';
import useBiconomy from 'utils/useBiconomy';
import { useAccount } from 'wagmi';

const LOYALTY_BOOST = ['5%', '10%', '15%', '20%', '25%'];

type BadgeGroupProps = {
    loyaltyBoost: number;
    startIndex: number;
    endIndex: number;
};

const BadgeGroup: React.FC<BadgeGroupProps> = ({ loyaltyBoost, startIndex, endIndex }) => {
    const { t } = useTranslation();

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const { address, isConnected } = useAccount();
    const { smartAddress } = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddress : address) || '';

    const userDataQuery = useUserDataQuery(walletAddress, {
        enabled: isConnected,
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
        <>
            <LoyaltyBoost>
                {LOYALTY_BOOST[loyaltyBoost]} {t('overdrop.leveling-tree.explainer.loyalty-boost')}
            </LoyaltyBoost>
            <BadgeWrapper>
                {OVERDROP_LEVELS.slice(startIndex, endIndex).map((item, index) => {
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
        </>
    );
};

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

export default BadgeGroup;
