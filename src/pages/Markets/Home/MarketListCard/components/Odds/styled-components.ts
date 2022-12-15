import styled from 'styled-components';
import { FlexDivRow, FlexDivColumn } from 'styles/common';

export const Container = styled(FlexDivColumn)`
    :not(:last-child) {
        border-right: 3px solid #5f6180;
        padding: 0 10px;
    }
    :last-child(:not(:first-child)) {
        padding: 0 0 0 10px;
    }
    :first-child(:not(:last-child)) {
        padding: 0 10px 0 0;
    }
`;

export const Title = styled.span`
    font-size: 10px;
    text-transform: uppercase;
    margin-bottom: 5px;
    text-align: center;
`;

export const OddsContainer = styled(FlexDivRow)`
    align-items: center;
`;
