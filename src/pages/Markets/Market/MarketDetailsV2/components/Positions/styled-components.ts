import { MAIN_COLORS } from 'constants/ui';
import styled from 'styled-components';
import Button from 'components/Button';
import { FlexDivCentered, FlexDivRow } from 'styles/common';

export const Wrapper = styled(FlexDivRow)`
    background-color: ${MAIN_COLORS.LIGHT_GRAY};
    padding: 15px;
    border-radius: 5px;
`;

export const Header = styled(FlexDivRow)``;

export const TeamOptionContainer = styled(FlexDivRow)<{ disabled?: boolean; selected?: boolean; isResolved?: boolean }>`
    position: relative;
    opacity: ${(props) => (props?.disabled ? '0.4' : '1')};
    background: linear-gradient(180deg, #303656 41.5%, #1a1c2b 100%);
    border-radius: 5px;
    padding: 0 20px;
    justify-content: ${(props) => (!props?.isResolved ? 'space-between' : '')};
    align-items: center;
    cursor: ${(props) => (!props?.isResolved ? 'pointer' : '')};
    border: ${(props) =>
        props?.selected ? `1px solid ${MAIN_COLORS.LIGHT_BLUE}` : `1px solid ${MAIN_COLORS.BORDERS.GRAY}`};
    :hover {
        border: ${(props) =>
            !props?.disabled && !props.isResolved ? `1px solid ${MAIN_COLORS.LIGHT_BLUE}` : undefined};
    }
    @media (max-width: 768px) {
        padding: 13px 10px;
    }
    :not(:last-child) {
        margin-right: 15px;
    }
    flex: 1 1 0;
    width: 0;
    font-weight: 800;
    font-size: 14px;
    line-height: 16px;
    height: 30px;
`;

export const StatusContainer = styled.div<{ isCancelled?: boolean; isPendingResolve?: boolean }>`
    width: 100%;
    display: flex;
    border-radius: 15px;
    ${(props) => (props?.isCancelled ? `background-color: ${MAIN_COLORS.BACKGROUNDS.RED};` : '')};
    ${(props) => (props?.isPendingResolve ? `background-color: ${MAIN_COLORS.LIGHT_GRAY};` : '')};
    padding: 10px 50px;
    justify-content: center;
    align-items: center;
    margin-bottom: 7px;
`;

export const StatusLabel = styled.span<{ isCancelled?: boolean; isPendingResolve?: boolean }>`
    font-weight: 600;
    font-size: 21px;
    line-height: 110%;
    text-transform: uppercase;
    ${(props) => (props?.isCancelled ? `color: ${MAIN_COLORS.TEXT.WHITE};` : '')};
    ${(props) => (props?.isPendingResolve ? `color: ${MAIN_COLORS.TEXT.WHITE};` : '')};
`;

export const InnerContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    width: 33%;
    @media (max-width: 768px) {
        width: 40%;
    }
`;

export const PositionContainer = styled(InnerContainer)`
    width: 30px;
    height: 30px;
    width: 60%;
    @media (max-width: 768px) {
        width: 50%;
    }
`;

export const ClaimableInfoContainer = styled(InnerContainer)`
    @media (max-width: 768px) {
        flex-direction: column;
        font-size: 12px;
    }
`;

export const LiquidityInfoContainer = styled(InnerContainer)`
    @media (max-width: 768px) {
        display: none;
    }
`;

export const Label = styled.span`
    font-weight: 400;
    ::after {
        content: ':';
    }
`;

export const Value = styled.div`
    font-weight: 700;
`;

export const ResultContainer = styled(InnerContainer)`
    @media (max-width: 768px) {
        flex-direction: column;
        font-size: 12px;
    }
`;

export const ClaimButton = styled(Button)<{ claimable?: boolean }>`
    background: ${(props) => props.theme.background.quaternary};
    color: ${(props) => props.theme.textColor.tertiary};
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 5px;
    position: absolute;
    right: 10px;
    font-weight: 700;
    font-size: 15px;
    letter-spacing: 0.025em;
    visibility: ${(props) => (!props.claimable ? 'hidden' : '')};
    @media (max-width: 768px) {
        position: initial;
        font-size: 9px;
        padding: 2px 5px;
        min-height: 12px;
    }
`;

export const Discount = styled(FlexDivCentered)`
    color: #5fc694;
    font-size: 14px;
    position: absolute;
    top: -10px;
    right: -16px;
    font-size: 14px;
    font-weight: 700;
    background-color: ${MAIN_COLORS.LIGHT_GRAY};
    padding: 4px;
`;
