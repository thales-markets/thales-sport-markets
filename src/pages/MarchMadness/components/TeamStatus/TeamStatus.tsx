import styled from 'styled-components';
import React from 'react';

type TeamStatusProps = {
    isSelected: boolean;
    isResolved: boolean;
    margin: string;
};

const TeamStatus: React.FC<TeamStatusProps> = ({ isSelected, isResolved, margin }) => {
    return (
        <>
            {isResolved ? (
                <></>
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

export default TeamStatus;
