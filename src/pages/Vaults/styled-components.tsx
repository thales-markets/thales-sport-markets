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
`;

export const Title = styled.span`
    font-style: normal;
    font-weight: bold;
    font-size: 25px;
    line-height: 100%;
    margin-top: 30px;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 40px;
`;
