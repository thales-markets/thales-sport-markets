import React from 'react';
import styled from 'styled-components';
import { FlexDivRowCentered } from 'styles/common';

type ViewSwitchProps = {
    type: string;
    selected?: boolean;
    onClick?: (param: any) => void;
};

const ViewSwitch: React.FC<ViewSwitchProps> = ({ selected, onClick, children, type }) => {
    return (
        <Container className={`${selected ? 'selected' : ''}`} onClick={onClick}>
            <Icon className={`icon icon--${type}`} />
            <Label>{children}</Label>
        </Container>
    );
};

const Container = styled(FlexDivRowCentered)`
    @media (max-width: 950px) {
        display: none;
    }

    font-style: normal;
    font-weight: bold;
    font-size: 15px;
    line-height: 18px;
    cursor: pointer;
    height: 36px;
    &:hover {
        color: ${(props) => props.theme.textColor.primary};
    }
    &.disabled {
        cursor: default;
        opacity: 0.4;
    }
    color: ${(props) => props.theme.textColor.secondary};
    &.selected {
        color: ${(props) => props.theme.textColor.quaternary};
    }
    margin-right: 20px;
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
    white-space: nowrap;
`;

const Icon = styled.i`
    font-size: 26px;
    margin-left: 4px;
    margin-right: 7px;
`;

export default ViewSwitch;
