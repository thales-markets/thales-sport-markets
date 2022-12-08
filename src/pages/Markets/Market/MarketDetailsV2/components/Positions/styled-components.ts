import { MAIN_COLORS } from 'constants/ui';
import styled from 'styled-components';
import Button from 'components/Button';

export const TeamOptionContainer = styled.div<{ disabled?: boolean; selected?: boolean; isResolved?: boolean }>`
    width: 100%;
    display: flex;
    flex-direction: row;
    opacity: ${(props) => (props?.disabled ? '0.4' : '1')};
    background-color: ${(props) => (props?.disabled ? MAIN_COLORS.DISABLED_GRAY : MAIN_COLORS.LIGHT_GRAY)};
    border-radius: 15px;
    padding: 10px 50px;
    justify-content: ${(props) => (!props?.isResolved ? 'space-between' : '')};
    align-items: center;
    margin-bottom: 7px;
    cursor: ${(props) => (!props?.isResolved ? 'pointer' : '')};
    border: ${(props) => (props?.selected ? `0.5px solid ${MAIN_COLORS.LIGHT_BLUE}` : '0.5px solid transparent')};
    :hover {
        border: ${(props) =>
            !props?.disabled && !props.isResolved ? `0.5px solid ${MAIN_COLORS.LIGHT_BLUE}` : undefined};
    }
    @media (max-width: 768px) {
        padding: 13px 10px;
    }
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

export const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
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

export const Value = styled.span`
    font-weight: 700;
    margin-left: 5px;
    margin-right: 5px;
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
