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
    box-shadow: ${(_props) => (_props?.selected ? `${MAIN_COLORS.SHADOWS.POSITION_HOVER}` : '')};
    :hover {
        box-shadow: ${MAIN_COLORS.SHADOWS.POSITION_HOVER};
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
