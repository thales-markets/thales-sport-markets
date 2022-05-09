import styled from 'styled-components';
import { FlexDivColumn, FlexDivEnd } from 'styles/common';

export const FieldContainer = styled(FlexDivColumn)`
    flex: initial;
    position: relative;
    margin-bottom: 15px;
`;

export const FieldLabel = styled.label`
    font-style: normal;
    font-weight: bold;
    font-size: 25px;
    line-height: 32px;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 6px;
    display: flex;
`;

export const CurrencyLabel = styled.label`
    font-style: normal;
    font-weight: normal;
    font-size: 18px;
    line-height: 25px;
    color: ${(props) => props.theme.input.textColor.primary};
    padding: 57px 20px 20px 0;
    pointer-events: none;
    position: absolute;
    right: 0;
    &.disabled {
        opacity: 0.4;
        cursor: default;
    }
`;

export const Input = styled.input`
    background: ${(props) => props.theme.input.background.primary};
    border: 2px solid ${(props) => props.theme.input.borderColor.primary};
    box-sizing: border-box;
    mix-blend-mode: normal;
    border-radius: 12px;
    height: 60px;
    padding: 20px 20px 20px 20px;
    outline: 0;
    font-style: normal;
    font-weight: normal;
    font-size: 18px;
    line-height: 25px;
    color: ${(props) => props.theme.input.textColor.primary};
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
        border: 2px solid #e53720;
    }
`;

export const TextArea = styled.textarea`
    background: ${(props) => props.theme.input.background.primary};
    border: 2px solid ${(props) => props.theme.input.borderColor.primary};
    box-sizing: border-box;
    mix-blend-mode: normal;
    border-radius: 12px;
    height: 120px;
    padding: 20px 20px 20px 20px;
    outline: 0;
    font-style: normal;
    font-weight: normal;
    font-size: 18px;
    line-height: 25px;
    color: ${(props) => props.theme.input.textColor.primary};
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
        border: 2px solid #e53720;
    }
    resize: none;
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
