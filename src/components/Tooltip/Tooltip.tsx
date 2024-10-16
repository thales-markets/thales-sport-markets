import { ScreenSizeBreakpoint } from 'enums/ui';
import ReactTooltip from 'rc-tooltip';
import React, { CSSProperties } from 'react';
import styled from 'styled-components';
import 'styles/tooltip.css';

type TooltipProps = {
    overlay: any;
    children?: React.ReactNode;
    customIconStyling?: CSSProperties;
};

const Tooltip: React.FC<TooltipProps> = ({ overlay, children, customIconStyling }) => {
    return (
        <ReactTooltip
            overlay={
                <Container>
                    <Content>{overlay}</Content>
                </Container>
            }
            placement="top"
        >
            {children ? (children as any) : <InfoIcon style={customIconStyling} />}
        </ReactTooltip>
    );
};

const Container = styled.div`
    background: ${(props) => props.theme.borderColor.secondary};
    border-width: 1px;
    border-radius: 2px;
    padding: 1px;
`;

const Content = styled.div`
    background: ${(props) => props.theme.background.primary};
    border-radius: 2px;
    color: ${(props) => props.theme.textColor.secondary};
    font-weight: 700;
    padding: 10px;
`;

const InfoIcon = styled.i`
    position: relative;
    font-size: 16px;
    line-height: 100%;
    vertical-align: middle;
    font-weight: normal;
    cursor: pointer;
    margin-top: 1px;
    margin-left: 4px;
    color: ${(props) => props.theme.icon.background.secondary};
    &:before {
        font-family: Icons !important;
        content: '\\0046';
    }
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 15px;
    }
`;

export default Tooltip;
