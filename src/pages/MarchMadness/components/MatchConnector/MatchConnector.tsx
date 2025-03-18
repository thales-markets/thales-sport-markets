import {
    ELITE8_ROUND_BOTTOM_LEFT_MATCH_ID,
    ELITE8_ROUND_MATCH_IDS,
    ELITE8_ROUND_UPPER_LEFT_MATCH_ID,
    ELITE8_ROUND_UPPER_RIGHT_MATCH_ID,
    SECOND_ROUND_BOTTOM_LEFT_MATCH_IDS,
    SECOND_ROUND_BOTTOM_RIGHT_MATCH_IDS,
    SECOND_ROUND_MATCH_IDS,
    SECOND_ROUND_UPPER_LEFT_MATCH_IDS,
    SECOND_ROUND_UPPER_RIGHT_MATCH_IDS,
    SWEET16_ROUND_BOTTOM_LEFT_MATCH_IDS,
    SWEET16_ROUND_BOTTOM_RIGHT_MATCH_IDS,
    SWEET16_ROUND_MATCH_IDS,
    SWEET16_ROUND_UPPER_LEFT_MATCH_IDS,
    SWEET16_ROUND_UPPER_RIGHT_MATCH_IDS,
} from 'constants/marchMadness';
import React, { useMemo } from 'react';
import styled from 'styled-components';

type MatchConnectorProps = { id: number };

const MatchConnector: React.FC<MatchConnectorProps> = ({ id }) => {
    const isSecondRound = useMemo(() => SECOND_ROUND_MATCH_IDS.includes(id), [id]);
    const isSecondRoundLeft = useMemo(
        () => [...SECOND_ROUND_UPPER_LEFT_MATCH_IDS, ...SECOND_ROUND_BOTTOM_LEFT_MATCH_IDS].includes(id),
        [id]
    );
    const isSecondRoundUpper = useMemo(
        () => [...SECOND_ROUND_UPPER_LEFT_MATCH_IDS, ...SECOND_ROUND_UPPER_RIGHT_MATCH_IDS].includes(id),
        [id]
    );
    const secondRoundNoTopConnector = useMemo(
        () => [SECOND_ROUND_UPPER_LEFT_MATCH_IDS[0], SECOND_ROUND_UPPER_RIGHT_MATCH_IDS[0]].includes(id),
        [id]
    );
    const secondRoundNoBottomConnector = useMemo(
        () => [SECOND_ROUND_BOTTOM_LEFT_MATCH_IDS[3], SECOND_ROUND_BOTTOM_RIGHT_MATCH_IDS[3]].includes(id),
        [id]
    );

    const isSweet16 = useMemo(() => SWEET16_ROUND_MATCH_IDS.includes(id), [id]);
    const isSweet16Left = useMemo(
        () => [...SWEET16_ROUND_UPPER_LEFT_MATCH_IDS, ...SWEET16_ROUND_BOTTOM_LEFT_MATCH_IDS].includes(id),
        [id]
    );
    const sweet16NoTopConnector = useMemo(
        () => [SWEET16_ROUND_UPPER_LEFT_MATCH_IDS[0], SWEET16_ROUND_UPPER_RIGHT_MATCH_IDS[0]].includes(id),
        [id]
    );
    const sweet16NoBottomConnector = useMemo(
        () => [SWEET16_ROUND_BOTTOM_LEFT_MATCH_IDS[1], SWEET16_ROUND_BOTTOM_RIGHT_MATCH_IDS[1]].includes(id),
        [id]
    );

    const isElite8 = useMemo(() => ELITE8_ROUND_MATCH_IDS.includes(id), [id]);
    const isElite8Left = useMemo(
        () => [ELITE8_ROUND_UPPER_LEFT_MATCH_ID, ELITE8_ROUND_BOTTOM_LEFT_MATCH_ID].includes(id),
        [id]
    );
    const isElite8Upper = useMemo(
        () => [ELITE8_ROUND_UPPER_LEFT_MATCH_ID, ELITE8_ROUND_UPPER_RIGHT_MATCH_ID].includes(id),
        [id]
    );

    return (
        <>
            {isSecondRound && (
                <SecondRoundConnector
                    isLeft={isSecondRoundLeft}
                    isUpper={isSecondRoundUpper}
                    noTop={secondRoundNoTopConnector}
                    noBottom={secondRoundNoBottomConnector}
                />
            )}
            {isSweet16 && (
                <Sweet16Connector
                    isLeft={isSweet16Left}
                    noTop={sweet16NoTopConnector}
                    noBottom={sweet16NoBottomConnector}
                />
            )}
            {isElite8 && <Elite8Connector isLeft={isElite8Left} isUpper={isElite8Upper} />}
        </>
    );
};

const SecondRoundConnector = styled.div<{ isLeft: boolean; isUpper: boolean; noTop?: boolean; noBottom?: boolean }>`
    position: absolute;
    border: 3px solid ${(props) => props.theme.marchMadness.borderColor.senary};
    border-radius: 8px;
    ${(props) => (props.isLeft ? 'border-left: none;' : 'border-right: none;')}
    ${(props) => (props.noTop ? 'border-top: none;' : '')}
    ${(props) => (props.noBottom ? 'border-bottom: none;' : '')}
    height: 63px;
    width: 142px;
    top: ${(props) => (props.isUpper ? '16' : '-27')}px;
    ${(props) => (props.isLeft ? 'right: 71px;' : 'left: 71px;')}
    z-index: -1;
`;

const Sweet16Connector = styled.div<{ isLeft: boolean; noTop?: boolean; noBottom?: boolean }>`
    position: absolute;
    border: 3px solid ${(props) => props.theme.marchMadness.borderColor.senary};
    border-radius: 8px;
    ${(props) => (props.isLeft ? 'border-left: none;' : 'border-right: none;')}
    ${(props) => (props.noTop ? 'border-top: none;' : '')}
    ${(props) => (props.noBottom ? 'border-bottom: none;' : '')}
    height: ${(props) => (props.noTop || props.noBottom ? '61' : '123')}px;
    width: 142px;
    top: ${(props) => (props.noTop ? '27' : '-35')}px;
    ${(props) => (props.isLeft ? 'right: 71px;' : 'left: 71px;')}
`;

const Elite8Connector = styled.div<{ isLeft: boolean; isUpper: boolean }>`
    position: absolute;
    border: 3px solid ${(props) => props.theme.marchMadness.borderColor.senary};
    border-radius: 8px;
    ${(props) => (props.isLeft ? 'border-left: none;' : 'border-right: none;')}
    ${(props) => (props.isUpper ? 'border-top: none;' : 'border-bottom: none;')}
    height: 100px;
    width: 142px;
    top: ${(props) => (props.isUpper ? '48' : '-95')}px;
    ${(props) => (props.isLeft ? 'right: 71px;' : 'left: 71px;')}
    z-index: -1;
`;

export default MatchConnector;
