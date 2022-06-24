import React from 'react';
import styled from 'styled-components';
import { FlexDivRowCentered } from 'styles/common';

type SportFilterProps = {
    disabled?: boolean;
    selected?: boolean;
    count?: number;
    sport: string;
    onClick?: (param: any) => void;
};

const SportFilter: React.FC<SportFilterProps> = ({ disabled, selected, sport, onClick, children }) => {
    return (
        <Container className={`${disabled ? 'disabled' : ''} ${selected ? 'selected' : ''}`} onClick={onClick}>
            <SportIcon className={`icon icon--${sport.toLowerCase()}`} />
            <Label>{children}</Label>
        </Container>
    );
};

const Container = styled(FlexDivRowCentered)`
    font-style: normal;
    font-weight: 600;
    font-size: 15px;
    line-height: 102.6%;
    letter-spacing: 0.035em;
    text-transform: uppercase;
    cursor: pointer;
    height: 36px;
    margin-left: 20px;
    &.selected,
    &:hover {
        color: ${(props) => props.theme.textColor.quaternary};
    }
    &.disabled {
        cursor: default;
        opacity: 0.4;
    }
    color: ${(props) => props.theme.textColor.secondary};
    margin-right: 30px;
    padding-bottom: 5px;
    margin-bottom: 10px;
    justify-content: flex-start;
`;

const Label = styled.div`
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
`;

const SportIcon = styled.i`
    font-size: 35px;
    margin-right: 15px;
`;

export default SportFilter;
