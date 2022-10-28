import styled from 'styled-components';
import { FlexDivColumnCentered } from 'styles/common';

export const Container = styled.div`
    margin: 80px 0;
    width: 700px;
    @media (max-width: 768px) {
        width: 100%;
    }
`;

export const EligibilityContainer = styled(FlexDivColumnCentered)`
    align-items: center;
    max-width: 100%;
    position: relative;
`;

export const EligibilityText = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    font-style: normal;
    font-weight: 700;
    font-size: 22px;
    line-height: 150%;
    letter-spacing: 0.025em;
    color: #04cfb6;
    position: absolute;
`;

export const InfoContainer = styled.div`
    position: relative;
    max-width: 100%;
    margin-top: 25px;
    z-index: 1;
`;

export const InfoContent = styled.div`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    padding: 50px;
    justify-content: space-around;
`;

export const InfoText = styled.div`
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 150%;
    letter-spacing: 0.025em;
    color: #ffffff;
    margin-bottom: 10px;
`;

export const ButtonContainer = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 50px;
`;

export const GoToTwitterContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: 30px;
`;

export const GetThalesButton = styled.button`
    background: ${(props) => props.theme.button.background.secondary};
    border: 2px solid ${(props) => props.theme.button.borderColor.secondary};
    color: ${(props) => props.theme.button.textColor.quaternary};
    border-radius: 3.5px;
    padding: 8px 40px;
    font-weight: 600;
    font-size: 16px;
    line-height: 14px;
    cursor: pointer;
`;

export const StyledButton = styled.button`
    padding: 8px 40px;
    font-weight: 600;
    font-size: 16px;
    line-height: 14px;
    background: #04cfb6;
    border-radius: 3.5px;
    color: #8e2443;
    border: transparent;
    cursor: pointer;
`;

export const SymbolsContainer = styled.div`
    position: absolute;
    right: 0;
    top: 0;
    transform: translateY(30%);
`;

export const ListItemContainer = styled.div`
    display: flex;
    margin-top: 10px;
    align-items: center;
`;

export const ListItem = styled.span`
    margin-left: 10px;
`;

export const IncentivesTitle = styled.span`
    font-weight: 700;
    font-size: 17px;
    line-height: 150%;
    letter-spacing: 0.025em;
    color: #04cfb6;
`;
