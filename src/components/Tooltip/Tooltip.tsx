import ReactTooltip from 'rc-tooltip';
import React, { CSSProperties } from 'react';
import styled from 'styled-components';
import 'styles/tooltip.css';

type TooltipProps = {
    overlay: any;
    iconFontSize?: number;
    customIconStyling?: CSSProperties;
    overlayInnerStyle?: CSSProperties;
    marginLeft?: number;
    top?: number;
    overlayClassName?: string;
    iconColor?: string;
    children?: React.ReactNode;
};

const Tooltip: React.FC<TooltipProps> = ({
    overlay,
    iconFontSize,
    customIconStyling,
    overlayInnerStyle,
    marginLeft,
    top,
    overlayClassName,
    iconColor,
    children,
}) => {
    return (
        <ReactTooltip
            overlay={overlay}
            placement="top"
            overlayClassName={overlayClassName || ''}
            overlayInnerStyle={overlayInnerStyle}
        >
            {children ? (
                (children as any)
            ) : (
                <InfoIcon
                    color={iconColor}
                    iconFontSize={iconFontSize}
                    marginLeft={marginLeft}
                    top={top}
                    style={customIconStyling}
                />
            )}
        </ReactTooltip>
    );
};

const InfoIcon = styled.i<{ iconFontSize?: number; marginLeft?: number; top?: number; color?: string }>`
    font-size: ${(props) => props.iconFontSize || 18}px;
    font-weight: 400;
    cursor: pointer;
    position: relative;
    margin-left: ${(props) => props.marginLeft || 0}px;
    top: ${(props) => (props.top !== undefined ? props.top : -1)}px;
    color: ${(props) => props.color || 'white'};
    text-transform: none;
    &:before {
        font-family: OvertimeIconsV2 !important;
        content: '\\011B';
    }
`;

export default Tooltip;
