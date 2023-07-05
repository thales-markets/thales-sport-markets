import styled from 'styled-components';
import { FlexDivColumn, FlexDivEnd } from 'styles/common';

export const FieldContainer = styled(FlexDivColumn)<{ margin?: string }>`
    flex: initial;
    position: relative;
    margin: ${(props) => props.margin || '0 0 5px 0'};
    width: 100%;
`;

export const FieldLabel = styled.label`
    font-weight: normal;
    font-size: 13px;
    line-height: 15px;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 6px;
    text-transform: uppercase;
`;

export const Input = styled.input<{ fontSize?: string; width?: string; height?: string }>`
    background: ${(props) => props.theme.input.background.primary};
    border: 2px solid ${(props) => props.theme.input.borderColor.primary};
    box-sizing: border-box;
    mix-blend-mode: normal;
    border-radius: 5px;
    height: ${(props) => props.height || '30px'};
    width: ${(props) => props.width || '100%'};
    padding: 5px 10px;
    outline: 0;
    font-style: normal;
    font-weight: normal;
    font-size: ${(props) => props.fontSize || '15px'};
    line-height: 18px;
    color: ${(props) => props.theme.input.textColor.primary};
    text-overflow: ellipsis;
    overflow: hidden;
    &::selection {
        background: ${(props) => props.theme.input.background.selection.primary};
    }
    &:focus {
        border: 2px solid ${(props) => props.theme.input.borderColor.focus.primary};
        box-sizing: border-box;
    }
    &:disabled {
        opacity: 0.4;
        cursor: default;
    }
    &.error {
        border: 2px solid ${(props) => props.theme.error.borderColor.primary};
    }
`;

export const FieldNote = styled(FlexDivEnd)`
    font-style: normal;
    font-weight: bold;
    font-size: 12px;
    line-height: 16px;
    color: ${(props) => props.theme.textColor.primary};
    margin-top: 4px;
`;

export const OverlayContainer = styled(FlexDivColumn)`
    text-align: justify;
`;
