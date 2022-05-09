import React from 'react';
import styled from 'styled-components';
import { FlexDiv, FlexDivRow } from 'styles/common';

type ValidationMessageProps = {
    showValidation: boolean;
    message: string | null;
    onDismiss: () => void;
};

export const ValidationMessage: React.FC<ValidationMessageProps> = ({ showValidation, message, onDismiss }) => {
    return (
        <>
            {showValidation && (
                <Container>
                    <Message>
                        <FlexDiv>{message}</FlexDiv>
                        <CloseIcon onClick={onDismiss} />
                    </Message>
                </Container>
            )}
        </>
    );
};

const Container = styled.div`
    position: relative;
    margin-top: 15px;
`;

const Message = styled(FlexDivRow)`
    font-style: normal;
    font-weight: bold;
    font-size: 14px;
    line-height: 16px;
    letter-spacing: 0.5px;
    color: #e53720;
    background: #e9bcbc;
    box-sizing: border-box;
    border-radius: 6px;
    padding: 5px 10px;
`;

const CloseIcon = styled.i`
    font-size: 10px;
    cursor: pointer;
    margin-bottom: -2px;
    margin-left: 20px;
    &:before {
        font-family: ExoticIcons !important;
        content: '\\004F';
        color: #e53720;
    }
`;

export default ValidationMessage;
