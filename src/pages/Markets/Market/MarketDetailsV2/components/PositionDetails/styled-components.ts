import { MAIN_COLORS } from 'constants/ui';
import styled from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumn, FlexDivRow } from 'styles/common';

export const Container = styled(FlexDivRow)<{
    disabled: boolean;
    selected: boolean;
    isResolved?: boolean;
    isWinner: boolean;
}>`
    position: relative;
    align-items: center;
    border-radius: 5px;
    padding: 0 20px;
    flex: 1 1 0;
    width: 0;
    height: 30px;
    font-weight: 800;
    font-size: 14px;
    line-height: 16px;
    background: linear-gradient(180deg, #303656 41.5%, #1a1c2b 100%);
    border: 1px solid
        ${(props) => (props.selected || props.isWinner ? MAIN_COLORS.BORDERS.LIGHT_BLUE : MAIN_COLORS.BORDERS.GRAY)};
    box-shadow: ${(props) => (props.isWinner ? MAIN_COLORS.SHADOWS.POSITION_WINNER : '')};
    opacity: ${(props) => (props.disabled && !props.isWinner ? '0.4' : '1')};
    cursor: ${(props) => (props.disabled ? '' : 'pointer')};
    :hover {
        border: ${(props) => (props.disabled ? undefined : `1px solid ${MAIN_COLORS.LIGHT_BLUE}`)};
    }
    :not(:last-child) {
        margin-right: 10px;
    }
    margin-bottom: 3px;
    @media (max-width: 575px) {
        font-size: 12px;
        line-height: 14px;
        padding: 0px 10px;
        margin-bottom: 1px;
        :not(:last-child) {
            margin-right: 6px;
        }
    }
`;

export const Text = styled.span`
    text-transform: uppercase;
`;

export const Status = styled(Text)`
    @media (max-width: 575px) {
        font-size: 11px;
        margin-top: 1px;
    }
`;

export const Bonus = styled(FlexDivCentered)`
    color: #5fc694;
    position: absolute;
    top: -9px;
    right: -10px;
    font-size: 12px;
    font-weight: 700;
    padding: 2px 2px 2px 4px;
    background-color: ${MAIN_COLORS.LIGHT_GRAY};
    border-radius: 60%;
    @media (max-width: 575px) {
        right: -7px;
        top: -9px;
        padding: 2px;
        font-size: 11px;
    }
`;

export const TooltipContainer = styled(FlexDivColumn)``;

export const TooltipText = styled.span``;

export const TooltipBonusText = styled(TooltipText)`
    font-weight: 700;
    margin-top: 8px;
    color: #5fc694;
`;

export const TooltipFooter = styled(FlexDivRow)`
    border-top: 1px solid ${MAIN_COLORS.GRAY};
    margin-top: 10px;
    padding-top: 8px;
`;

export const TooltipFooterInfoContianer = styled(FlexDiv)``;

export const TooltipFooterInfoLabel = styled(TooltipText)`
    margin-right: 2px;
`;

export const TooltipFooterInfo = styled(TooltipText)`
    font-weight: 600;
`;
