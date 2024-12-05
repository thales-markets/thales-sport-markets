import ReactTooltip from 'rc-tooltip';
import React, { CSSProperties } from 'react';
import styled, { useTheme } from 'styled-components';
import 'styles/tooltip.css';
import { ThemeInterface } from 'types/ui';

type TooltipProps = {
    overlay: any;
    iconFontSize?: number;
    customIconStyling?: CSSProperties;
    overlayInnerStyle?: CSSProperties;
    marginLeft?: number;
    top?: number;
    overlayClassName?: string;
    iconColor?: string;
    children?: React.ReactElement;
    isValidation?: boolean;
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
    isValidation,
}) => {
    const theme: ThemeInterface = useTheme();

    return isValidation ? (
        <ReactTooltip
            visible
            overlay={overlay}
            placement="top"
            overlayClassName={overlayClassName}
            overlayInnerStyle={{ ...overlayInnerStyle, ...getValidationStyle(theme) }}
            arrowContent={<ValidationArrow />}
        >
            {children}
        </ReactTooltip>
    ) : (
        <ReactTooltip
            overlay={overlay}
            placement="top"
            overlayClassName={overlayClassName}
            overlayInnerStyle={overlayInnerStyle}
        >
            {children ? (
                children
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

const getValidationStyle = (theme: ThemeInterface) => ({
    minWidth: '100%',
    maxWidth: '300px',
    padding: '4px 8px',
    backgroundColor: theme.error.background.primary,
    color: theme.error.textColor.primary,
    border: `1.5px solid ${theme.error.borderColor.primary}`,
    borderRadius: '2px',
    fontSize: '10px',
    fontWeight: 600,
    lineHeight: '14px',
    'text-transform': 'uppercase',
});

const ValidationArrow = styled.div`
    &:before {
        content: '';
        display: block;
        width: 100%;
        height: 100%;
        margin: auto;
        transform-origin: 100% 0;
        transform: rotate(45deg);
        border: 1.5px solid ${(props) => props.theme.error.borderColor.primary};
        background-color: ${(props) => props.theme.error.background.primary};
        box-sizing: border-box;
    }
    position: absolute;
    overflow: hidden;
    width: 13px;
    height: 10px;
    bottom: -4px;
    top: auto;
    right: -7px;
`;

export default Tooltip;
