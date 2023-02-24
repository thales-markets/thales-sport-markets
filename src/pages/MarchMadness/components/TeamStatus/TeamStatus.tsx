import styled from 'styled-components';
import React from 'react';

type TeamStatusProps = {
    isSelected: boolean;
    isWon: boolean | undefined;
    margin: string;
};

const TeamStatus: React.FC<TeamStatusProps> = ({ isSelected, isWon, margin }) => {
    const isResolved = isSelected && isWon !== undefined;
    return (
        <Container isResolved={isResolved} isSelected={isSelected} margin={margin}>
            {isResolved ? (
                isWon ? (
                    <Correct className={`icon icon--correct-full`} />
                ) : (
                    <Wrong className={`icon icon--wrong-full`} />
                )
            ) : (
                isSelected && <TeamSelected />
            )}
        </Container>
    );
};

const Container = styled.div<{ isResolved: boolean; isSelected: boolean; margin: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 10px;
    height: 10px;
    ${(props) => (props.margin ? `margin: ${props.margin};` : '')}
    ${(props) => (!props.isResolved ? 'border-radius: 50%;' : '')}
    ${(props) => (!props.isResolved ? `border: 1px solid ${props.isSelected ? '#0e94cb' : '#9aaeb1'};` : '')}
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
