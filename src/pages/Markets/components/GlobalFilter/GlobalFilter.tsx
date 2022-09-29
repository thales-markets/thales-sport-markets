import Tooltip from 'components/Tooltip';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivRowCentered } from 'styles/common';

type GlobalFilterProps = {
    disabled?: boolean;
    selected?: boolean;
    count?: number | undefined;
    onClick?: (param: any) => void;
};

const GlobalFilter: React.FC<GlobalFilterProps> = ({ disabled, selected, onClick, children, count }) => {
    const { t } = useTranslation();
    return (
        <Container className={`${disabled ? 'disabled' : ''} ${selected ? 'selected' : ''}`} onClick={onClick}>
            {count !== undefined && <Count>{count}</Count>}
            {children == 'Your transactions' && <Icon className={`icon icon--history`} />}
            <Label>{children}</Label>
            {children == 'Archived markets' && (
                <Tooltip overlay={t(`market.filter-label.global.tooltip`)} iconFontSize={18} marginLeft={2} top={0} />
            )}
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
    white-space: nowrap;
`;

const Count = styled(FlexDivCentered)`
    min-width: 26px;
    height: 26px;
    background: ${(props) => props.theme.background.quaternary};
    color: ${(props) => props.theme.textColor.primary};
    border-radius: 15px;
    margin-left: 4px;
    margin-right: 7px;
    padding-left: 5px;
    padding-top: 3px;
    padding-right: 4px;
`;

const Icon = styled.i`
    font-size: 26px;
    margin-left: 4px;
    margin-right: 7px;
`;

export default GlobalFilter;
