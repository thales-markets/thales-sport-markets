import styled from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivEnd } from 'styles/common';

export const RowSummary = styled.div<{ columnDirection?: boolean }>`
    position: relative;
    display: flex;
    align-items: center;
    ${(props) => (props.columnDirection ? `flex-direction: column;` : '')}
`;

export const GasWarning = styled(RowSummary)<{ columnDirection?: boolean }>`
    font-weight: 400;
    font-size: 12px;
    color: ${(props) => props.color || props.theme.overdrop.textColor.primary};
    margin-top: 4px;
    line-height: 14px;
`;

export const RowContainer = styled(FlexDiv)`
    align-items: center;
    width: 100%;
`;

export const SummaryLabel = styled.span<{
    alignRight?: boolean;
    lineHeight?: number;
    isBonus?: boolean;
    disabled?: boolean;
}>`
    font-weight: 400;
    font-size: 12px;
    line-height: ${(props) => props.lineHeight || 20}px;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: ${(props) => (props.isBonus ? props.theme.status.win : props.theme.textColor.quaternary)};
    ${(props) => (props.alignRight ? `margin-left: auto;` : '')}
    ${(props) => (props.disabled ? `opacity: 0.7;` : '')}
    @media (max-width: 950px) {
        line-height: 24px;
    }
    i {
        color: ${(props) => props.theme.textColor.septenary};
    }
`;

export const ClearLabel = styled(SummaryLabel)`
    font-weight: 600;
    color: ${(props) => props.theme.textColor.quaternary};
    text-transform: none;
    cursor: pointer;

    i {
        color: ${(props) => props.theme.textColor.quaternary};
    }
`;

export const SummaryValue = styled.span<{
    isInfo?: boolean;
    isCurrency?: boolean;
    isHidden?: boolean;
    isCollateralInfo?: boolean;
    fontSize?: number;
    isError?: boolean;
}>`
    font-weight: 600;
    font-size: ${(props) => props.fontSize || 11}px;
    line-height: 20px;
    display: ${(props) => (props.isHidden ? 'none' : '')};
    color: ${(props) =>
        props.isError
            ? props.theme.error.textColor.primary
            : props.isInfo || props.isCurrency
            ? props.theme.status.win
            : props.theme.textColor.primary};
    margin-left: ${(props) => (props.isInfo || props.isCollateralInfo ? 'auto' : '5px')};
    i {
        color: ${(props) => props.theme.textColor.septenary};
    }
`;

export const InfoContainer = styled.div<{ hasMarginTop?: boolean }>`
    position: relative;
    display: flex;
    justify-content: space-between;
    ${(props) => (props.hasMarginTop ? `margin-top: 5px;` : '')}
    margin-bottom: 5px;
    align-items: center;
    line-height: 15px;
`;

export const InfoWrapper = styled.div``;

export const InfoLabel = styled.span<{ marginLeft?: number }>`
    font-weight: 400;
    font-size: 10px;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
    ${(props) => (props.marginLeft ? `margin-left: ${props.marginLeft}px;` : '')}
`;

export const InfoValue = styled.span`
    font-weight: 600;
    font-size: 10px;
    color: ${(props) => props.theme.textColor.primary};
    margin-left: 4px;
`;

export const InputContainer = styled(FlexDiv)``;

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
    font-weight: 600;
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
    font-weight: ${(props) => (props.bold ? '600' : '400')};
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
    font-size: 12px;
    font-weight: 600;
    color: ${(props) => props.theme.textColor.septenary};
    ${(props) => (props.margin ? `margin: ${props.margin};` : '')}
`;

export const ShareWrapper = styled(FlexDivCentered)<{ disabled?: boolean }>`
    margin-top: 15px;
    gap: 10px;
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
    ${(props) => (props.disabled ? `opacity: 0.7;` : '')}
