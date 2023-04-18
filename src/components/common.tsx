import styled from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumn, FlexDivColumnCentered, FlexDivRow } from 'styles/common';

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
    align-items: center;
    align-self: center;
    width: 100%;
    justify-content: space-around;
    cursor: pointer;
`;

export const MatchInfoColumn = styled(FlexDivColumnCentered)<{ isApexTopGame?: boolean }>`
    align-items: center;
    height: ${(props) => (props.isApexTopGame ? 'auto' : '249px')};
    justify-content: flex-start;
    &:nth-child(odd) {
        margin-top: ${(props) => (props.isApexTopGame ? 0 : 40)}px;
    }
    cursor: pointer;
    position: relative;
`;

export const ApexMatchInfoColumn = styled(FlexDivColumnCentered)`
    align-items: center;
    justify-content: flex-start;
    cursor: pointer;
    position: relative;
`;

export const MatchDate = styled.label`
    font-style: normal;
    font-weight: 400;
    font-size: 17px;
    line-height: 20px;
    text-align: center;
    overflow: hidden;
    width: 100px;
    white-space: nowrap;
    color: ${(props) => props.theme.textColor.primary};
    cursor: pointer;
`;

export const MarketInfoContainer = styled.div<{ marginTop?: number }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: ${(props) => props.marginTop || 0}px;
`;

export const MatchInfoLabel = styled.label<{
    isMaturedMarket?: boolean;
    claimable?: boolean;
    isCanceledMarket?: boolean;
    pendingResolution?: boolean;
    isPaused?: boolean;
    isApexTopGame?: boolean;
    marginTop?: number;
}>`
    font-style: normal;
    font-weight: 400;
    font-size: 17px;
    line-height: 20px;
    text-align: center;
    overflow: hidden;
    width: ${(props) => (props.pendingResolution ? 'fit-content' : '100px')};
    white-space: nowrap;
    color: ${(props) =>
        props.isMaturedMarket || props.isCanceledMarket || props.isPaused
            ? props.theme.oddsColor.secondary
            : props.claimable
            ? props.theme.textColor.quaternary
            : props.theme.textColor.primary};
    cursor: pointer;
    position: ${(props) => (props.pendingResolution && !props.isApexTopGame ? 'absolute' : '')};
    text-transform: uppercase;
    margin-top: ${(props) => props.marginTop || 0}px;
`;

export const MatchVSLabel = styled.label<{
    pendingResolution?: boolean;
}>`
    font-style: normal;
    font-weight: 200;
    font-size: 23px;
    line-height: 27px;
    display: flex;
    align-items: center;
    height: 126px;
    @media (max-width: 400px) {
        height: 100px;
    }
    color: ${(props) => props.theme.textColor.primary};
    cursor: pointer;
    margin-top: ${(props) => (props.pendingResolution ? '22px' : '')};
`;

export const BetTypeInfo = styled.label`
    font-style: normal;
    font-weight: 200;
    font-size: 18px;
    line-height: 20px;
    display: flex;
    align-items: center;
    width: 200px;
    margin-left: 10px;
    margin-top: 10px;
    text-align: center;
    color: ${(props) => props.theme.textColor.primary};
    cursor: pointer;
    @media (max-width: 575px) {
        width: auto;
        font-size: 15px;
        line-height: 18px;
    }
`;

export const MatchParticipantImageContainer = styled(FlexDiv)<{
    isWinner?: boolean;
    finalResult?: number;
    isCanceled?: boolean;
    isApexTopGame?: boolean;
}>`
    border-radius: 50%;
    border: 3px solid
        ${(props) =>
            props.isWinner && props.finalResult !== 0
                ? props.theme.winnerColors.primary
                : props.finalResult === 3
                ? props.theme.winnerColors.tertiary
                : props.isCanceled
                ? props.theme.oddsColor.secondary
                : props.theme.borderColor.primary};
    background: transparent;
    opacity: ${(props) =>
        props.finalResult && props.finalResult !== 3 && !props.isWinner && !props.isApexTopGame ? '0.5' : ''};
    height: 126px;
    width: 126px;
    line-height: 100%;
    align-items: center;
    justify-content: center;
    color: ${(props) => props.theme.textColor.primary};
    @media (max-width: 400px) {
        height: 100px;
        width: 100px;
    }
`;

