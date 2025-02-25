import React from 'react';
import styled from 'styled-components';

type LabelProps = {
    firstLabel?: string;
    secondLabel?: string;
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
};

type SwitchProps = {
    active: boolean;
    disabled?: boolean;
    handleClick?: () => void;
    width?: string;
    height?: string;
    borderWidth?: string;
    borderColor?: string;
    background?: string;
    backgroundGradient?: boolean;
    dotSize?: string;
    dotBackground?: string;
    dotBorder?: string;
    dotGradient?: boolean;
    dotMargin?: string;
    label?: LabelProps;
    shadow?: boolean;
    margin?: string;
};

type SwitchContainerProps = {
    disabled?: boolean;
    handleClick?: () => void;
    borderWidth?: string;
    borderColor?: string;
    width?: string;
    height?: string;
    background?: string;
    backgroundGradient?: boolean;
    shadow?: boolean;
};

type CircleProps = {
    active: boolean;
    size?: string;
    background?: string;
    backgroundGradient?: boolean;
    dotBorder?: string;
    dotMargin?: string;
};

const defaultSwitchHeight = 28;

const Toggle: React.FC<SwitchProps> = ({
    active,
    disabled,
    handleClick,
    width,
    height,
    borderWidth,
    borderColor,
    background,
    backgroundGradient,
    dotSize,
    dotBackground,
    dotBorder,
    dotGradient,
    dotMargin,
    label,
    shadow,
    margin,
}) => {
    return (
        <Wrapper margin={margin} disabled={disabled}>
            {label?.firstLabel && (
                <Label fontSize={label?.fontSize} fontWeight={label?.fontWeight} lineHeight={label?.lineHeight}>
                    {label.firstLabel}
                </Label>
            )}
            <SwitchContainer
                disabled={disabled}
                borderWidth={borderWidth}
                borderColor={borderColor}
                width={width}
                height={height}
                background={background}
                backgroundGradient={backgroundGradient}
                shadow={shadow}
                onClick={() => (!disabled && handleClick ? handleClick() : null)}
            >
                <Circle
                    active={active}
                    size={dotSize}
                    background={dotBackground}
                    backgroundGradient={dotGradient}
                    dotBorder={dotBorder}
                    dotMargin={dotMargin}
                />
            </SwitchContainer>
            {label?.secondLabel && (
                <Label fontSize={label?.fontSize} fontWeight={label?.fontWeight} lineHeight={label?.lineHeight}>
                    {label.secondLabel}
                </Label>
            )}
        </Wrapper>
    );
};

const Wrapper = styled.div<{ margin?: string; disabled?: boolean }>`
    ${(props) => (props.margin ? `margin: ${props.margin}` : '')};
    opacity: ${(props: any) => (props.disabled ? '0.4' : '1')};
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 100%;
    cursor: default;
`;

const Label = styled.span<{ fontSize?: string; fontWeight?: string; lineHeight?: string }>`
    font-size: ${(props) => (props.fontSize ? props.fontSize : '12px')};
    ${(props) => (props.fontWeight ? `font-weight: ${props.fontWeight};` : '')}
    ${(props) => (props.lineHeight ? `line-height: ${props.lineHeight};` : '')}
    color: white;
    margin-left: 5px;
    margin-right: 5px;
`;

const SwitchContainer = styled.div<SwitchContainerProps>`
    display: flex;
    align-items: center;
    position: relative;
    cursor: ${(props: any) => (props.disabled ? 'default' : 'pointer')};
    border-width: ${(props: any) => (props.borderWidth ? props.borderWidth : '2px')};
    border-style: solid;
    border-color: ${(props: any) => (props.borderColor ? props.borderColor : props.theme.borderColor.primary)};
    border-radius: 30px;
    ${(props: any) => (props.background ? `background-color: ${props.background};` : '')}
    width: ${(props: any) => (props.width ? props.width : defaultSwitchHeight * 2.18 + 'px')};
    height: ${(props: any) => (props.height ? props.height : defaultSwitchHeight + 'px')};
    ${(props) => (props.shadow ? `box-shadow: ${props.theme.shadow.toggle};` : '')}
`;

const Circle = styled.div<CircleProps>`
    width: ${(props: any) => (props.size ? props.size : '15px')};
    height: ${(props: any) => (props.size ? props.size : '15px')};
    border-radius: 60%;
    position: absolute;
    ${(props: any) =>
        props.background
            ? `background-color: ${props.background}`
            : `background-color: ${props.theme.background.tertiary}`};
    border: ${(props: any) => (props.dotBorder ? props.dotBorder : '')};
    ${(props: any) =>
        props.active
            ? `right: ${props.dotMargin ? props.dotMargin : '5px'};`
            : `left: ${props.dotMargin ? props.dotMargin : '5px'};`};
`;

export default Toggle;
