import { MAIN_COLORS } from 'constants/ui';
import styled from 'styled-components';

export const TeamOptionContainer = styled.div<{ disabled?: boolean; selected?: boolean }>`
    width: 100%;
    display: flex;
    flex-direction: row;
    opacity: ${(_props) => (_props?.disabled ? '0.4' : '1')};
    background-color: ${(_props) => (_props?.disabled ? MAIN_COLORS.DISABLED_GRAY : MAIN_COLORS.LIGHT_GRAY)};
    border-radius: 15px;
    padding: 10px 50px;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 7px;
    cursor: pointer;
    border: ${(_props) => (_props?.selected ? `0.5px solid ${MAIN_COLORS.LIGHT_BLUE}` : '0.5px solid transparent')};
    :hover {
        border: ${(_props) => (!_props?.disabled ? `0.5px solid ${MAIN_COLORS.LIGHT_BLUE}` : undefined)};
    }
`;

export const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

export const InnerContrainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    width: 33%;
`;

export const PositionContainer = styled(InnerContrainer)`
    @media (max-width: 768px) {
        width: 50%;
    }
`;

export const LiquidityInfoContainer = styled(InnerContrainer)`
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
