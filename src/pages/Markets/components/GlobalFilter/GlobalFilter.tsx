import React from 'react';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivRowCentered } from 'styles/common';

type GlobalFilterProps = {
    disabled?: boolean;
    selected?: boolean;
    count?: number;
    onClick?: (param: any) => void;
};

const GlobalFilter: React.FC<GlobalFilterProps> = ({ disabled, selected, onClick, children, count }) => {
    return (
        <Container className={`${disabled ? 'disabled' : ''} ${selected ? 'selected' : ''}`} onClick={onClick}>
            <Label>{children}</Label>
            {count !== undefined && <Count>{count}</Count>}
        </Container>
    );
};

const Container = styled(FlexDivRowCentered)`
    font-style: normal;
    font-weight: bold;
    font-size: 15px;
    line-height: 102.6%;
    letter-spacing: 0.035em;
    text-transform: uppercase;
    cursor: pointer;
    height: 36px;
    border-bottom: 5px solid transparent;
    &.selected,
    &:hover {
        border-bottom: 5px solid ${(props) => props.theme.borderColor.secondary};
    }
    &.disabled {
        cursor: default;
        opacity: 0.4;
    }
    color: ${(props) => props.theme.textColor.primary};
    margin-right: 30px;
    padding-bottom: 5px;
    margin-bottom: 10px;
`;

const Label = styled.div`
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
`;

const Count = styled(FlexDivCentered)`
    min-width: 26px;
    height: 26px;
    background: ${(props) => props.theme.button.background.secondary};
    color: ${(props) => props.theme.button.textColor.primary};
    border-radius: 15px;
    margin-left: 4px;
    padding-left: 4px;
    padding-right: 4px;
`;

export default GlobalFilter;