`;

export const TwitterIcon = styled.i<{ disabled?: boolean; fontSize?: string; padding?: string; color?: string }>`
    font-size: ${(props) => props.fontSize || '20px'};
    color: ${(props) => props.theme.textColor.quaternary};
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
    opacity: ${(props) => (props.disabled ? '0.4' : '1')};
    ${(props) => (props.padding ? `padding: ${props.padding};` : '')}
    text-transform: lowercase;
    &:before {
        font-family: HomepageIconsV2 !important;
        content: '\\0021';
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
        height: 15px;
        width: 15px;
        border: 2px solid ${(props) => props.theme.borderColor.quaternary};
        :after {
            left: 3px;
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

export const SettingsIconContainer = styled(FlexDivEnd)`
    position: relative;
`;

export const SettingsWrapper = styled(FlexDiv)`
    cursor: pointer;
    color: ${(props) => props.theme.textColor.septenary};
    &:hover {
        color: ${(props) => props.theme.textColor.quaternary};
        i {
            color: ${(props) => props.theme.textColor.quaternary};
        }
    }
`;

export const SettingsLabel = styled.span`
    margin-right: 5px;
    font-size: 12px;
    font-weight: 600;
`;

export const SettingsIcon = styled.i`
    font-size: 16px;
    font-weight: 600;
`;

export const SlippageDropdownContainer = styled.div`
    border: 1px solid ${(props) => props.theme.textColor.septenary};
    background: ${(props) => props.theme.background.secondary};
    color: white;
    border-radius: 5px;
    position: absolute;
    margin-top: 2px;
    padding: 10px;
    top: 20px;
    z-index: 1000;
    right: 0;
`;

export const OverdropRowSummary = styled(RowSummary)<{ margin?: string; isClickable?: boolean }>`
    width: 100%;
    position: relative;
    margin: ${(props) => props.margin || 'inherit'};
    justify-content: space-between;
    ${(props) => (props.isClickable ? 'cursor: pointer;' : '')}
`;

export const OverdropLabel = styled.span<{ color?: string }>`
    font-weight: 400;
    font-size: 12px;
    line-height: 20px;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: ${(props) => props.color || props.theme.overdrop.textColor.primary};
    i {
        color: ${(props) => props.theme.textColor.septenary};
        font-size: 14px;
    }
    @media (max-width: 950px) {
        line-height: 24px;
    }
`;

export const OverdropValue = styled.span<{ color?: string }>`
    font-weight: 600;
    font-size: 11px;
    text-transform: uppercase;
    line-height: 20px;
    color: ${(props) => props.color || props.theme.overdrop.textColor.primary};
    margin-left: auto;
    i {
        color: ${(props) => props.theme.textColor.septenary};
    }
`;

export const OverdropSummary = styled.div`
    width: 100%;
    border-radius: 8px;
`;

export const OverdropSummaryTitle = styled(FlexDivCentered)`
    height: 60px;
    text-align: center;
    font-size: 20px;
    color: ${(props) => props.theme.overdrop.textColor.quinary};
`;

export const Arrow = styled.i`
    font-size: 16px;
    margin-left: 10px;
    text-transform: none;
    font-weight: 400;
    color: ${(props) => props.theme.textColor.secondary};
    @media (max-width: 767px) {
        font-size: 10px;
        margin-left: 8px;
    }
`;

export const OverdropSummarySubtitle = styled.span`
    font-size: 14px;
    font-weight: 600;
    color: white;
    text-transform: uppercase;
`;

export const OverdropSummarySubvalue = styled.span`
    font-size: 29px;
    font-weight: 600;
    color: white;
    text-transform: uppercase;
`;

export const OverdropSummarySubheader = styled.span`
    color: ${(props) => props.theme.overdrop.textColor.quinary};
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
`;

export const OverdropTotalsRow = styled(FlexDiv)`
    margin: 20px 20px 0 20px;
    justify-content: space-around;
`;

export const OverdropTotalsTitle = styled.div`
    text-align: center;
    font-size: 14px;
    font-weight: 600;
    color: white;
    text-transform: uppercase;
`;

export const OverdropTotal = styled.div<{ isBoost?: boolean }>`
    text-align: center;
    font-size: 29px;
    font-weight: 600;
    color: ${(props) =>
        props.isBoost ? props.theme.overdrop.textColor.primary : props.theme.overdrop.textColor.senary};
    text-transform: uppercase;
`;

export const OverdropProgressWrapper = styled.div`
    position: relative;
    margin-left: 10px;
    margin-right: 20px;
    margin-top: 10px;
    margin-bottom: 25px;
`;

export const CurrentLevelProgressLineContainer = styled.div`
    margin-left: 10px;
`;

export const LeftLevel = styled.div`
    color: ${(props) => props.theme.textColor.septenary};
    font-size: 13px;
    display: flex;
    align-items: center;
    position: absolute;
    left: -5px;
    top: 0;
    bottom: -33px;
`;

export const RightLevel = styled.div<{ highlight: boolean }>`
    color: ${(props) => (props.highlight ? props.theme.overdrop.textColor.senary : props.theme.textColor.septenary)};
    font-size: 13px;
    display: flex;
    align-items: center;
    position: absolute;
    right: -12px;
    top: 0;
    bottom: -33px;
`;

export const SelectContainer = styled(FlexDivEnd)`
    width: 100%;
`;

export const MarketsValidation = styled(FlexDivCentered)`
    font-size: 13px;
    color: ${(props) => props.theme.warning.textColor.primary};
    border: 2px solid ${(props) => props.theme.warning.borderColor.primary};
    width: 100%;
    border-radius: 5px;
    padding: 5px;
    text-align: center;
`;

export const systemDropdownStyle = {
    menuStyle: { borderRadius: 5, marginTop: 3, zIndex: 4000 },
    controlStyle: { borderRadius: 5, minHeight: '25px', fontSize: '14px', fontWeight: 600 },
    dropdownIndicatorStyle: { padding: '2px' },
    optionStyle: { fontSize: '14px', fontWeight: 600 },
    indicatorSeparatorStyle: { marginBottom: '5px', marginTop: '5px' },
};

export const OddChangeUp = styled.span`
    display: inline-block;
    width: 0;
    height: 0;
    margin-left: 5px;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid ${(props) => props.theme.borderColor.tertiary};

    animation-name: up;
    animation-duration: 0.8s;
    animation-iteration-count: 3;

    @keyframes up {
        0% {
            transform: scale(1) translateY(2px);
            opacity: 1;
        }
        100% {
            transform: scale(0.9) translateY(-3px);
            opacity: 0.5;
        }
    }
`;

export const OddChangeDown = styled.span`
    display: inline-block;
    width: 0;
    height: 0;
    margin-left: 5px;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid ${(props) => props.theme.borderColor.septenary};

    animation-name: down;
    animation-duration: 0.8s;
    animation-iteration-count: 3;

    @keyframes down {
        0% {
            transform: scale(1) translateY(-3px);
            opacity: 1;
        }
        100% {
            transform: scale(0.9) translateY(2px);
            opacity: 0.5;
        }
    }
`;
