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
    isWarning?: boolean;
    open?: boolean;
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
    isWarning,
    open,
}) => {
    const theme: ThemeInterface = useTheme();

    return open === false || !overlay ? (
        <>{children}</>
    ) : isValidation || isWarning ? (
        <ReactTooltip
            visible
            overlay={overlay}
            placement="top"
            overlayClassName={overlayClassName}
            overlayInnerStyle={{ ...overlayInnerStyle, ...getValidationStyle(theme, !!isWarning) }}
            arrowContent={<ValidationArrow isWarning={!!isWarning} />}
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

const getValidationStyle = (theme: ThemeInterface, isWarning: boolean): React.CSSProperties => ({
    minWidth: '100%',
    maxWidth: '300px',
    padding: '4px 8px',
    backgroundColor: theme.error.background.primary,
    color: isWarning ? theme.warning.textColor.primary : theme.error.textColor.primary,
    border: `1.5px solid ${isWarning ? theme.warning.borderColor.primary : theme.error.borderColor.primary}`,
    borderRadius: '2px',
    fontSize: isWarning ? '9px' : '10px',
    fontWeight: 600,
    lineHeight: isWarning ? '12px' : '14px',
    textTransform: 'uppercase',
});

const ValidationArrow = styled.div<{ isWarning: boolean }>`
    &:before {
        content: '';
        display: block;
        width: 100%;
        height: 100%;
        margin: auto;
        transform-origin: 100% 0;
        transform: rotate(45deg);
        border: 1.5px solid
            ${(props) =>
                props.isWarning ? props.theme.warning.borderColor.primary : props.theme.error.borderColor.primary};
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
