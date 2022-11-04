import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow } from 'styles/common';

export const Wrapper = styled(FlexDivColumn)`
    width: 100%;
    align-items: center;
`;

export const Container = styled(FlexDivRow)`
    width: 60%;
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

export const VaultContainer = styled(FlexDivColumn)`
    width: 250px;
    flex: initial;
    align-items: center;
    font-weight: 400;
    font-size: 18px;
    line-height: 20px;
    margin-bottom: 15px;
    background: ${(props) => props.theme.background.secondary};
    padding: 30px 40px 30px 40px;
    border-radius: 20px;
    cursor: pointer;
    @media (max-width: 767px) {
        padding: 20px 20px 20px 20px;
    }
    :hover {
        transform: scale(1.1);
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
