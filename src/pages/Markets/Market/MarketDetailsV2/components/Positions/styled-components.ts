import { MAIN_COLORS } from 'constants/ui';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow } from 'styles/common';

export const Container = styled(FlexDivColumn)`
    position: relative;
    background-color: ${MAIN_COLORS.LIGHT_GRAY};
    padding: 6px 10px;
    border-radius: 5px;
    @media (max-width: 575px) {
        padding: 5px 6px;
    }
    margin-bottom: 5px;
`;

export const Header = styled(FlexDivRow)`
    position: relative;
`;

export const Title = styled.span<{ isExpanded: boolean }>`
    font-size: 12px;
    line-height: 14px;
    text-transform: uppercase;
    margin-bottom: ${(props) => (props.isExpanded ? 4 : 0)}px;
    margin-left: 2px;
`;

export const ContentContianer = styled(FlexDivColumn)``;

export const ContentRow = styled(FlexDivRow)`
    :not(:last-child) {
        margin-bottom: 3px;
    }
`;

export const Arrow = styled.i`
    font-size: 12px;
    color: ${MAIN_COLORS.TEXT.WHITE};
    position: absolute;
    top: 4px;
    right: 5px;
    margin-right: 2px;
    cursor: pointer;
`;
