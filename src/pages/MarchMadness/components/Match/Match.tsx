import React, { useMemo } from 'react';
import styled from 'styled-components';
import MatchConnector from '../MatchConnector';

type MatchProps = { id: number; height: number; margin?: string };

const Match: React.FC<MatchProps> = ({ id, height, margin }) => {
    const isBracketsLeftSide = useMemo(
        () => id <= 16 || (id > 32 && id <= 40) || (id > 48 && id <= 52) || [57, 58, 61, 63].includes(id),
        []
    );

    return (
        <Container height={height} margin={margin}>
            <TeamRow>
                {isBracketsLeftSide ? (
                    <>
                        <Logo>L1</Logo>
                        <TeamPosition isLeftSide={true}>
                            <TeamPositionValue>1</TeamPositionValue>
                        </TeamPosition>
                        <TeamName isLeftSide={true}>Purdue</TeamName>
                        <TeamSelector isLeftSide={true} />
                    </>
                ) : (
                    <>
                        <TeamSelector isLeftSide={false} />
                        <TeamName isLeftSide={false}>Purdue</TeamName>
                        <TeamPosition isLeftSide={false}>
                            <TeamPositionValue>1</TeamPositionValue>
                        </TeamPosition>
                        <Logo>L1</Logo>
                    </>
                )}
            </TeamRow>
            <TeamSeparator />
            <TeamRow>
                {isBracketsLeftSide ? (
                    <>
                        <Logo>L2</Logo>
                        <TeamPosition isLeftSide={true}>
                            <TeamPositionValue>16</TeamPositionValue>
                        </TeamPosition>
                        <TeamName isLeftSide={true}>Milwuakee</TeamName>
                        <TeamSelector isLeftSide={true} />
                    </>
                ) : (
                    <>
                        <TeamSelector isLeftSide={false} />
                        <TeamName isLeftSide={false}>Purdue</TeamName>
                        <TeamPosition isLeftSide={false}>
                            <TeamPositionValue>16</TeamPositionValue>
                        </TeamPosition>
                        <Logo>L2</Logo>
                    </>
                )}
            </TeamRow>
            <MatchConnector id={id} />
        </Container>
    );
};

const Container = styled.div<{ height: number; margin?: string }>`
    background: #ffffff;
    position: relative;
    width: 142px;
    height: ${(props) => props.height}px;
    ${(props) => (props.margin ? `margin: ${props.margin};` : '')}
    border: 1px solid #0E94CB;
    border-radius: 4px;
    padding: 1px;
`;

const TeamSeparator = styled.hr`
    width: 122px;
    height: 1px;
    border: none;
    background-color: #0e94cb;
    margin: auto;
`;

const TeamRow = styled.div`
    width: 100%;
    height: 50%;
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 1px;
    z-index: 100;
`;

const Logo = styled.div`
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9aaeb1; // remove this
`;

const TeamPosition = styled.div<{ isLeftSide: boolean }>`
    width: 9px;
    text-align: ${(props) => (props.isLeftSide ? 'right' : 'left')};
    height: 100%;
`;

const TeamPositionValue = styled.span`
    font-family: 'Oswald' !important;
    font-style: normal;
    font-weight: 400;
    font-size: 10px;
    line-height: 14px;
    text-transform: uppercase;
    vertical-align: top;
    color: #9aaeb1;
`;

const TeamName = styled.div<{ isLeftSide: boolean }>`
    width: 90px;
    font-family: 'Oswald' !important;
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 14px;
    text-transform: uppercase;
    color: #021631;
    ${(props) => (props.isLeftSide ? 'margin-left: 2px;' : 'margin-right: 2px;')}
    text-align: ${(props) => (props.isLeftSide ? 'left' : 'right')};
`;

const TeamSelector = styled.div<{ isLeftSide: boolean }>`
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #0e94cb;
    ${(props) => (props.isLeftSide ? 'margin-right: 5px;' : 'margin-left: 5px;')}
`;

export default Match;
