import styled from 'styled-components';
import { FlexDivRow } from 'styles/common';

export const Wrapper = styled(FlexDivRow)`
    width: 100%;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    padding: 5px 10px;
    @media (max-width: 768px) {
        padding: 5px 5px;
    }
`;

export const ParlayStatus = styled.span`
    font-size: 12px;
    line-height: 110%;
    font-weight: 600;
    margin-left: 50px;
    @media (max-width: 768px) {
        margin-left: 10px;
        min-width: 50px;
    }
`;
