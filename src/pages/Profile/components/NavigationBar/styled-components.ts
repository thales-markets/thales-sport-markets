import { MAIN_COLORS } from 'constants/ui';
import styled from 'styled-components';
import { FlexDivRow } from 'styles/common';

export const Wrapper = styled(FlexDivRow)`
    width: 100%;
    align-items: center;
    justify-content: center;
    padding: 6px;
    border: 1px solid ${MAIN_COLORS.BORDERS.GRAY};
    border-radius: 5px;
`;

export const Item = styled.span<{ selected: boolean }>`
    color: ${(_props) => (_props?.selected ? `${MAIN_COLORS.TEXT.BLUE}` : `${MAIN_COLORS.TEXT.DARK_GRAY}`)};
    padding: 0px 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    cursor: pointer;
`;
