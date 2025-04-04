import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';

export const FieldContainer = styled(FlexDivColumn)<{ margin?: string; width?: string }>`
    flex: initial;
    position: relative;
    margin: ${(props) => props.margin || '0 0 5px 0'};
    width: ${(props) => props.width || '100%'};
`;

export const FieldLabel = styled.label`
    font-weight: normal;
    font-size: 13px;
    line-height: 15px;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 6px;
    text-transform: uppercase;
`;

export const TextAreaInput = styled.textarea<{
    padding?: string;
    fontSize?: string;
    fontWeight?: string;
    textAlign?: string;
    width?: string;
    height?: string;
    borderColor?: string;
}>`
    resize: vertical;
    background: ${(props) => props.theme.input.background.tertiary};
    border: 2px solid ${(props) => props.borderColor || props.theme.input.borderColor.primary};
    box-sizing: border-box;
    mix-blend-mode: normal;
    border-radius: 5px;
    height: ${(props) => props.height || '30px'};
    width: ${(props) => props.width || '100%'};
    padding: ${(props) => (props.padding ? props.padding : '5px 10px')};
    outline: 0;
    font-style: normal;
    font-weight: ${(props) => props.fontWeight || '400'};
    font-size: ${(props) => props.fontSize || '15px'};
    text-align: ${(props) => props.textAlign || 'start'};
    line-height: 18px;
    color: ${(props) => props.theme.input.textColor.tertiary};
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
    &::placeholder {
        color: ${(props) => props.theme.textColor.secondary};
    }
`;

export const Input = styled.input<{
    fontSize?: string;
    fontWeight?: string;
    textAlign?: string;
    width?: string;
    height?: string;
    minHeight?: string;
    borderColor?: string;
    background?: string;
    color?: string;
}>`
    background: ${(props) => props.background || props.theme.input.background.tertiary};
    border: 2px solid ${(props) => props.borderColor || props.theme.input.borderColor.primary};
    box-sizing: border-box;
    mix-blend-mode: normal;
    border-radius: 5px;
    ${(props) => (props.minHeight ? `min-height: ${props.minHeight};` : '')}
    height: ${(props) => props.height || '30px'};
    width: ${(props) => props.width || '100%'};
    padding: 5px 10px;
    outline: 0;
    font-style: normal;
    font-weight: ${(props) => props.fontWeight || '400'};
    font-size: ${(props) => props.fontSize || '15px'};
    text-align: ${(props) => props.textAlign || 'start'};
    line-height: 18px;
    color: ${(props) => props.color || props.theme.input.textColor.tertiary};
    text-overflow: ellipsis;
    overflow: hidden;
    &::selection {
        background: ${(props) => props.theme.input.background.selection.primary};
    }
    &:focus {
        border: 2px solid ${(props) => props.borderColor || props.theme.input.borderColor.focus.primary};
        box-sizing: border-box;
    }
    &:disabled {
        opacity: 0.4;
        cursor: default;
    }
    &.error {
        border: 2px solid ${(props) => props.theme.error.borderColor.primary};
    }
    &::placeholder {
        color: ${(props) => props.theme.textColor.secondary};
    }
`;
