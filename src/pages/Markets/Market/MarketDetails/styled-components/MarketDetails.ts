import styled from 'styled-components';
import { Tooltip, withStyles } from '@material-ui/core';
import {
    FlexDiv,
    FlexDivCentered,
    FlexDivColumn,
    FlexDivColumnCentered,
    FlexDivRow,
} from '../../../../../styles/common';

export const MarketContainer = styled(FlexDivColumn)`
    margin-top: 20px;
    box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.35);
    border-radius: 25px;
    width: 100%;
    padding: 0 60px 30px 60px;
    background: ${(props) => props.theme.background.secondary};
    flex: initial;
    @media (max-width: 768px) {
        padding: 10px 10px 20px 10px;
    }
`;

export const StatusSourceContainer = styled(FlexDivRow)`
    align-items: end;
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: center;
    }
`;

export const StatusSourceInfo = styled(FlexDivRow)`
    width: 146px;
`;

export const MatchInfo = styled(FlexDivRow)`
    margin-bottom: 10px;
    align-items: center;
    align-self: center;
    width: 50%;
    justify-content: space-around;
    @media (max-width: 768px) {
        width: 90%;
        margin-top: 70px;
    }
`;

export const MatchInfoColumn = styled(FlexDivColumnCentered)`
    align-items: center;
    align-self: flex-start;
`;

export const MatchDate = styled.label`
    font-style: normal;
    font-weight: 400;
    font-size: 17px;
    line-height: 20px;
    text-align: center;
    overflow: hidden;
    white-space: nowrap;
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
    @media (max-width: 400px) {
        height: 100px;
    }
    color: ${(props) => props.theme.textColor.primary};
    cursor: pointer;
    margin-top: -20px;
`;

export const BetTypeInfo = styled.label`
    font-style: normal;
    font-weight: 200;
    font-size: 20px;
    line-height: 22px;
    display: flex;
    align-items: center;
    width: 300px;
    margin-left: 10px;
    margin-top: 10px;
    text-align: center;
    color: ${(props) => props.theme.textColor.primary};
    cursor: pointer;
    @media (max-width: 575px) {
        width: auto;
    }
`;

export const RaceNameLabel = styled.label`
    font-style: normal;
    font-weight: 200;
    font-size: 14px;
    line-height: 18px;
    display: flex;
    align-items: center;
    color: ${(props) => props.theme.textColor.primary};
    margin-top: -40px;
    text-align: center;
    @media (max-width: 400px) {
        font-size: 12px;
        margin-top: -35px;
    }
`;

export const OddsContainer = styled(FlexDivRow)`
    margin: 50px 72px 0 72px;
    @media (max-width: 1440px) {
        margin: 50px 0 0 0;
    }
    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

export const Pick = styled(FlexDivColumn)<{ selected?: boolean }>`
    overflow: hidden;
    position: relative;
    cursor: pointer;
    padding: 20px 5px;
    margin: 0 30px;
    text-align: center;
    border-radius: 10px;
    border: ${(props) => (props.selected ? '2px solid #5f6180' : '2px solid #484a6a')};
    box-shadow: ${(props) => (props.selected ? '0px 4px 24px 9px rgba(0, 0, 0, 0.25)' : '')};
    justify-content: space-between;
    &:hover {
        border: 2px solid #5f6180;
        box-shadow: 0px 4px 24px 9px rgba(0, 0, 0, 0.25);
    }
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    margin-bottom: 10px;
`;

export const Option = styled.div<{ color: string }>`
    color: ${(props) => props.color};
    font-weight: 600;
    font-size: 30px;
    line-height: 43px;
`;

export const OptionTeamName = styled.div`
    color: white;
    font-size: 20px;
    line-height: 27px;
    padding-bottom: 20px;
`;

export const InfoRow = styled(FlexDivRow)`
    justify-content: center;
`;

export const InfoTitle = styled.div`
    font-family: 'RobotoThin' !important;
    font-size: 18px;
    line-height: 23px;
    margin-right: 5px;
    text-transform: uppercase;
`;

export const InfoValue = styled.div`
    font-weight: 600;
    font-size: 18px;
    line-height: 23px;
    display: flex;
    flex-direction: row;
`;

export const SliderContainer = styled(FlexDivRow)`
    display: flex;
    position: relative;
    flex-direction: column;
    margin: 20px 100px 0 100px;
    @media (max-width: 768px) {
        margin: 20px 20px 0 20px;
    }
