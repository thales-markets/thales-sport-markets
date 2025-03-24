import React from 'react';
import styled from 'styled-components';

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
    width: 14px;
    height: 14px;
    ${(props) => (props.margin ? `margin: ${props.margin};` : '')}
    ${(props) => (!props.isResolved ? 'border-radius: 50%;' : '')}
    ${(props) => (!props.isResolved ? `border: 2px solid ${props.theme.marchMadness.borderColor.quinary};` : '')}
`;

const TeamSelected = styled.div`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${(props) => props.theme.marchMadness.background.quinary};
`;

const Icon = styled.i`
    font-size: 10px;
`;
const Correct = styled(Icon)`
    color: ${(props) => props.theme.marchMadness.status.win};
`;
const Wrong = styled(Icon)`
    color: ${(props) => props.theme.marchMadness.status.wrong};
`;

export default TeamStatus;
