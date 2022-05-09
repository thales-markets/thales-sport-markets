import React from 'react';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';

type FieldValidationMessageProps = {
    showValidation?: boolean;
    message?: string;
    arrowPosition?: string;
    marginLeft?: string;
    hideArrow?: boolean;
};

export const FieldValidationMessage: React.FC<FieldValidationMessageProps> = ({
    showValidation,
    message,
    marginLeft,
    hideArrow,
    arrowPosition = 'left',
}) => {
    return (
        <>
            {showValidation && (
                <Container marginLeft={marginLeft}>
                    <Message arrowPosition={arrowPosition} hideArrow={hideArrow}>
                        {message}
                    </Message>
                </Container>
            )}
        </>
    );
};

const Container = styled.div<{ marginLeft?: string }>`
    position: relative;
    margin-left: ${(props) => props.marginLeft || '0px'};
`;

const Message = styled(FlexDiv)<{ arrowPosition: string; hideArrow?: boolean }>`
    align-items: center;
    background: #e9bcbc;
    border-radius: 5px;
    font-style: normal;
    font-weight: bold;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.25px;
    color: #e53720;
    margin: 6px 2px 0 2px;
    padding: 4px 8px;
    :before {
        display: ${(props) => (props.hideArrow ? 'none' : 'block')};
        content: '';
        position: absolute;
        top: -7px;
        left: ${(props) => (props.arrowPosition === 'left' ? '15%' : '85%')};
        border-width: 7px;
        border-style: solid;
        border-color: transparent transparent #e9bcbc transparent;
    }
`;

export default FieldValidationMessage;
