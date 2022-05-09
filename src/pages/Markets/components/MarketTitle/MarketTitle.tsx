import React from 'react';
import styled from 'styled-components';

type MarketTitleProps = {
    fontSize?: number;
    marginBottom?: number;
};

const MarketTitle: React.FC<MarketTitleProps> = ({ fontSize, marginBottom, children }) => {
    return (
        <Title fontSize={fontSize} marginBottom={marginBottom}>
            {children}
        </Title>
    );
};

const Title = styled.span<{ fontSize?: number; marginBottom?: number }>`
    font-style: normal;
    font-weight: bold;
    font-size: ${(props) => props.fontSize || 25}px;
    line-height: 100%;
    text-align: center;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: ${(props) => props.marginBottom || 35}px;
`;

export default MarketTitle;
