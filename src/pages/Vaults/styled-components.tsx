import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow } from 'styles/common';

export const Wrapper = styled(FlexDivColumn)`
    width: 100%;
    align-items: center;
`;

export const Container = styled(FlexDivRow)`
    width: 70%;
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

export const SpaContainer = styled(FlexDivColumn)`
    border-radius: 15px;
    :not(:last-child) {
        margin-right: 25px;
    }
    background: linear-gradient(180deg, #2b2f4a 0%, rgba(43, 47, 74, 0) 100%);
    :hover {
        background: linear-gradient(180deg, #2b2f4a 0%, #333a69 100%);
    }
    cursor: pointer;
    @media (max-width: 767px) {
        width: 100%;
        :not(:last-child) {
            margin-right: 0;
            margin-bottom: 20px;
        }
    }
`;

export const VaultContainer = styled(FlexDivColumn)`
    align-items: center;
    font-weight: 400;
    font-size: 18px;
    line-height: 20px;
    padding: 30px 40px 30px 40px;
    @media (max-width: 767px) {
        padding: 20px 20px 20px 20px;
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

export const VaultTitle = styled.span`
    font-style: normal;
    font-weight: bold;
    font-weight: 600;
    font-size: 22px;
    line-height: 25px;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 40px;
    width: 100%;
    padding-bottom: 20px;
    border-bottom: 2px solid #5f6180;
    text-align: center;
`;
