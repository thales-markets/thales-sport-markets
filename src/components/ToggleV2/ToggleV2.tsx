import React from 'react';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';

type LabelProps = {
    firstLabel?: string;
    secondLabel?: string;
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
};

type ToggleProps = {
    active: boolean;
    disabled?: boolean;
    handleClick?: () => void;
    width?: string;
    height?: string;
    borderWidth?: string;
    borderColor?: string;
    background?: string;
    backgroundGradient?: boolean;
    selectionSize?: string;
    selectionBackground?: string;
    selectionBorder?: string;
    selectionGradient?: boolean;
    selectionMargin?: string;
    label?: LabelProps;
    shadow?: boolean;
    margin?: string;
};

type ToggleContainerProps = {
    active: boolean;
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

type SelectionProps = {
    active: boolean;
    size?: string;
    background?: string;
    backgroundGradient?: boolean;
    selectionBorder?: string;
    selectionMargin?: string;
};

const defaultToggleHeight = 34;

const Toggle: React.FC<ToggleProps> = ({
    active,
    disabled,
    handleClick,
    width,
    height,
    borderWidth,
    borderColor,
    background,
    backgroundGradient,
    selectionSize,
    selectionBackground,
    selectionBorder,
    selectionGradient,
    selectionMargin,
    label,
    shadow,
    margin,
}) => {
    return (
        <Wrapper margin={margin} disabled={disabled}>
            <ToggleContainer
                active={active}
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
                {active && label?.firstLabel && (
                    <LabelWrapper>
                        <FirstLabel
                            fontSize={label?.fontSize}
                            fontWeight={label?.fontWeight}
                            lineHeight={label?.lineHeight}
                        >
                            {label.firstLabel}
                        </FirstLabel>
                    </LabelWrapper>
                )}
                <Selection
                    active={active}
                    size={selectionSize}
                    background={selectionBackground}
                    backgroundGradient={selectionGradient}
                    selectionBorder={selectionBorder}
                    selectionMargin={selectionMargin}
                >
                    {label && (
                        <Label fontSize={label?.fontSize} fontWeight={label?.fontWeight} lineHeight={label?.lineHeight}>
                            {active ? label.secondLabel : label.firstLabel}
                        </Label>
                    )}
                </Selection>
                {!active && label?.secondLabel && (
                    <LabelWrapper>
                        <SecondLabel
                            fontSize={label?.fontSize}
                            fontWeight={label?.fontWeight}
                            lineHeight={label?.lineHeight}
                        >
                            {label.secondLabel}
                        </SecondLabel>
                    </LabelWrapper>
                )}
            </ToggleContainer>
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
    cursor: default;
`;

const ToggleContainer = styled.div<ToggleContainerProps>`
    display: flex;
    align-items: center;
    justify-content: ${(props) => (props.active ? 'start' : 'end')};
    position: relative;
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
    border-width: ${(props: any) => (props.borderWidth ? props.borderWidth : '1px')};
    border-style: solid;
    border-color: ${(props: any) => (props.borderColor ? props.borderColor : props.theme.borderColor.primary)};
    border-radius: 30px;
    ${(props: any) => (props.background ? `background-color: ${props.background};` : '')}
    width: ${(props: any) => (props.width ? props.width : `${defaultToggleHeight * 3.7}px`)};
    height: ${(props: any) => (props.height ? props.height : `${defaultToggleHeight}px`)};
    ${(props) => (props.shadow ? `box-shadow: ${props.theme.shadow.toggle};` : '')}
`;

const Selection = styled(FlexDivCentered)<SelectionProps>`
    width: ${(props: any) => (props.size ? props.size : `48%`)};
    height: ${(props: any) => (props.size ? props.size : `${defaultToggleHeight - 6}px`)};
    border-radius: 30px;
    position: absolute;
    ${(props: any) =>
        props.background
            ? `background-color: ${props.background}`
            : `background-color: ${props.theme.background.quaternary}`};
    border: ${(props: any) => (props.selectionBorder ? props.selectionBorder : '')};
    ${(props: any) =>
        props.active
            ? `right: ${props.selectionMargin ? props.selectionMargin : '2px'};`
            : `left: ${props.selectionMargin ? props.selectionMargin : '2px'};`};
`;

const Label = styled.span<{ fontSize?: string; fontWeight?: string; lineHeight?: string }>`
    font-size: ${(props) => (props.fontSize ? props.fontSize : '13px')};
    font-weight: ${(props) => (props.fontWeight ? props.fontWeight : '700')};
    line-height: ${(props) => (props.lineHeight ? props.lineHeight : '100%')};
    color: ${(props) => props.theme.toggle.label.primary};
    text-transform: uppercase;
`;

const LabelWrapper = styled(FlexDivCentered)`
    width: 50%;
`;

const FirstLabel = styled(Label)`
    color: ${(props) => props.theme.toggle.label.secondary};
    font-weight: ${(props) => (props.fontWeight ? `${Number(props.fontWeight) - 100}` : '600')};
`;
const SecondLabel = styled(Label)`
    color: ${(props) => props.theme.toggle.label.secondary};
    font-weight: ${(props) => (props.fontWeight ? `${Number(props.fontWeight) - 100}` : '600')};
`;

export default Toggle;
