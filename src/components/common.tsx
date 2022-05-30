import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivColumnCentered, FlexDivRow } from 'styles/common';

export const BondInfo = styled(FlexDivColumn)`
    font-size: 15px;
    font-weight: 700;
    margin-bottom: 20px;
    text-align: center;
    text-align: justify;
    max-width: 500px;
    ul {
        list-style: initial;
    }
    li {
        line-height: 16px;
        margin-bottom: 8px;
    }
`;

export const Info = styled(FlexDiv)<{ fontSize?: number; marginTop?: number; marginBottom?: number }>`
    font-style: normal;
    font-weight: 400;
    font-size: ${(props) => props.fontSize || 17}px;
    line-height: 20px;
    margin-top: ${(props) => props.marginTop || 0}px;
    margin-bottom: ${(props) => props.marginBottom || 0}px;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
`;

export const InfoLabel = styled.span`
    margin-right: 4px;
`;

export const InfoContent = styled.span`
    font-weight: 700;
`;

export const MainInfo = styled(Info)`
    font-weight: bold;
    font-size: 25px;
    line-height: 35px;
`;

export const Positions = styled(FlexDivColumn)`
    margin-bottom: 20px;
    align-items: center;
`;

export const PositionContainer = styled(FlexDivColumn)`
    margin-bottom: 15px;
    cursor: pointer;
    align-items: center;
    color: ${(props) => props.theme.textColor.primary};
    :hover:not(.disabled):not(.maturity) {
        transform: scale(1.05);
    }
    &.disabled {
        opacity: 0.4;
        cursor: default;
    }
    &.selected {
        color: ${(props) => props.theme.button.textColor.primary};
        background: ${(props) => props.theme.button.background.secondary};
        border: 1px solid ${(props) => props.theme.button.background.secondary};
        i {
            :before {
                color: ${(props) => props.theme.button.textColor.primary};
            }
        }
        div {
            color: ${(props) => props.theme.button.textColor.primary};
        }
    }
    &.maturity:not(.disabled) {
        cursor: default;
        box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.3);
    }
    border: 1px solid ${(props) => props.theme.borderColor.primary};
    padding: 10px 20px;
    border-radius: 15px;
    width: 350px;
    @media (max-width: 575px) {
        width: 100%;
    }
`;

export const Position = styled.span`
    align-self: center;
    display: block;
    position: relative;
`;

export const PositionLabel = styled.span<{ hasPaddingLeft?: boolean }>`
    font-style: normal;
    font-weight: bold;
    font-size: 25px;
    line-height: 30px;
    text-align: center;
    padding-left: ${(props) => (props.hasPaddingLeft ? 35 : 0)}px;
`;

export const Checkmark = styled.span`
    :after {
        content: '';
        position: absolute;
        left: 10px;
        top: 12px;
        width: 8px;
        height: 22px;
        border: solid ${(props) => props.theme.borderColor.primary};
        border-width: 0 4px 4px 0;
        -webkit-transform: rotate(45deg);
        -ms-transform: rotate(45deg);
        transform: rotate(45deg);
    }
`;

export const MatchInfo = styled(FlexDivRow)`
    margin-bottom: 10px;
    align-items: center;
    align-self: center;
    width: 100%;
    justify-content: space-around;
`;

export const MatchInfoColumn = styled(FlexDivColumnCentered)`
    align-items: center;
`;

export const MatchDate = styled.label`
    font-style: normal;
    font-weight: 400;
    font-size: 17px;
    line-height: 20px;
    margin: 16px 11px 0px;
    text-align: center;
    color: ${(props) => props.theme.textColor.primary};
`;

export const MatchVSLabel = styled.label`
    font-style: normal;
    font-weight: 200;
    font-size: 23px;
    line-height: 27px;
    display: flex;
    align-items: center;
    height: 126px;
    color: ${(props) => props.theme.textColor.primary};
`;

export const MatchParticipantImageContainer = styled(FlexDiv)`
    border-radius: 50%;
    border: 3px solid ${(props) => props.theme.borderColor.primary};
    background: ${(props) => props.theme.background.secondary};
    height: 126px;
    width: 126px;
    line-height: 100%;
    align-items: center;
    justify-content: center;
    color: ${(props) => props.theme.textColor.primary};
`;

export const MatchParticipantImage = styled.img`
    border-radius: 50%;
    height: 100px;
    width: 100px;
    line-height: 100%;
    color: ${(props) => props.theme.textColor.primary};
`;

export const MatchParticipantName = styled.label`
    display: flex;
    margin-top: 11px;
    font-style: normal;
    font-weight: 400;
    font-size: 17px;
    text-transform: uppercase;
    line-height: 20px;
    height: 40px;
    align-items: center;
    text-align: center;
    color: ${(props) => props.theme.textColor.primary};
`;

export const OddsLabel = styled.label<{ isUP?: boolean; isDraw?: boolean }>`
    display: flex;
    margin-top: 4px;
    font-style: normal;
    font-weight: 700;
    font-size: 19px;
    line-height: 23px;
    text-transform: uppercase;
    text-align: center;
    color: ${(props) =>
        props.isDraw
            ? props.theme.oddsColor.tertiary
            : props.isUP
            ? props.theme.oddsColor.primary
            : props.theme.oddsColor.secondary};
`;
