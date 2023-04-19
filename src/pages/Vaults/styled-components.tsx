import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow } from 'styles/common';

export const Wrapper = styled(FlexDivColumn)`
    width: 100%;
    align-items: center;
`;

export const Container = styled(FlexDivRow)`
    width: 95%;
    position: relative;
    align-items: start;
    @media (max-width: 1440px) {
        width: 95%;
    }
    @media (max-width: 767px) {
        flex-direction: column;
        align-items: center;
    }
    margin-bottom: 20px;
    justify-content: center;
`;

export const Title = styled.span`
    font-style: normal;
    font-weight: bold;
    font-size: 25px;
    line-height: 100%;
    color: ${(props) => props.theme.textColor.primary};
    margin-top: 30px;
    margin-bottom: 20px;
`;

export const Note = styled.span`
    font-style: normal;
    font-weight: 400;
    font-size: 13px;
    line-height: 15px;
    display: flex;
    align-items: center;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 20px;
`;
