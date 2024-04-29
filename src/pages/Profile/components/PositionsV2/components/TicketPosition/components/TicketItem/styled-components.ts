import styled from 'styled-components';
import { FlexDivRow, FlexDivRowCentered } from 'styles/common';

export const Wrapper = styled(FlexDivRowCentered)`
    padding: 5px 10px;
    font-weight: 600;
    font-size: 12px;
    line-height: 12px;
    @media (max-width: 768px) {
        padding: 5px 5px;
    }
    & > div {
        flex: 1;
    }
    border-bottom: 2px dashed #3c498a;
    height: 50px;
`;

export const MatchInfo = styled.div`
    max-width: 300px;
    width: 300px;
    display: flex;
    align-items: center;
    height: 30px;
`;

export const MatchLabel = styled(FlexDivRow)`
    color: ${(props) => props.theme.textColor.primary};
    text-align: start;
    margin-right: 5px;
`;

export const MarketTypeInfo = styled(FlexDivRow)`
    font-weight: 600;
    font-size: 12px;
    line-height: 12px;
    color: ${(props) => props.theme.textColor.quinary};
    margin-right: 5px;
`;

export const PositionInfo = styled(FlexDivRow)`
    font-weight: 600;
    font-size: 12px;
    line-height: 12px;
    color: ${(props) => props.theme.textColor.quaternary};
    align-items: center;
    margin-right: 20px;
`;

export const PositionText = styled.span`
    text-align: start;
    min-width: 100px;
`;

export const Odd = styled.span`
    margin-left: 5px;
`;

export const MarketStatus = styled(FlexDivRow)`
    color: ${(props) => props.theme.textColor.primary};
    justify-content: end;
`;

export const ParlayStatus = styled.span`
    min-width: 100px;
    text-align: end;
    @media (max-width: 768px) {
        margin-left: 10px;
        min-width: 50px;
    }
`;
