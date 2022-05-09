import React from 'react';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';

type WarningMessageProps = {
    marginBottom?: number;
    fontSize?: number;
};

export const WarningMessage: React.FC<WarningMessageProps> = ({ children, marginBottom, fontSize }) => {
    return (
        <Container marginBottom={marginBottom} fontSize={fontSize}>
            {children}
        </Container>
    );
};

const Container = styled(FlexDivCentered)<{ marginBottom?: number; fontSize?: number }>`
    font-style: normal;
    font-weight: bold;
    margin-bottom: ${(props) => props.fontSize || 15}px;
    line-height: 100%;
    letter-spacing: 0.5px;
    color: #ffcc00;
    margin-top: 15px;
    margin-bottom: ${(props) => props.marginBottom || 0}px;
`;

export default WarningMessage;
