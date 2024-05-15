import MuiTooltip from '@material-ui/core/Tooltip';
import styled from 'styled-components';
import { FlexDiv, FlexDivCentered } from 'styles/common';

export const RowSummary = styled.div<{ columnDirection?: boolean }>`
    position: relative;
    display: flex;
    align-items: center;
    ${(props) => (props.columnDirection ? `flex-direction: column;` : '')}
`;

export const GasSummary = styled(RowSummary)<{ columnDirection?: boolean }>`
    border-top: 2px solid ${(props) => props.theme.background.tertiary};
    border-bottom: 2px solid ${(props) => props.theme.background.tertiary};
    margin-top: 2px;
    margin-bottom: 2px;
`;

export const RowContainer = styled(FlexDiv)`
    align-items: center;
    width: 100%;
`;

export const SummaryLabel = styled.span<{ alignRight?: boolean; lineHeight?: number }>`
    font-weight: 400;
    font-size: 12px;
    line-height: ${(props) => props.lineHeight || 20}px;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.quaternary};
    ${(props) => (props.alignRight ? `margin-left: auto;` : '')}
    @media (max-width: 950px) {
        line-height: 24px;
    }
    i {
        color: ${(props) => props.theme.textColor.septenary};
    }
`;

export const ClearLabel = styled(SummaryLabel)`
    font-weight: 600;
    color: ${(props) => props.theme.textColor.septenary};
    text-transform: none;
`;

export const SummaryValue = styled.span<{
    isInfo?: boolean;
    isCurrency?: boolean;
    isHidden?: boolean;
    isCollateralInfo?: boolean;
    fontSize?: number;
}>`
    font-weight: 700;
    font-size: ${(props) => props.fontSize || 11}px;
    line-height: 20px;
    display: ${(props) => (props.isHidden ? 'none' : '')};
    color: ${(props) => (props.isInfo || props.isCurrency ? props.theme.status.win : props.theme.textColor.primary)};
    margin-left: ${(props) => (props.isInfo || props.isCollateralInfo ? 'auto' : '5px')};
    i {
        color: ${(props) => props.theme.textColor.septenary};
    }
`;

export const InfoContainer = styled.div`
    position: relative;
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    align-items: center;
`;

export const InfoWrapper = styled.div``;

export const InfoLabel = styled.span<{ marginLeft?: number }>`
    font-weight: 300;
    font-size: 10px;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
    ${(props) => (props.marginLeft ? `margin-left: ${props.marginLeft}px;` : '')}
`;

export const InfoValue = styled.span`
    font-weight: 700;
    font-size: 10px;
    color: ${(props) => props.theme.textColor.primary};
    margin-left: 4px;
`;

export const InputContainer = styled(FlexDiv)``;

export const InfoTooltip = styled((props) => <MuiTooltip classes={{ popper: props.className }} {...props} />)`
    & .MuiTooltip-tooltip {
        min-width: 100%;
        margin-bottom: 7px;
        background-color: ${(props) => props.theme.warning.background.primary};
        color: ${(props) => props.theme.warning.textColor.primary};
        border: 1.5px solid ${(props) => props.theme.warning.borderColor.primary};
        border-radius: 2px;
        font-size: 9px;
        line-height: 12px;
        text-transform: uppercase;
    }
    & .MuiTooltip-arrow {
        &:before {
            border: 1.5px solid ${(props) => props.theme.warning.borderColor.primary};
            background-color: ${(props) => props.theme.warning.background.primary};
            box-sizing: border-box;
        }
        width: 11px;
        height: 8px;
        bottom: -2px !important;
    }
`;

export const AmountToBuyContainer = styled.div`
    position: relative;
    width: 100%;
`;

export const AmountToBuyMultiContainer = styled.div`
    display: flex;
    position: relative;
    justify-content: flex-end;
    align-items: flex-end;
`;

export const AmountToBuyMultiInfoLabel = styled.span<{ alignRight?: boolean }>`
    font-weight: 400;
    font-size: 11px;
    line-height: 27px;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.quaternary};
    ${(props) => (props.alignRight ? `margin-left: auto;` : '')}
    @media (max-width: 950px) {
        line-height: 24px;
    }
`;

