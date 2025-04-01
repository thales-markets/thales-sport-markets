import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered, FlexDivSpaceBetween } from 'styles/common';

export const Container = styled(FlexDivColumnCentered)`
    max-width: 420px;
    align-items: center;
`;

export const Title = styled.span`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 25px;
    font-weight: 500;
    line-height: 30px;
    letter-spacing: 0.025em;
    text-align: center;
    margin-top: 10px;
    text-transform: uppercase;
`;

export const Description = styled.span`
    width: 100%;
    color: ${(props) => props.theme.textColor.primary};
    font-size: 14px;
    font-weight: 600;
    line-height: 16px;
    letter-spacing: 0.025em;
    text-align: center;
    margin-top: 30px;
    @media (max-width: 575px) {
        font-size: 12px;
    }
    p {
        margin-bottom: 15px;
        text-align: start;
    }
`;

export const InfoDescription = styled(Description)`
    margin-top: 0px;
    color: ${(props) => props.theme.textColor.secondary};
    font-weight: 600;
`;

export const InputContainer = styled.div`
    position: relative;
    width: 100%;
    margin-top: 20px;
    @media (max-width: 575px) {
        margin-top: 20px;
    }
`;

export const ButtonContainer = styled(FlexDivCentered)`
    width: 100%;
    margin-top: 30px;
`;

export const CloseIcon = styled.i`
    color: ${(props) => props.theme.textColor.secondary};
    font-size: 14px;
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
`;

export const TipLink = styled.a`
    color: ${(props) => props.theme.link.textColor.primary};
    &:hover {
        text-decoration: underline;
    }
`;

export const Summary = styled(FlexDivSpaceBetween)`
    width: 100%;
    margin-top: 10px;
    margin-bottom: 10px;
    background: ${(props) => props.theme.background.primary};
    padding: 10px;
    border-radius: 8px;
`;

export const SummaryLabel = styled.span`
    display: flex;
    align-items: center;
    font-weight: 500;
    font-size: 16px;
    line-height: 20px;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.secondary};
    @media (max-width: 950px) {
        line-height: 24px;
    }
`;

export const SummaryValue = styled.span`
    font-weight: 600;
    font-size: 16px;
    line-height: 20px;
    letter-spacing: 0.025em;
    color: ${(props) => props.theme.textColor.secondary};
    margin-left: auto;
`;

export const ThalesIcon = styled.i`
    font-size: 92px;
    font-weight: 400;
    line-height: 25px;
    text-transform: none;
    margin-top: -4px;
`;

export const OvertimeIcon = styled.i`
    font-size: 69px;
    font-weight: 400;
    line-height: 20px;
    text-transform: none;
    margin-top: -8px;
`;
