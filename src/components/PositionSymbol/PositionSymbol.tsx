import React, { CSSProperties } from 'react';
import styled from 'styled-components';

type SymbolProps = {
    type?: number;
    symbolColor?: string;
    additionalText?: {
        firstText?: string;
        secondText?: string;
        firstTextStyle?: CSSProperties;
        secondTextStyle?: CSSProperties;
    };
    additionalStyle?: CSSProperties;
    children?: any;
};

const PositionSymbol: React.FC<SymbolProps> = ({ type, symbolColor, additionalText, additionalStyle, children }) => {
    return (
        <Wrapper>
            <Container style={additionalStyle}>
                <Symbol color={symbolColor}>
                    {type == 0 && '1'}
                    {type == 1 && '2'}
                    {type == 2 && 'X'}
                    {type == undefined && children}
                </Symbol>
            </Container>
            <AdditionalText style={additionalText?.firstTextStyle}>{additionalText?.firstText}</AdditionalText>
            <AdditionalText style={additionalText?.secondTextStyle}>{additionalText?.secondText}</AdditionalText>
        </Wrapper>
    );
};

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
`;

const Container = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 60%;
    border: 3px solid #5f6180;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
`;

const AdditionalText = styled.span`
    line-height: 120%;
    font-size: 13px;
    margin-right: 10px;
`;

const Symbol = styled.span<{ color?: string }>`
    color: ${(_props) => (_props?.color ? _props.color : '')};
`;

export default PositionSymbol;
