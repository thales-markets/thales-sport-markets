import backgrounBall from 'assets/images/march-madness/background-marchmadness-ball.png';
import backgroundCourt from 'assets/images/march-madness/background-marchmadness-court.svg';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered } from 'styles/common';

export const MATCH_HEIGHT = 52;
export const FIRST_ROUND_MATCH_GAP = 8;
export const SECOND_ROUND_MATCH_GAP = 1 * (MATCH_HEIGHT + FIRST_ROUND_MATCH_GAP) + FIRST_ROUND_MATCH_GAP;
export const SWEET16_ROUND_MATCH_GAP = 3 * (MATCH_HEIGHT + FIRST_ROUND_MATCH_GAP) + FIRST_ROUND_MATCH_GAP;

export const Container = styled.div`
    overflow: auto;
    padding-bottom: 20px;
    ::-webkit-scrollbar {
        height: 10px;
    }
`;

export const BracketsWrapper = styled.div`
    position: relative;
    width: 1350px;
    height: 1010px;
    background-image: url('${backgroundCourt}'), url('${backgrounBall}');
    background-size: auto;
    background-position: -8px 64px, -291px -162px;
    background-repeat: no-repeat;
`;

export const CreateNewBracketWrapper = styled(FlexDivColumnCentered)`
    position: absolute;
    left: calc(50% - 80px);
    margin-top: 20px;
`;

export const CheckboxWrapper = styled.div`
    margin-left: 5px;

    .checkbox {
        font-size: 12px;
    }
`;

export const RowHalf = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
`;

export const LeftQuarter = styled.div`
    display: flex;
`;

export const RightQuarter = styled.div`
    display: flex;
    margin-left: 208px;
`;

export const FirstRound = styled.div`
    display: flex;
    flex-direction: column;
    z-index: 40;
`;

export const SecondRound = styled.div<{ isSideLeft: boolean }>`
    display: flex;
    flex-direction: column;
    ${(props) => `${props.isSideLeft ? 'margin-left: ' : 'margin-right: '}15px;`}
    z-index: 30;
`;

export const Sweet16 = styled.div<{ isSideLeft: boolean }>`
    display: flex;
    flex-direction: column;
    ${(props) => `${props.isSideLeft ? 'margin-left: ' : 'margin-right: '}-24px;`}
    z-index: 11;
`;

export const Elite8 = styled.div<{ isSideLeft: boolean }>`
    display: flex;
    flex-direction: column;
    ${(props) => `${props.isSideLeft ? 'margin-left: ' : 'margin-right: '}-37px;`}
    z-index: 10;
`;

export const SemiFinals = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    height: 38px;
`;

export const Final = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    height: 0;
`;

export const SubmitWrapper = styled(Final)``;

export const SubmitInfo = styled(FlexDivCentered)`
    margin-top: 5px;
`;

export const SubmitInfoText = styled.span`
    font-family: 'Oswald' !important;
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    letter-spacing: 1px;
    color: ${(props) => props.theme.marchMadness.textColor.primary};
`;

export const ButtonWrrapper = styled.div`
    position: relative;
    width: 260px;
    margin-top: 100px;
`;

export const CollateralWrapper = styled(FlexDivCentered)<{ isDisabled: boolean }>`
    position: absolute;
    right: 0;
    top: 0;
    width: 76px;
    height: 32px;
    padding: 3px;
    background: ${(props) => props.theme.marchMadness.button.background.senary};
    border: 2px solid ${(props) => props.theme.marchMadness.borderColor.senary};
    border-radius: 0 4px 4px 0;
    opacity: ${(props) => (props.isDisabled ? '0.5' : '1')};
    z-index: 11;
`;

export const CollateralSeparator = styled.div<{ isDisabled: boolean }>`
    border-left: 2px solid ${(props) => props.theme.marchMadness.borderColor.tertiary};
    height: 22px;
    opacity: ${(props) => (props.isDisabled ? '0.5' : '1')};
    margin-right: 4px;
