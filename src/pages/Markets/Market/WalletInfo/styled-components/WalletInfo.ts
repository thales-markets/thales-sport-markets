import styled from 'styled-components';

export const WalletInfoContainer = styled.div<{ hasBalances: boolean }>`
    margin-top: 10px;
    width: 100%;
    display: ${(props) => (props.hasBalances ? 'flex' : 'none')};
    background: #e6e6e6;
    border-radius: 15px;
    color: #1a1c2b;
`;

export const TokenInfo = styled.div`\
    text-align: center;
    padding: 15px 30px;
    width: 100%;
`;

export const Title = styled.div`
    font-size: 15px;
    font-weight: bold;
    line-height: 22px;
`;

export const ValueContainer = styled.span`
    line-height: 22px;
`;

export const Value = styled.span``;

export const AlternateValue = styled.span`
    font-weight: bold;
    margin-right: 10px;
    margin-left: 5px;
`;

export const Token = styled.span`
    border: 2px solid #1a1c2b;
    width: 23px;
    height: 23px;
    border-radius: 100%;
    display: inline-block;
    text-align: center;
    font-weight: bold;
    margin-right: 5px;
    line-height: 20px;
`;
