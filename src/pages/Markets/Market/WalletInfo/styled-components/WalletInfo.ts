import styled from 'styled-components';
import { FlexDivCentered } from '../../../../../styles/common';

export const WalletInfoContainer = styled.div<{ hasBalances: boolean }>`
    margin-top: 10px;
    width: 100%;
    display: ${(props) => (props.hasBalances ? 'flex' : 'none')};
    color: #ffffff;
`;

export const TokenInfo = styled(FlexDivCentered)`
    text-align: center;
    padding: 15px 30px;
    width: 100%;
    @media (max-width: 768px) {
        flex-direction: column;
        padding: 0 5px 30px 5px;
        & > * {
            margin-top: 10px;
        }
    }
`;

export const Title = styled.div`
    font-size: 15px;
    font-weight: bold;
    line-height: 22px;
    margin-right: 10px;
    margin-left: 10px;
    text-transform: uppercase;
`;

export const ValueContainer = styled.span`
    display: flex;
    line-height: 22px;
    @media (max-width: 768px) {
        flex-direction: column;
        & > * {
            font-size: 14px;
            margin-top: 8px;
        }
    }
`;

export const Value = styled.span<{ color?: string; marginRight?: number }>`
    text-transform: uppercase;
    color: ${(props) => (props.color ? props.color : props.theme.textColor.primary)};
    margin-right: ${(props) => (props.marginRight ? props.marginRight : 0)}px;
`;

export const AlternateValue = styled.span`
    font-weight: bold;
    margin-right: 10px;
    margin-left: 5px;
`;

export const Token = styled.span<{ color: string }>`
    width: 22px;
    height: 22px;
    border-radius: 100%;
    display: inline-block;
    text-align: center;
    font-weight: bold;
    margin-right: 10px;
    line-height: 21px;
    background-color: ${(props) => props.color};
    color: #1a1c2b;
`;
