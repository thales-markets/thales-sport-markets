import styled from 'styled-components';
import { FlexDiv, FlexDivRow, FlexDivColumn } from 'styles/common';

export const Container = styled(FlexDivColumn)`
    :not(:last-child) {
        border-right: 3px solid #5f6180;
        padding: 0 10px;
    }
    :last-child {
        padding: 0 0 0 10px;
    }
    :first-child {
        padding: 0 10px 0 0;
    }
`;

export const Title = styled.span`
    font-size: 10px;
    text-transform: uppercase;
    margin-bottom: 5px;
    text-align: center;
`;

export const WinnerLabel = styled.span`
    font-weight: 700;
    text-transform: uppercase;
    font-size: 14px;
    line-height: 120%;
    color: #3fd1ff;
    margin-left: 5px;
    @media (max-width: 950px) {
        margin-left: 0;
    }
`;

export const OddsContainer = styled(FlexDivRow)`
    align-items: center;
`;

export const WinnerContainer = styled(FlexDiv)``;