export const MatchParticipantImage = styled.img`
    border-radius: 50%;
    height: 100px;
    width: 100px;
    @media (max-width: 400px) {
        height: 80px;
        width: 80px;
    }
    line-height: 100%;
    color: ${(props) => props.theme.textColor.primary};
`;

export const MatchParticipantName = styled.label<{
    isTwoPositioned?: boolean;
    glow?: boolean;
    glowColor?: string;
    winningColor?: string;
}>`
    display: flex;
    visibility: ${(props) => (props.isTwoPositioned ? 'hidden' : '')};
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    text-transform: uppercase;
    line-height: 20px;
    height: 40px;
    align-items: center;
    text-align: center;
    margin-top: 5px;
    cursor: pointer;
    color: ${(props) =>
        props?.winningColor ? props?.winningColor : props?.glow ? props.glowColor : props.theme.textColor.primary};
    text-shadow: ${(props) => (props?.glow ? '0 0 15px ' + props.glowColor : '')};
`;

export const OddsLabel = styled.label<{
    homeOdds?: boolean;
    isDraw?: boolean;
    isTwoPositioned?: boolean;
    noOdds?: boolean;
}>`
    display: flex;
    flex-direction: row;
    visibility: ${(props) => (props.isTwoPositioned || props.noOdds ? 'hidden' : '')};
    margin-top: 4px;
    font-style: normal;
    font-weight: 700;
    font-size: 19px;
    line-height: 23px;
    text-transform: uppercase;
    text-align: center;
    color: ${(props) =>
        props.isDraw
            ? props.theme.oddsColor.quaternary
            : props.homeOdds
            ? props.theme.oddsColor.primary
            : props.theme.oddsColor.secondary};
    cursor: pointer;
`;

export const OddsLabelSceleton = styled.div<{ isTwoPositioned?: boolean }>`
    display: flex;
    visibility: ${(props) => (props.isTwoPositioned ? 'hidden' : '')};
    margin-top: 4px;
    height: 23px;
    width: 60px;
    background: ${(props) => props.theme.background.primary};
    color: ${(props) => props.theme.background.primary};
    border-radius: 14px;
    @keyframes shimmer {
        100% {
            -webkit-mask-position: left;
        }
    }
    -webkit-mask: linear-gradient(-60deg, #000 30%, #0005, #000 70%) right/300% 100%;
    background-repeat: no-repeat;
    animation: shimmer 2.5s infinite;
`;

export const WinnerLabel = styled.label<{ isWinning: boolean; finalResult?: number }>`
    display: flex;
    visibility: ${(props) => (!props.isWinning ? 'hidden' : '')};
    margin-top: 4px;
    font-style: normal;
    font-weight: 700;
    font-size: 19px;
    line-height: 23px;
    text-transform: uppercase;
    text-align: center;
    color: ${(props) =>
        props.finalResult == 3 ? props.theme.winnerColors.secondary : props.theme.winnerColors.primary};
    cursor: pointer;
`;

export const ScoreLabel = styled.label<{ winningColor?: string }>`
    display: flex;
    font-style: normal;
    font-weight: 700;
    font-size: 30px;
    line-height: 35px;
    align-items: center;
    color: ${(props) => (props.winningColor ? props.winningColor : props.theme.textColor.primary)};
    cursor: pointer;
`;

export const ProfitLabel = styled.label<{ claimable: boolean }>`
    display: flex;
    visibility: ${(props) => (!props.claimable ? 'hidden' : '')};
    font-style: normal;
    font-weight: 600;
    font-size: 17px;
    line-height: 20px;
    text-transform: uppercase;
    text-align: center;
    cursor: pointer;
    margin-top: 37px;
`;

export const Discount = styled(FlexDivCentered)<{ visible?: boolean; color?: string }>`
    color: ${(props) => (props?.color ? props.color : '')};
    font-size: 14px;
    margin-left: 11px;
    visibility: ${(props) => (props?.visible ? 'visible' : 'hidden')};
`;
