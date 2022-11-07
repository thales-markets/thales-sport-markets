import styled from 'styled-components';
import { FlexDivColumnCentered } from 'styles/common';

export const Container = styled.div`
    position: relative;
    margin-bottom: 80px;
    width: 700px;
    @media (max-width: 768px) {
        width: 100%;
    }
`;

export const EligibilityContainer = styled(FlexDivColumnCentered)`
    align-items: center;
    max-width: 100%;
    position: relative;
    z-index: 1;
    margin-top: 25px;
`;

export const EligibilityText = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    font-style: normal;
    font-weight: 700;
    font-size: 22px;
    line-height: 150%;
    letter-spacing: 0.05em;
    color: #04cfb6;
    position: absolute;
    font-family: 'AtmaBold' !important;
    @media (max-width: 768px) {
        padding: 15px;
        font-size: 16px;
        text-align: center;
    }
`;

export const InfoContainer = styled.div`
    position: relative;
    max-width: 100%;
    margin-top: 25px;
    z-index: 1;
    @media (max-width: 768px) {
        margin-top: 15px;
    }
`;

export const InfoContent = styled.div<{ isMobile?: boolean }>`
    position: ${(props) => (props.isMobile ? 'static' : 'absolute')};
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    padding: ${(props) => (props.isMobile ? '10px' : '50px')};
    justify-content: space-around;
    text-align: justify;
    font-size: ${(props) => (props.isMobile ? '13px' : '16px')};
`;

export const InfoText = styled.div<{ isMobile?: boolean }>`
    font-style: normal;
    font-weight: 400;
    font-size: ${(props) => (props.isMobile ? '14px' : '16px')};
    line-height: 150%;
    letter-spacing: 0.025em;
    color: #ffffff;
    margin-bottom: 10px;
    @media (max-width: 768px) {
        font-size: 13px;
    }
`;

export const ButtonContainer = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 50px;
    @media (max-width: 768px) {
        margin-top: 20px;
    }
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
    @media (max-width: 768px) {
        padding: 8px 10px;
        font-size: 13px;
    }
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
    z-index: 1;
    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
    @media (max-width: 768px) {
        padding: 8px 10px;
        font-size: 13px;
    }
`;

export const SymbolsContainer = styled.div`
    position: absolute;
    right: 0;
    top: 0;
    transform: translateY(30%);
`;

export const MascotContainer = styled.div`
    position: absolute;
    left: 0;
    top: 0;
    left: -20%;
    top: 250px;
    z-index: 1;
    @media (max-width: 768px) {
        display: none;
    }
`;

export const ListItemContainer = styled.div`
    display: flex;
    margin-top: 10px;
    align-items: center;
`;

export const ListItem = styled.span`
    margin-left: 10px;
    width: 90%;
    & > a {
        text-decoration: underline;
        color: white;
    }
    & > a:hover {
        text-decoration: underline;
        color: #04cfb6;
    }
`;

export const IncentivesTitle = styled.span`
    font-weight: 700;
    font-size: 17px;
    line-height: 150%;
    letter-spacing: 0.025em;
    color: #04cfb6;
`;

export const GroupsContainer = styled.div``;

export const MintButtonContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    padding: 10px 30px;
`;

export const MintButton = styled.button`
    background: #04cfb6;
    border-radius: 3.6;
    color: rgba(0, 0, 0, 0.5);
    font-weight: 700;
    font-size: 12px;
    line-height: 16px;
`;

export const GroupInfoContainer = styled.div`
    position: relative;
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    align-items: center;
    z-index: 1;
`;

export const GroupLetter = styled.span<{ color: string }>`
    position: absolute;
    font-weight: 700;
    font-size: 25px;
    line-height: 150%;
    text-align: center;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: ${(props) => props.color};
    left: 4%;
    top: 50%;
    transform: translateY(-50%);
`;

export const TeamContainer = styled.div<{ index: number; selected: boolean }>`
    position: absolute;
    left: ${(props) => (props.index + 1) * 21 - 10}%;
    width: 18%;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    border: ${(props) => (props.selected ? '4px solid #ff004b' : '4px solid #6d152e')};
    box-shadow: ${(props) => (props.selected ? '0px 0px 7px 5px #ac0033' : 'none')};
    :hover {
        cursor: pointer;
        border: 4px solid #ff004b;
        box-shadow: 0px 0px 7px 5px #ac0033;
    }
`;

export const TeamImage = styled.img`
    width: 100%;
    border-radius: 50%;
`;

export const TeamNameWrapper = styled.div`
    position: relative;
`;

export const TeamName = styled.span<{ index: number }>`
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: -22px;
    text-align: center;
    width: 100%;
    @media (max-width: 768px) {
        font-size: 11px;
        bottom: -20px;
    }
`;

export const ArrowContainer = styled.div`
    position: absolute;
    right: 4%;
    top: 50%;
    transform: translateY(-35%);
    cursor: pointer;
`;

export const TeamFlagContainer = styled.div<{ index: number }>`
    position: absolute;
    left: ${(props) => (props.index + 1) * 21 - 10}%;
    width: 18%;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
`;

export const TeamFlagImage = styled.img<{ selected: boolean }>`
    width: 40%;
    box-shadow: ${(props) => (props.selected ? '0px 0px 7px 4px #ac0033' : 'none')};
`;

export const HeaderContainer = styled(FlexDivColumnCentered)`
    margin-top: 50px;
    align-items: center;
    max-width: 100%;
    position: relative;
    @media (max-width: 768px) {
        margin-top: 20px;
    }
`;

export const HeaderTitle = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-style: normal;
    font-weight: 700;
    font-size: 22px;
    line-height: 150%;
    letter-spacing: 0.05em;
    color: white;
    position: absolute;
    & > span {
        font-family: 'AtmaBold' !important;
    }
    @media (max-width: 768px) {
        font-size: 18px;
    }
`;

export const HeaderTextContainer = styled.div`
    padding: 20px 10px;
    width: 90%;
    margin: auto;
    letter-spacing: 0.05em;
`;

export const TabsContainer = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 10px 43px;
    @media (max-width: 768px) {
        padding: 10px 15px;
    }
`;

export const Tab = styled.button<{ selected: boolean }>`
    padding: 8px 40px;
    font-weight: 600;
    font-size: 16px;
    line-height: 14px;
    background: ${(props) => (props.selected ? '#04cfb6' : 'transparent')};
    color: white;
    border: 2px solid ${(props) => (!props.selected ? '#04CFB6' : 'transparent')};
    cursor: pointer;
    z-index: 1;
    width: 45%;
    &:hover {
        background: #04cfb6;
        border: transparent;
    }
    @media (max-width: 768px) {
        padding: 8px 20px;
        font-size: 13px;
    }
`;
