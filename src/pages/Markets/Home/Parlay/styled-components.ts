import styled from 'styled-components';
import { Tooltip, withStyles } from '@material-ui/core';
import { FlexDiv } from 'styles/common';

export const RowSummary = styled.div`
    display: flex;
    align-items: center;
`;

export const SummaryLabel = styled.span`
    font-weight: 400;
    font-size: 11px;
    line-height: 27px;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: #64d9fe;
`;

export const SummaryValue = styled.span<{ isInfo?: boolean }>`
    font-weight: 700;
    font-size: 11px;
    line-height: 12px;
    letter-spacing: 0.025em;
    color: ${(props) => (props.isInfo ? '#5fc694' : '#ffffff')};
    margin-left: ${(props) => (props.isInfo ? 'auto' : '5px')};
`;

export const InfoWrapper = styled.div`
    display: flex;
    align-items: center;
    margin-left: auto;
`;

export const InfoLabel = styled.span`
    font-weight: 300;
    font-size: 10px;
    text-transform: uppercase;
    color: #ffffff;
    margin-left: 5px;
`;

export const InfoValue = styled.span`
    font-weight: 700;
    font-size: 9px;
    color: #ffffff;
    margin-left: 5px;
`;

export const InputContainer = styled(FlexDiv)``;

export const CustomTooltip = withStyles(() => ({
    tooltip: {
        minWidth: '100%',
        width: '270px',
        margin: '0',
        backgroundColor: '#FDB7B7',
        color: '#F30101',
        fontSize: '11px',
    },
}))(Tooltip);

export const AmountToBuyContainer = styled.div`
    position: relative;
`;

export const AmountToBuyInput = styled.input`
    width: 270px;
    margin: 10px 0;
    border: 3px solid #3accfa;
    border-radius: 5px;
    text-align: center;
    font-weight: bold;
    font-size: 18px;
    outline: none;
    @media (max-width: 768px) {
        width: 130px;
        font-size: 15px;
    }
`;

export const MaxButton = styled.button`
    background: #3accfa;
    font-size: 10px;
    line-height: 12px;
    position: absolute;
    top: 16px;
    right: 5px;
    border: none;
    cursor: pointer;
`;

export const SubmitButton = styled.button`
    margin-top: 10px;
    background: #5fc694;
    border-radius: 5px;
    font-weight: 700;
    font-size: 14px;
    line-height: 17px;
    letter-spacing: 0.025em;
    color: #1c1f2f;
    width: 100%;
    border: none;
    padding: 7px;
    cursor: pointer;
    text-transform: uppercase;
    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
`;

export const BalanceWrapper = styled.div`
    display: flex;
    align-items: center;
    margin-left: auto;
`;

export const BalanceLabel = styled.span<{ marginLeft?: string; bold?: boolean; originalText?: boolean }>`
    font-size: 11px;
    line-height: 27px;
    letter-spacing: 0.025em;
    ${(props) => (props.originalText ? '' : 'text-transform: uppercase;')}
    color: #ffffff;
    ${(props) => (props.marginLeft ? `margin-left: ${props.marginLeft};` : '')}
    font-weight: ${(props) => (props.bold ? '700' : '400')};
`;

export const BalanceValue = styled.span`
    font-weight: 400;
    font-size: 11px;
    line-height: 27px;
    letter-spacing: 0.025em;
    color: #ffffff;
    margin-left: 5px;
`;
