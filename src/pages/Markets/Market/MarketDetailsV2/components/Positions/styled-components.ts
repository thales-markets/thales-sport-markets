import { MAIN_COLORS } from 'constants/ui';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivRow } from 'styles/common';

export const Container = styled(FlexDivColumn)`
    background-color: ${MAIN_COLORS.LIGHT_GRAY};
    padding: 10px 15px;
    border-radius: 5px;
`;

export const Header = styled(FlexDivRow)``;

export const Title = styled.span`
    font-size: 12px;
    line-height: 14px;
    text-transform: uppercase;
    margin-bottom: 2px;
    margin-left: 2px;
`;

export const ContentContianer = styled(FlexDivRow)``;

export const Status = styled(FlexDivCentered)<{ backgroundColor?: string }>`
    width: 100%;
    border-radius: 15px;
    background-color: ${(props) => props.backgroundColor || MAIN_COLORS.LIGHT_GRAY};
    padding: 10px 50px;
    margin-bottom: 7px;
    font-weight: 600;
    font-size: 21px;
    line-height: 110%;
    text-transform: uppercase;
    color: ${MAIN_COLORS.TEXT.WHITE};
`;
