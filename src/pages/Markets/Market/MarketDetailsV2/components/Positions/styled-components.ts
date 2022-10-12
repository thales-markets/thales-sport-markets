import { MAIN_COLORS } from 'constants/ui';
import styled from 'styled-components';
import Button from 'components/Button';

export const TeamOptionContainer = styled.div<{ disabled?: boolean; selected?: boolean; isResolved?: boolean }>`
    width: 100%;
    display: flex;
    flex-direction: row;
    opacity: ${(_props) => (_props?.disabled ? '0.4' : '1')};
    background-color: ${(_props) => (_props?.disabled ? MAIN_COLORS.DISABLED_GRAY : MAIN_COLORS.LIGHT_GRAY)};
    border-radius: 15px;
    padding: 10px 50px;
    justify-content: ${(_props) => (!_props?.isResolved ? 'space-between' : '')};
    align-items: center;
    margin-bottom: 7px;
    cursor: ${(_props) => (!_props?.isResolved ? 'pointer' : '')};
    border: ${(_props) => (_props?.selected ? `0.5px solid ${MAIN_COLORS.LIGHT_BLUE}` : '0.5px solid transparent')};
    :hover {
        border: ${(_props) =>
            !_props?.disabled && !_props.isResolved ? `0.5px solid ${MAIN_COLORS.LIGHT_BLUE}` : undefined};
    }
    @media (max-width: 500px) {
        padding: 13px 23px;
    }
`;

export const StatusContainer = styled.div<{ isCancelled?: boolean; isPendingResolve?: boolean }>`
    width: 100%;
    display: flex;
    border-radius: 15px;
    ${(_props) => (_props?.isCancelled ? `background-color: ${MAIN_COLORS.BACKGROUNDS.RED};` : '')};
    ${(_props) => (_props?.isPendingResolve ? `background-color: ${MAIN_COLORS.LIGHT_GRAY};` : '')};
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
    ${(_props) => (_props?.isCancelled ? `color: ${MAIN_COLORS.TEXT.WHITE};` : '')};
    ${(_props) => (_props?.isPendingResolve ? `color: ${MAIN_COLORS.TEXT.WHITE};` : '')};
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
`;

export const PositionContainer = styled(InnerContainer)`
    width: 30px;
    height: 30px;
    width: 60%;
    @media (max-width: 768px) {
        width: 65%;
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
`;

export const ResultContainer = styled(InnerContainer)``;

export const ClaimButton = styled(Button)<{ claimable?: boolean }>`
    background: ${(props) => props.theme.background.quaternary};
    color: ${(props) => props.theme.textColor.tertiary};
    margin-right: 20px;
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 5px;
    font-weight: 700;
    font-size: 15px;
    letter-spacing: 0.025em;
    visibility: ${(props) => (!props.claimable ? 'hidden' : '')};
`;