`;

export const Region = styled.div<{ isSideLeft: boolean; isVertical: boolean }>`
    width: ${(props) => (props.isVertical ? '30px' : '81px')};
    height: ${(props) => (props.isVertical ? '472px' : '52px')};
    border-radius: 5px;
    background: ${(props) => props.theme.marchMadness.background.tertiary};
    ${(props) => `${props.isSideLeft ? 'margin-right: ' : 'margin-left: '}${props.isVertical ? '5' : '1'}`}px;
    ${(props) => (props.isVertical ? 'writing-mode: vertical-rl;' : '')}
    ${(props) => (props.isVertical ? 'text-orientation: upright;' : '')}
    text-align: justify;
    justify-content: center;
    display: flex;
    align-items: center;
    font-family: 'NCAA' !important;
    font-style: normal;
    font-weight: 400;
    font-size: ${(props) => (props.isVertical ? '30px' : '20px')};
    color: ${(props) => props.theme.marchMadness.textColor.primary};
    letter-spacing: ${(props) => (props.isVertical ? '15px' : '2px')};
}
`;

export const RowStats = styled.div`
    width: 1322px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin: 0 14px;
`;

export const RowHeader = styled.div`
    width: 1252px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin: 0 49px 6px 49px;
`;

export const RoundName = styled.div`
    width: 129px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Oswald' !important;
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 14px;
    text-align: center;
    text-transform: uppercase;
    color: ${(props) => props.theme.marchMadness.textColor.primary};
    margin-top: 14px;
`;

export const MyStats = styled.div`
    display: flex;
    width: 304px;
    height: 80px;
    background: ${(props) => props.theme.marchMadness.background.tertiary};
    border-radius: 8px;
`;

export const StatsColumn = styled.div<{ width?: string; margin?: string; justify?: string }>`
    display: flex;
    flex-direction: column;
    gap: 10px;
    justify-content: ${(props) => (props.justify ? props.justify : 'center')};
    ${(props) => (props.width ? `width: ${props.width};` : '')}
    ${(props) => (props.margin ? `margin: ${props.margin};` : '')}
`;

export const StatsRow = styled.div<{ justify?: string; margin?: string }>`
    display: flex;
    flex-direction: row;
    justify-content: ${(props) => (props.justify ? props.justify : 'space-between')};
    ${(props) => (props.margin ? `margin: ${props.margin};` : '')}
`;

export const StatsIcon = styled.i`
    margin-right: 5px;
`;

export const StatsText = styled.span<{ fontWeight?: number; fontSize?: number; lineHeight?: number; margin?: string }>`
    font-family: ${(props) =>
        !props.fontWeight || props.fontWeight < 600
            ? props.theme.fontFamily.secondary
            : props.theme.fontFamily.primary};
    font-style: normal;
    font-weight: ${(props) => (props.fontWeight ? props.fontWeight : '400')};
    font-size: ${(props) => (props.fontSize ? props.fontSize : '16')}px;
    line-height: ${(props) => (props.lineHeight ? props.lineHeight : '14')}px;
    text-transform: uppercase;
    color: ${(props) => props.theme.marchMadness.textColor.primary};
    ${(props) => (props.margin ? `margin: ${props.margin};` : '')}
`;

export const MyTotalScore = styled.div`
    width: 1006px;
    height: 80px;
    display: flex;
    background: ${(props) => props.theme.marchMadness.background.tertiary};
    border-radius: 8px;
`;

export const DropdownContainer = styled(FlexDivColumnCentered)`
    margin: 0 10px;
    z-index: 100;
`;

export const WildCardsContainer = styled.div`
    width: 1350px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: -38px;
`;

export const WildCardsHeader = styled.div`
    width: 436px;
    height: 35px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid ${(props) => props.theme.marchMadness.borderColor.senary};
    border-radius: 5px;
    margin-bottom: 6px;
    font-family: 'NCAA' !important;
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 23px;
    letter-spacing: 5px;
    text-transform: uppercase;
    color: ${(props) => props.theme.marchMadness.textColor.primary};
`;

export const WildCardsRow = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-bottom: 5px;
`;

export const VerticalLine = styled.div`
    border-left: 2px solid ${(props) => props.theme.marchMadness.borderColor.quaternary};
    height: 70px;
    margin: 4px 15px;
`;

export const ShareWrapper = styled(Final)``;

export const Share = styled.div<{ marginTop: number }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: ${(props) => props.marginTop}px;
`;

export const ShareText = styled.span<{ disabled?: boolean }>`
    font-family: 'Oswald' !important;
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 14px;
    text-transform: uppercase;
    color: ${(props) => props.theme.marchMadness.textColor.primary};
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
    opacity: ${(props) => (props.disabled ? '0.4' : '1')};
`;
