import { OVERDROP_LEVELS } from 'constants/overdrop';
import LargeBadge from 'pages/Overdrop/components/LargeBadge';
import useUserDataQuery from 'queries/overdrop/useUserDataQuery';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivRowCentered } from 'styles/common';
import { OverdropUserData } from 'types/overdrop';
import { RootState } from 'types/redux';
import { OverdropLevel } from 'types/ui';
import { getCurrentLevelByPoints } from 'utils/overdrop';
import useBiconomy from 'utils/smartAccount/hooks/useBiconomy';
import { useAccount } from 'wagmi';

type BadgeGroupProps = {
    startIndex: number;
    endIndex: number;
};

const BadgeGroup: React.FC<BadgeGroupProps> = ({ startIndex, endIndex }) => {
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

const BadgeWrapper = styled(FlexDivRowCentered)<{ fullWidth?: boolean }>`
    align-items: flex-start;
    @media (max-width: 767px) {
        flex-flow: wrap;
    }
`;

export default BadgeGroup;
