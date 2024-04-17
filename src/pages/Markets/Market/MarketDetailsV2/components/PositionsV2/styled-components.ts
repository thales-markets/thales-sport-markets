import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivColumnCentered } from 'styles/common';

export const Container = styled(FlexDivColumn)`
    position: relative;
    padding: 6px 0px;
    border-radius: 5px;
    @media (max-width: 575px) {
        padding: 5px 0px;
    }
    margin-bottom: 5px;
`;

export const Header = styled(FlexDivColumnCentered)`
    position: relative;
`;

export const Title = styled.span<{ isExpanded: boolean }>`
    font-size: 12px;
    line-height: 14px;
    text-transform: uppercase;
    margin-bottom: ${(props) => (props.isExpanded ? 4 : 0)}px;
    margin-left: 2px;
    text-align: center;
`;

export const SubTitleContainer = styled(FlexDiv)`
    font-size: 12px;
    line-height: 14px;
    color: ${(props) => props.theme.textColor.quinary};
`;

export const SubTitle = styled.span`
    font-size: 12px;
    line-height: 14px;
    width: 100%;
    text-align: center;
`;

export const ContentContianer = styled(FlexDivColumn)``;

export const ContentRow = styled.div<{ gridMinMaxPercentage: number }>`
    margin-bottom: 5px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(calc(${(props) => props.gridMinMaxPercentage}% - 5px), 1fr));
    gap: 5px;
`;

export const Arrow = styled.i`
    font-size: 12px;
    color: ${(props) => props.theme.textColor.primary};
    position: absolute;
    top: 4px;
    right: 5px;
    margin-right: 2px;
    cursor: pointer;
`;
