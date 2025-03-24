import styled from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumn, FlexDivRow, FlexDivRowCentered } from 'styles/common';

export const LeaderboardWrapper = styled(FlexDiv)`
    margin-top: 30px;
    flex-direction: column;
`;

export const Container = styled(FlexDivColumn)`
    background: ${(props) => props.theme.marchMadness.background.primary};
    border-radius: 6px;
`;

export const LeaderboardContainer = styled(FlexDivColumn)`
    border-radius: 8px;
    color: ${(props) => props.theme.textColor.primary};
    margin-top: -10px;
`;

export const Title = styled(FlexDiv)`
    align-items: center;
    justify-content: center;
    margin: 10px 0 15px 0;
    flex-direction: column;
    cursor: pointer;
    gap: 5px;
`;

export const TitleLabel = styled.span<{ isBold?: boolean }>`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-weight: ${(props) => (props.isBold ? '700' : '300')};
    font-size: 14px;
    line-height: 18px;
    padding-left: ${(props) => (props.isBold ? '0' : '5px')};
    text-transform: uppercase;
    span {
        letter-spacing: 2px;
        margin: 0 5px;
        font-family: 'NCAA' !important;
    }
`;

export const HeaderRow = styled(FlexDivRow)`
    border-top: 1px solid ${(props) => props.theme.borderColor.primary};
    padding-top: 5px;
    justify-content: space-around;
    margin-bottom: 5px;
`;

export const LeaderboardRow = styled(FlexDivRow)`
    height: 36px;
    align-items: center;
    &.first {
        border-top: 2px solid ${(props) => props.theme.borderColor.primary};
        border-bottom: 2px solid ${(props) => props.theme.borderColor.primary};
    }
`;

export const Rank = styled(FlexDivCentered)`
    font-weight: 700;
    font-size: 12px;
    margin: 0px 5px;
    width: 15px;
`;

export const DataLabel = styled(FlexDivRowCentered)<{ textAlign?: string }>`
    text-align: ${(props) => (props.textAlign ? props.textAlign : 'left')};
    font-weight: 400;
    font-size: 12px;
    white-space: nowrap;
    line-height: 103.19%;
`;

export const ColumnLabel = styled.span`
    text-transform: uppercase;
    font-size: 12px;
    font-weight: 700;
    line-height: 103.19%;
`;

export const ColumnWrapper = styled(FlexDiv)<{ padding?: string; width?: string }>`
    width: ${(props) => (props?.width ? props.width : '32%')};
    align-items: center;
    justify-content: center;
    text-align: center;
    ${(props) => (props.padding ? `padding: ${props.padding};` : '')}
    &:last-child {
        margin-right: 5px;
    }
`;

export const LoaderContainer = styled(FlexDivCentered)`
    position: relative;
    min-height: 200px;
    width: 100%;
`;

export const NoResultContainer = styled(FlexDivCentered)`
    font-size: 12px;
    min-height: 50px;
    text-align: center;
`;
