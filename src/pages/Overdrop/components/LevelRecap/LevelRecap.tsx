import { OVERDROP_LEVELS } from 'constants/overdrop';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRowCentered } from 'styles/common';
import LargeBadge from '../LargeBadge';

const LevelRecap: React.FC = () => {
    const { t } = useTranslation();
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
                            reached={item.level < 10}
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
