import React, { useMemo } from 'react';
import styled from 'styled-components';

type MatchConnectorProps = { id: number };

const MatchConnector: React.FC<MatchConnectorProps> = ({ id }) => {
    const isSecondRound = useMemo(() => id > 31 && id <= 47, [id]);
    const isSecondRoundLeft = useMemo(() => id > 31 && id <= 39, [id]);
    const isSecondRoundUpper = useMemo(() => (id > 31 && id <= 35) || (id > 39 && id <= 43), [id]);
    const secondRoundNoTopConnector = useMemo(() => [32, 40].includes(id), [id]);
    const secondRoundNoBottomConnector = useMemo(() => [39, 47].includes(id), [id]);

    const isSweet16 = useMemo(() => id > 47 && id <= 55, [id]);
    const isSweet16Left = useMemo(() => id > 47 && id <= 51, [id]);
    const sweet16NoTopConnector = useMemo(() => [48, 52].includes(id), [id]);
    const sweet16NoBottomConnector = useMemo(() => [51, 55].includes(id), [id]);

    const isElite8 = useMemo(() => id > 55 && id <= 59, [id]);
    const isElite8Left = useMemo(() => [56, 57].includes(id), [id]);
    const isElite8Upper = useMemo(() => [56, 58].includes(id), [id]);

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
    border: 3px solid #0e94cb;
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
    border: 3px solid #0e94cb;
    ${(props) => (props.isLeft ? 'border-left: none;' : 'border-right: none;')}
    ${(props) => (props.noTop ? 'border-top: none;' : '')}
    ${(props) => (props.noBottom ? 'border-bottom: none;' : '')}
    height: ${(props) => (props.noTop || props.noBottom ? '61' : '123')}px;
    width: 142px;
    top: ${(props) => (props.noTop ? '27' : '-35')}px;
    ${(props) => (props.isLeft ? 'right: 71px;' : 'left: 71px;')}
    z-index: -1;
`;

const Elite8Connector = styled.div<{ isLeft: boolean; isUpper: boolean }>`
    position: absolute;
    border: 3px solid #0e94cb;
    ${(props) => (props.isLeft ? 'border-left: none;' : 'border-right: none;')}
    ${(props) => (props.isUpper ? 'border-top: none;' : 'border-bottom: none;')}
    height: 100px;
    width: 142px;
    top: ${(props) => (props.isUpper ? '48' : '-95')}px;
    ${(props) => (props.isLeft ? 'right: 71px;' : 'left: 71px;')}
    z-index: -1;
`;

export default MatchConnector;
