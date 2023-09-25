import styled from 'styled-components';
import { FlexDivRow, FlexDivColumn } from 'styles/common';

export const Container = styled(FlexDivColumn)``;

export const OddsContainer = styled(FlexDivRow)<{ oneSidePlayerPropsLimit: boolean }>`
    align-items: flex-start;
    justify-content: flex-start;
`;
