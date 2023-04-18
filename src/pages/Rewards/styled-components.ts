import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';

export const MarketContainer = styled(FlexDivColumn)`
    margin-top: 20px;
    box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.35);
    border-radius: 25px;
    width: 100%;
    padding: 0 60px 30px 60px;
    background: ${(props) => props.theme.background.secondary};
    flex: initial;
    @media (max-width: 768px) {
        padding: 10px 10px 20px 10px;
    }
`;

export const Container = styled(FlexDivColumn)`
    width: 80%;
    position: relative;
    align-items: center;
    @media (max-width: 1440px) {
        width: 95%;
    }
    @media (max-width: 500px) {
        width: 100%;
    }
`;

export const Title = styled.span`
    font-style: normal;
    font-weight: bold;
    font-size: 25px;
    line-height: 100%;
    margin-top: 20px;
    /* text-align: center; */
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 20px;
    @media (max-width: 500px) {
        margin-top: 10px;
        margin-bottom: 10px;
    }
`;

export const Description = styled.p`
    font-style: normal;
    font-weight: 400;
    font-size: 18px;
    line-height: 20px;
    margin-bottom: 20px;
    text-align: justify;
    color: ${(props) => props.theme.textColor.primary};
    div {
        margin-bottom: 10px;
    }
    p:last-of-type {
        margin-bottom: 10px;
    }
`;

export const BoldText = styled.span`
    font-weight: 600;
`;

export const TableContainer = styled(FlexDivColumn)`
    overflow: visible;
    ::-webkit-scrollbar {
        width: 5px;
    }
    ::-webkit-scrollbar-track {
        background: #04045a;
        border-radius: 8px;
    }
    ::-webkit-scrollbar-thumb {
        border-radius: 15px;
        background: #355dff;
    }
    ::-webkit-scrollbar-thumb:active {
        background: #44e1e2;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: rgb(67, 116, 255);
    }
`;

export const SelectContainer = styled.div`
    margin-left: 1px;
    margin-bottom: 10px;
    width: 300px;
`;

export const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
    @media (max-width: 600px) {
        flex-direction: column;
    }
`;

export const TotalPnl = styled.span`
    font-weight: bold;
`;

export const HighlightRow = styled.div`
    height: 50px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    ${(props) => `border: 1px solid ${props?.theme?.textColor?.quaternary};`};
    box-shadow: 0px 0px 26px 0px rgba(0, 0, 0, 0.75);
    border-radius: 10px;
    margin-bottom: 10px;
    margin-top: 10px;
    @media (max-width: 600px) {
        height: 66px;
        padding-right: 5px;
    }
`;

export const HighlightColumn = styled.div`
    font-weight: bold;
    text-align: left;
    padding-left: 5px;
    width: 25%;
`;

export const AddressLink = styled.a`
    color: ${(props) => props.theme.textColor.primary};
    &:hover {
        color: ${(props) => props.theme.textColor.quaternary};
    }
`;

export const TipLink = styled.a`
    display: contents;
    color: ${(props) => props.theme.textColor.quaternary};
`;

export const ColumnValue = styled.p<{ padding?: string }>`
    @media (max-width: 400px) {
        ${(props) => (props.padding ? `padding: ${props.padding};` : '')}
        text-align: right;
        width: 100%;
    }
`;
