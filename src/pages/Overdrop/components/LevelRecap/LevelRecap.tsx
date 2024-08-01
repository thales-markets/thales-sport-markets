import { OVERDROP_LEVELS } from 'constants/overdrop';
import React from 'react';
import styled from 'styled-components';
import { FlexDivRowCentered } from 'styles/common';
import LargeBadge from '../LargeBadge';

const LevelRecap: React.FC = () => {
    return (
        <Wrapper>
            {OVERDROP_LEVELS.map((item, index) => {
                return (
                    <LargeBadge
                        key={`${index}-level`}
                        requiredPointsForLevel={item.minimumPoints}
                        level={item.level}
                        reached={item.level < 10}
                        levelName={item.levelName}
                        voucherAmount={item.voucherAmount}
                    />
                );
            })}
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivRowCentered)`
    flex-wrap: wrap;
    flex-grow: 4;
    gap: 10px;
`;

export default LevelRecap;