`;

export const Slider = styled.input`
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    background: linear-gradient(90deg, #47b687 3.28%, #f7b40a 52.05%, #c3244a 96.85%);
    border-radius: 2px;
    outline: none;
    margin-bottom: 20px;
    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 21px;
        height: 21px;
        background: white;
        border-radius: 50%;
        cursor: pointer;
    }
    &::-moz-range-thumb {
        width: 21px;
        height: 21px;
        background: white;
        border-radius: 50%;
        cursor: pointer;
    }
`;

export const SliderInfo = styled(FlexDivRow)`
    justify-content: flex-end;
`;

export const SliderInfoTitle = styled.div`
    font-family: 'RobotoThin' !important;
    font-size: 18px;
    line-height: 23px;
    margin-left: 5px;
`;

export const SliderInfoValue = styled.div`
    font-weight: 600;
    font-size: 18px;
    line-height: 23px;
    padding-left: 5px;
    @media (max-width: 768px) {
        font-size: 15px;
    }
`;

export const AmountToBuyContainer = styled.div`
    position: relative;
`;

export const AmountToBuyInput = styled.input`
    margin: 10px 0;
    border: 3px solid #3accfa;
    width: 215px;
    border-radius: 5px;
    text-align: center;
    font-weight: bold;
    font-size: 18px;
    @media (max-width: 768px) {
        width: 130px;
        font-size: 15px;
    }
`;

export const SubmitButton = styled.button`
    background: #5fc694;
    border-radius: 5px;
    margin: 20px 100px;
    font-size: 20px;
    line-height: 23px;
    color: #303656;
    width: 100%;
    border: none;
    padding: 7px;
    cursor: pointer;
    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
`;

export const AmountInfo = styled.div`
    color: white;
    margin-left: 10px;
    border: 3px solid #3accfa;
    border-radius: 5px;
    width: 215px;
    @media (max-width: 768px) {
        width: 130px;
    }
`;

export const MaxButton = styled.button`
    background: #3accfa;
    font-size: 10px;
    line-height: 12px;
    position: absolute;
    top: 16px;
    right: 5px;
    border: none;
    cursor: pointer;
`;

export const Status = styled.p<{ claimable: boolean }>`
    font-weight: 700;
    font-size: 17.2944px;
    line-height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${(props) => (!props.claimable ? '#E26A78' : '#3fd1ff')};
    margin-top: 10px;
    margin-bottom: 10px;
    text-transform: uppercase;
`;

export const ClaimButton = styled.button<{ cancelled?: boolean }>`
    background: ${(props) => (props.cancelled ? '#E26A78' : '#3fd1ff')};
    border-radius: 5px;
    padding: 4px;
    border: none;
    font-style: normal;
    font-weight: 700;
    font-size: 20px;
    line-height: 27px;
    letter-spacing: 0.025em;
    text-transform: capitalize;
    margin-top: 10px;
    color: #303656;
    cursor: pointer;
`;

export const ClaimableAmount = styled.p`
    font-style: normal;
    font-weight: 300;
    font-size: 17px;
    line-height: 130%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    margin: auto;
    margin-top: 20px;
    span {
        margin-left: 4px;
        font-weight: 700 !important;
    }
`;

export const MarketHeader = styled(FlexDivRow)`
    height: 100px;
    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

export const AmountToBuyLabel = styled(FlexDivCentered)`
    margin-top: 40px;
    @media (max-width: 768px) {
        padding: 0 10px;
    }
`;

export const LabelContainer = styled(FlexDivRow)`
    width: 50%;
    align-self: center;
    justify-content: space-around;
    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;
    }
`;

export const LabelsContainer = styled(FlexDivRow)`
    width: 50%;
    align-self: center;
    justify-content: space-around;
    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;
    }
`;

export const InputContainer = styled(FlexDiv)`
    margin: 0px 5px;
`;

export const Separator = styled.span`
    font-family: 'RobotoThin' !important;
    font-size: 18px;
    margin: 0 10px;
    @media (max-width: 768px) {
        visibility: hidden;
    }
`;

export const CustomTooltip = withStyles(() => ({
    tooltip: {
        minWidth: '100%',
        width: '100%',
        margin: '0',
        backgroundColor: '#FDB7B7',
        color: '#F30101',
        fontSize: '12px',
    },
}))(Tooltip);

export const FooterContainer = styled(FlexDivCentered)`
    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

export const Icon = styled.i`
    font-size: 20px;
    margin-left: 4px;
    margin-right: 7px;
`;

export const Discount = styled.div`
    background: #5fc694;
    color: #303656;
    position: absolute;
    width: 120px;
    height: 30px;
    top: 17px;
    right: -30px;
    transform: rotate(45deg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: bold;
`;
