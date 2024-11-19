import { OVERDROP_LEVELS } from 'constants/overdrop';
import LargeBadge from 'pages/Overdrop/components/LargeBadge';
import useUserDataQuery from 'queries/overdrop/useUserDataQuery';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsWalletConnected, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivRowCentered } from 'styles/common';
import { OverdropUserData } from 'types/overdrop';
import { OverdropLevel } from 'types/ui';
import { getCurrentLevelByPoints } from 'utils/overdrop';

type BadgeGroupProps = {
    loyaltyBoost: number;
    startIndex: number;
    endIndex: number;
};

const BadgeGroup: React.FC<BadgeGroupProps> = ({ startIndex, endIndex }) => {
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';

    const userDataQuery = useUserDataQuery(walletAddress, {
        enabled: isAppReady && isWalletConnected,
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
                            gold={item.level === 20}
                        />
                    );
                })}
            </BadgeWrapper>
        </>
    );
};

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
