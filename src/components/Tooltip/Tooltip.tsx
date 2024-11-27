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
            overlay={overlay}
            overlayInnerStyle={{ padding: 0 }}
            placement="top"
            overlayStyle={{ borderRadius: '5px' }}
        >
            {children ? (children as any) : <InfoIcon style={customIconStyling} />}
        </ReactTooltip>
    );
};

const InfoIcon = styled.i`
    position: relative;
    font-size: 16px;
    line-height: 100%;
    vertical-align: middle;
    cursor: pointer;
    text-transform: none !important;
    margin-left: 4px;
    color: ${(props) => props.theme.icon.background.secondary};
    &:before {
        font-family: OvertimeIconsV2 !important;
        content: '\\011B';
    }
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 15px;
    }
`;

export default Tooltip;
