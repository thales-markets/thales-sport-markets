import styled from 'styled-components';
import { Tooltip, withStyles } from '@material-ui/core';
import { FlexDiv, FlexDivCentered } from 'styles/common';

export const RowSummary = styled.div<{ columnDirection?: boolean }>`
    display: flex;
    align-items: center;
    ${(props) => (props.columnDirection ? `flex-direction: column;` : '')}
`;

export const RowContainer = styled(FlexDiv)`
    align-items: center;
    width: 100%;
`;

export const SummaryLabel = styled.span<{ alignRight?: boolean }>`
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

export const SummaryValue = styled.span<{ isInfo?: boolean; isCurrency?: boolean; isHidden?: boolean }>`
    font-weight: 700;
    font-size: 11px;
    line-height: 12px;
    letter-spacing: 0.025em;
    display: ${(props) => (props.isHidden ? 'none' : '')};
    color: ${(props) => (props.isInfo || props.isCurrency ? props.theme.status.win : props.theme.textColor.primary)};
    margin-left: ${(props) => (props.isInfo ? 'auto' : '5px')};
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

export const InfoTooltip = withStyles(() => ({
    tooltip: {
        minWidth: '100%',
        marginBottom: '7px',
        backgroundColor: '#303656',
        color: '#FAC439',
        border: '1.5px solid #FAC439',
        borderRadius: '2px',
        fontSize: '9px',
        lineHeight: '12px',
        textTransform: 'uppercase',
    },
    arrow: {
        '&:before': {
            border: '1.5px solid #FAC439',
            backgroundColor: '#303656',
            boxSizing: 'border-box',
        },
        width: '11px',
        height: '8px',
        bottom: '-2px !important',
    },
}))(Tooltip);

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
    color: ${(props) => props.theme.status.loss};
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
    font-size: ${(props) => (props.fontSize ? props.fontSize : '20px')};
    color: ${(props) => (props.color ? props.color : ' #ffffff')};
    cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
    opacity: ${(props) => (props.disabled ? '0.4' : '1')};
    ${(props) => (props.padding ? `padding: ${props.padding};` : '')}
    &:before {
        font-family: ExoticIcons !important;
        content: '\\005C';
    }
`;

export const defaultButtonProps = {
    width: '100%',
    margin: '10px 0 0 0',
    padding: '5px 30px',
};
