import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow } from '../../../../../styles/common';

export const MarketContainer = styled(FlexDivColumn)`
    margin-top: 20px;
    box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.35);
    border-radius: 25px;
    width: 100%;
    padding: 40px 60px 30px 60px;
    background: ${(props) => props.theme.background.secondary};
    flex: initial;
    @media (max-width: 767px) {
        padding: 30px 20px 20px 20px;
    }
`;

export const StatusSourceContainer = styled(FlexDivRow)`
    align-items: end;
    @media (max-width: 767px) {
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
`;

export const OddsContainer = styled(FlexDivRow)`
    margin: 50px 72px 0 72px;
`;

export const Pick = styled(FlexDivColumn)<{ selected?: boolean }>`
    cursor: pointer;
    padding: 20px 5px;
    margin: 0 30px;
    text-align: center;
    border-radius: 10px;
    border: ${(props) => (props.selected ? '2px solid #5f6180' : '2px solid transparent')};
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
`;

export const InfoValue = styled.div`
    font-weight: 600;
    font-size: 18px;
    line-height: 23px;
`;

export const SliderContainer = styled(FlexDivRow)`
    display: flex;
    position: relative;
    flex-direction: column;
    margin: 80px 100px 0 100px;
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
    font-size: 14px;
    line-height: 23px;
    margin-right: 5px;
`;

export const SliderInfoValue = styled.div`
    font-weight: 600;
    font-size: 14px;
    line-height: 23px;
`;

export const AmountToBuyContainer = styled.div`
    position: relative;
`;

export const AmountToBuyInput = styled.input`
    margin: 10px 0;
    border: 3px solid #3accfa;
    border-radius: 5px;
    text-align: center;
    font-weight: bold;
    font-size: 18px;
`;

export const SubmitButton = styled.button`
    background: #5fc694;
    border-radius: 5px;
    margin: 20px 100px;
    font-size: 20px;
    line-height: 23px;
    color: 303656;
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
    position: absolute;
    color: white;
    padding: 10px;
    top: -55px;
    left: 50%;
    transform: translateX(-50%);
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
