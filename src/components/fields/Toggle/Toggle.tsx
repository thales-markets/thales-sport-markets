import Tooltip from 'components/Tooltip';
import React from 'react';
import styled from 'styled-components';
import { FlexDivStart } from 'styles/common';
import { FieldContainer, FieldLabel, OverlayContainer } from '../common';

type ToggleProps = {
    isLeftOptionSelected: boolean;
    label?: string;
    disabled?: boolean;
    onClick?: any;
    leftText?: string;
    rightText?: string;
    tooltip?: string;
    toggleTooltip?: string;
};

const Toggle: React.FC<ToggleProps> = ({
    isLeftOptionSelected,
    label,
    disabled,
    onClick,
    leftText,
    rightText,
    tooltip,
    toggleTooltip,
}) => {
    const getToggleContent = () => (
        <ToggleContainer
            onClick={() => {
                if (disabled) {
                    return;
                }
                onClick();
            }}
            className={disabled ? 'toogle disabled' : 'toogle'}
        >
            {leftText && <ToggleText>{leftText}</ToggleText>}
            <ToggleIcon isLeftOptionSelected={isLeftOptionSelected} />
            {rightText && <ToggleText>{rightText}</ToggleText>}
        </ToggleContainer>
    );

    return (
        <FieldContainer>
            {label && (
                <FieldLabel>
                    {label}
                    {tooltip && (
                        <Tooltip
                            overlay={<OverlayContainer>{tooltip}</OverlayContainer>}
                            iconFontSize={23}
                            marginLeft={2}
                            top={0}
                        />
                    )}
                </FieldLabel>
            )}
            {!!toggleTooltip ? (
                <Tooltip overlay={<span>{toggleTooltip}</span>} component={getToggleContent()} />
            ) : (
                getToggleContent()
            )}
        </FieldContainer>
    );
};

const ToggleContainer = styled(FlexDivStart)`
    font-style: normal;
    font-weight: bold;
    font-size: 20px;
    line-height: 27px;
    cursor: pointer;
    color: ${(props) => props.theme.textColor.primary};
    &.disabled {
        opacity: 0.4;
        cursor: default;
    }
    width: fit-content;
`;

const ToggleText = styled.span`
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
    :first-child {
        text-align: end;
    }
    white-space: nowrap;
    @media (max-width: 575px) {
        white-space: break-spaces;
    }
`;

const ToggleIcon = styled.i<{ isLeftOptionSelected: boolean }>`
    font-size: 54px;
    margin: 0 6px;
    margin-top: -3px;
    &:before {
        font-family: ExoticIcons !important;
        content: ${(props) => (props.isLeftOptionSelected ? "'\\0048'" : "'\\0049'")};
        color: ${(props) => props.theme.textColor.primary};
    }
`;

export default Toggle;
