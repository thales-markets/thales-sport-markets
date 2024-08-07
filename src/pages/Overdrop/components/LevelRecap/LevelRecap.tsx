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
            <BadgeWrapper>
                {OVERDROP_LEVELS.map((item, index) => {
                    return (
                        <LargeBadge
                            key={`${index}-level`}
                            requiredPointsForLevel={item.minimumPoints}
                            level={item.level}
                            reached={levelItem ? item.level < levelItem.level : false}
                            levelName={item.levelName}
                            voucherAmount={item.voucherAmount}
                        />
                    );
                })}
            </BadgeWrapper>
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivColumn)`
    flex-grow: 4;
    justify-content: center;
    align-items: center;
`;

const BadgeWrapper = styled(FlexDivRowCentered)`
    flex-wrap: wrap;
    gap: 10px;
`;

const Heading = styled.h1`
    color: ${(props) => props.theme.overdrop.textColor.primary};
    font-size: 30px;
    font-weight: 400;
    text-transform: capitalize;
    margin: 15px 0px;
`;

export default LevelRecap;
