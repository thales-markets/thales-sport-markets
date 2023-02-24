import styled from 'styled-components';
import React from 'react';

type TeamStatusProps = {
    isSelected: boolean;
    isWon: boolean | undefined;
    margin: string;
};

const TeamStatus: React.FC<TeamStatusProps> = ({ isSelected, isWon, margin }) => {
    return (
        <>
            {isSelected && isWon !== undefined ? (
                isWon ? (
                    <Correct className={`icon icon--correct`} />
                ) : (
                    <Wrong className={`icon icon--wrong`} />
                )
            ) : (
                <TeamSelector isSelected={isSelected} margin={margin}>
                    {isSelected && <TeamSelected />}
                </TeamSelector>
            )}
        </>
    );
};

const TeamSelector = styled.div<{ isSelected: boolean; margin: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid ${(props) => (props.isSelected ? '#0e94cb' : '#9aaeb1')};
    ${(props) => (props.margin ? `margin: ${props.margin};` : '')}
`;

const TeamSelected = styled.div`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #0e94cb;
`;

const Icon = styled.i`
    font-size: 10px;
`;
const Correct = styled(Icon)`
    color: #00957e;
`;
const Wrong = styled(Icon)`
    color: #ca4c53;
`;

export default TeamStatus;
