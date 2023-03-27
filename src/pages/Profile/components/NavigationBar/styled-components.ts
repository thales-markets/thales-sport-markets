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
    margin: 10px 0px;
`;

export const ItemWrapper = styled.div`
    position: relative;
`;

export const Item = styled.span<{ selected: boolean }>`
    color: ${(props) => (props?.selected ? `${MAIN_COLORS.TEXT.BLUE}` : `${MAIN_COLORS.TEXT.DARK_GRAY}`)};
    padding: 0px 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    cursor: pointer;
`;

export const NotificationCount = styled.div`
    position: absolute;
    border-radius: 50%;
    top: -6px;
    right: 4px;
    display: flex;
    align-items: center;
    text-align: center;
    justify-content: center;
    height: 14px;
    width: 14px;
    background-color: ${MAIN_COLORS.BACKGROUNDS.BLUE};
    box-shadow: ${MAIN_COLORS.SHADOWS.NOTIFICATION};
`;

export const Count = styled.span`
    color: ${MAIN_COLORS.DARK_GRAY};
    font-weight: 800;
    font-size: 10px;
`;
