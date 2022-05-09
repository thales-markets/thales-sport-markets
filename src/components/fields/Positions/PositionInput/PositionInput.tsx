import { FieldNote, Input } from 'components/fields/common';
import React from 'react';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivStart } from 'styles/common';

type PositionInputProps = {
    value: string;
    placeholder?: string;
    disabled?: boolean;
    onChange: (event: string) => void;
    onRemove: () => void;
    showRemoveButton: boolean;
    maximumCharacters?: number;
    note?: string;
};

const PositionInput: React.FC<PositionInputProps> = ({
    value,
    placeholder,
    disabled,
    onChange,
    onRemove,
    showRemoveButton,
    maximumCharacters,
    note,
    ...rest
}) => {
    return (
        <Container className={disabled ? 'disabled' : ''}>
            <InputContainer>
                <StyledInput
                    {...rest}
                    value={value}
                    type="text"
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    maxLength={maximumCharacters}
                />
                {note && <FieldNote>{note}</FieldNote>}
            </InputContainer>
            {showRemoveButton && <RemoveIcon onClick={onRemove} />}
        </Container>
    );
};

const Container = styled(FlexDivStart)`
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 5px;
    align-items: center;
    &.disabled {
        i {
            opacity: 0.4;
            cursor: default;
            pointer-events: none;
        }
    }
`;

export const InputContainer = styled(FlexDivColumn)`
    flex: initial;
    position: relative;
`;

const StyledInput = styled(Input)`
    height: 30px;
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 18px;
    line-height: 18px;
`;

const RemoveIcon = styled.i`
    font-size: 18px;
    margin-left: 10px;
    margin-top: -18px;
    cursor: pointer;
    &:before {
        font-family: ExoticIcons !important;
        content: '\\004F';
        color: ${(props) => props.theme.textColor.primary};
    }
`;

export default PositionInput;