export const AmountToBuyMultiPayoutLabel = styled.span<{ alignRight?: boolean }>`
    font-weight: 400;
    font-size: 11px;
    line-height: 27px;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.quaternary};
    margin-left: auto;
`;

export const AmountToBuyMultiPayoutValue = styled.span<{ isInfo?: boolean; isCurrency?: boolean; isHidden?: boolean }>`
    font-weight: 700;
    font-size: 11px;
    line-height: 27px;
    letter-spacing: 0.025em;
    display: ${(props) => (props.isHidden ? 'none' : '')};
    color: ${(props) => (props.isInfo || props.isCurrency ? props.theme.status.win : props.theme.textColor.primary)};
    margin-left: 5px;
`;

export const BalanceWrapper = styled.div`
    display: flex;
    align-items: center;
    margin-left: auto;
`;

export const BalanceLabel = styled.span<{ marginLeft?: string; bold?: boolean; originalText?: boolean }>`
    font-size: 11px;
    line-height: 27px;
    letter-spacing: 0.025em;
    ${(props) => (props.originalText ? '' : 'text-transform: uppercase;')}
    color: ${(props) => props.theme.textColor.primary};
    ${(props) => (props.marginLeft ? `margin-left: ${props.marginLeft};` : '')}
    font-weight: ${(props) => (props.bold ? '700' : '400')};
    @media (max-width: 950px) {
        line-height: 24px;
    }
`;

export const BalanceValue = styled.span`
    font-weight: 400;
    font-size: 11px;
    line-height: 27px;
    letter-spacing: 0.025em;
    color: ${(props) => props.theme.textColor.primary};
    margin-left: 5px;
    @media (max-width: 950px) {
        line-height: 24px;
    }
`;

export const XButton = styled.i<{ margin?: string }>`
    font-size: 15px;
    font-weight: 700;
    color: ${(props) => props.theme.textColor.septenary};
    cursor: pointer;
    ${(props) => (props.margin ? `margin: ${props.margin};` : '')}
    &:hover {
        color: ${(props) => props.theme.textColor.quaternary};
    }
`;

export const ShareWrapper = styled(FlexDivCentered)`
    margin-top: 15px;
`;

export const TwitterIcon = styled.i<{ disabled?: boolean; fontSize?: string; padding?: string; color?: string }>`
    font-size: ${(props) => props.fontSize || '18px'};
    color: ${(props) => props.color || props.theme.textColor.septenary};
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
    opacity: ${(props) => (props.disabled ? '0.4' : '1')};
    ${(props) => (props.padding ? `padding: ${props.padding};` : '')}
    text-transform: lowercase;
    &:before {
        font-family: ExoticIcons !important;
        content: '\\0061';
    }
`;

export const defaultButtonProps = {
    width: '100%',
    margin: '10px 0 0 0',
    padding: '5px 30px',
};

export const CheckboxContainer = styled.div`
    margin-left: auto;
    margin-top: 4px;
    label {
        color: ${(props) => props.theme.textColor.secondary};
        font-size: 12px;
        line-height: 13px;
        font-weight: 600;
        letter-spacing: 0.035em;
        text-transform: uppercase;
        padding-top: 18px;
        padding-left: 18px;
        input:checked ~ .checkmark {
            border: 2px solid ${(props) => props.theme.borderColor.quaternary};
        }
    }
    .checkmark {
        height: 14px;
        width: 14px;
        border: 2px solid ${(props) => props.theme.borderColor.quaternary};
        :after {
            left: 2px;
            width: 3px;
            height: 8px;
            border: 2px solid ${(props) => props.theme.borderColor.quaternary};
            border-width: 0 2px 2px 0;
        }
    }
`;

export const CollateralContainer = styled.div`
    margin-left: auto;
    border-radius: 5px;
    padding: 3px;
    background: ${(props) => props.theme.input.background.primary};
`;

export const HorizontalLine = styled.hr`
    width: 100%;
    border: 1px solid ${(props) => props.theme.borderColor.senary};
    border-radius: 2px;
`;
