import { ScreenSizeBreakpoint } from 'enums/ui';
import ReactTooltip from 'rc-tooltip';
import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import 'styles/tooltip.css';
import { ThemeInterface } from 'types/ui';

type TooltipProps = {
    overlay: any;
    placement?: string;
    mouseEnterDelay?: number;
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
    showArrow?: boolean;
};

const Tooltip: React.FC<TooltipProps> = ({
    overlay,
    placement,
    mouseEnterDelay,
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
    showArrow,
}) => {
    const theme: ThemeInterface = useTheme();

    const validationChildRef = useRef<HTMLDivElement>(null);
    const isValidationOrWarn = isValidation || isWarning;
    const validationChildRefPositionTop = isValidationOrWarn
        ? validationChildRef?.current?.getBoundingClientRect().top
        : 0;

    const [validationPositionTop, setValidationPositionTop] = useState(validationChildRefPositionTop);

    useEffect(() => {
        if (isValidationOrWarn && validationChildRefPositionTop !== validationPositionTop) {
            setValidationPositionTop(validationChildRefPositionTop);
        }
    }, [validationPositionTop, validationChildRefPositionTop, isValidationOrWarn]);

    return open === false || !overlay ? (
        <>{children}</>
    ) : isValidationOrWarn ? (
        <ReactTooltip
            visible={
                validationChildRefPositionTop !== undefined && validationChildRefPositionTop === validationPositionTop
            }
            overlay={overlay}
            placement={placement || 'top'}
            overlayClassName={`${overlayClassName || ''} override-validation-arrow`}
            overlayInnerStyle={{ ...overlayInnerStyle, ...getValidationStyle(theme, !!isWarning) }}
            showArrow={showArrow}
            arrowContent={<ValidationArrow isWarning={!!isWarning} placement={placement || 'top'} />}
            align={placement === 'bottom' ? { offset: [-2, -2] } : undefined}
        >
            <div ref={validationChildRef}>{children}</div>
        </ReactTooltip>
    ) : (
        <ReactTooltip
            overlay={overlay}
            placement={placement || 'top'}
            overlayClassName={overlayClassName}
            overlayInnerStyle={overlayInnerStyle}
            showArrow={showArrow}
            mouseEnterDelay={mouseEnterDelay}
            mouseLeaveDelay={0}
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

const ValidationArrow = styled.div<{ isWarning: boolean; placement: string }>`
    &:before {
        content: '';
        display: block;
        width: 100%;
        height: 100%;
        margin: auto;
        transform-origin: 100% ${(props) => (props.placement === 'bottom' ? '100%' : '0%')};
        transform: rotate(${(props) => (props.placement === 'bottom' ? '-45deg' : '45deg')});
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
    bottom: ${(props) => (props.placement === 'bottom' ? '-6' : '-4')}px;
    top: auto;
    right: -7px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        bottom: -6px;
    }
`;

export default Tooltip;
