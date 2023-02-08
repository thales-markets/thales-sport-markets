import { Tooltip, withStyles } from '@material-ui/core';
import styled from 'styled-components';
import {
    FlexDivCentered,
    FlexDivColumn,
    FlexDivColumnCentered,
    FlexDivStart,
    FlexDivRow,
    FlexDiv,
} from 'styles/common';

export const Wrapper = styled(FlexDivColumn)`
    width: 100%;
    align-items: center;
`;

export const Container = styled(FlexDivRow)`
    width: 70%;
    position: relative;
    align-items: center;
    margin-top: 10px;
    padding: 0 20px;
    @media (max-width: 1199px) {
        width: 80%;
    }
    @media (max-width: 991px) {
        width: 100%;
        padding: 0;
    }
    @media (max-width: 767px) {
        flex-direction: column;
        padding: 0 20px;
    }
`;

export const ContentContainer = styled(FlexDivColumn)`
    width: 100%;
    flex: initial;
    align-items: center;
    position: relative;
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;
    padding: 10px 20px 10px 20px;
    p {
        margin-bottom: 5px;
    }
    @media (max-width: 767px) {
        padding: 10px 5px 10px 5px;
    }
`;

export const MainContainer = styled(Container)`
    width: 100%;
    background: linear-gradient(180deg, #303656 0%, #1a1c2b 100%);
    border-radius: 10px;
    padding: 0 10px;
`;

export const RoundEndContainer = styled(FlexDivColumn)`
    align-items: center;
    text-align: center;
    font-size: 20px;
    line-height: 20px;
    span {
        font-size: 30px;
        font-weight: 600;
        color: #3fd1ff;
        line-height: 34px;
    }
    @media (max-width: 1199px) {
        font-size: 18px;
        line-height: 18px;
        span {
            font-size: 26px;
            line-height: 26px;
        }
    }
`;

export const RoundEndLabel = styled.p``;

export const RoundEnd = styled.p`
    font-weight: 600;
    font-size: 25px;
    color: #3fd1ff;
    line-height: 25px;
`;

export const RoundInfoContainer = styled(FlexDivColumn)`
    align-items: center;
    text-align: center;
`;

export const RoundInfoLabel = styled.p``;

export const RoundInfo = styled.p`
    font-size: 20px;
    font-weight: 600;
    color: #3fd1ff;
    line-height: 20px;
`;

export const Description = styled.div`
    font-size: 18px;
    line-height: 22px;
    text-align: justify;
    p {
        margin-bottom: 10px;
    }
    ul {
        list-style: initial;
        margin-left: 20px;
    }
    li {
        margin-bottom: 4px;
    }
`;

export const ContentInfoContainer = styled.div`
    margin-bottom: 10px;
`;

export const ContentInfo = styled.p`
    text-align: center;
`;

export const WarningContentInfo = styled(ContentInfo)`
    color: #ffcc00;
`;

export const BoldContent = styled.span`
    font-weight: 600;
`;

export const Title = styled.span`
    font-style: normal;
    font-weight: bold;
    font-size: 25px;
    line-height: 100%;
    color: ${(props) => props.theme.textColor.primary};
    margin-top: 30px;
    margin-bottom: 10px;
    @media (max-width: 767px) {
        margin-top: 20px;
        margin-bottom: 0;
    }
`;

export const UsersInLiquidityPoolText = styled(ContentInfo)`
    margin-top: 20px;
    margin-bottom: 10px;
`;

export const LiquidityPoolFilledText = styled(ContentInfo)`
    margin-top: 10px;
    margin-bottom: 10px;
`;

export const LiquidityPoolFilledGraphicContainer = styled(FlexDivStart)`
    position: relative;
    width: 400px;
    height: 14px;
    background: #3b4472;
    border-radius: 9px;
    margin-bottom: 10px;
    @media (max-width: 575px) {
        width: 250px;
    }
`;

export const LiquidityPoolFilledGraphicPercentage = styled(FlexDivStart)<{ width: number }>`
    position: absolute;
    width: ${(props) => props.width}%;
    transition: width 1s linear;
    max-width: 400px;
    height: 10px;
    left: 2px;
    top: 2px;
    background: linear-gradient(269.97deg, #ff774c 16.18%, #b50a5e 77.77%);
    border-radius: 9px;
    @media (max-width: 575px) {
        max-width: 250px;
    }
`;

export const SubmitButton = styled.button`
    background: #36e5d0;
    border-radius: 5px;
    font-size: 16px;
    font-weight: 700;
    line-height: 20px;
    color: #1a1c2b;
    width: 100%;
    border: none;
    padding: 3px;
    cursor: pointer;
    text-transform: uppercase;
    &:disabled {
        opacity: 0.4;
        cursor: default;
    }
`;

export const ExternalButton = styled(SubmitButton)`
    background: #64d9fe;
    margin-top: 5px;
`;

export const CloseRoundButton = styled(SubmitButton)`
    margin: 0;
    width: auto;
    font-size: 12px;
    font-weight: 700;
    line-height: 14px;
    top: -3px;
    position: relative;
    background: #64d9fe;
`;

export const ButtonContainer = styled(FlexDivColumnCentered)`
    width: 100%;
`;

export const InputContainer = styled(FlexDivColumnCentered)`
    margin-bottom: 5px;
    width: 100%;
    div {
        margin-bottom: 0px;
        width: 100%;
    }
    input {
        background: ${(props) => props.theme.input.background.primary};
        border-radius: 5px;
        border: 2px solid ${(props) => props.theme.input.background.primary};
        color: ${(props) => props.theme.input.textColor.primary};
        width: 100%;
        height: 26px;
        padding: 12px 50px 10px 10px;
        font-size: 14px;
        outline: none;
        &::placeholder {
            color: ${(props) => props.theme.textColor.secondary};
        }
        &:focus {
            border: 2px solid ${(props) => props.theme.borderColor.quaternary};
        }
    }
    .currency-label {
        padding: 1px 10px 10px 0;
        font-size: 14px;
    }
`;

export const ValidationTooltip = withStyles(() => ({
    tooltip: {
        minWidth: '100%',
        width: '100%',
        margin: '1px',
        backgroundColor: '#FDB7B7',
        color: '#F30101',
        fontSize: '12px',
    },
}))(Tooltip);

export const LoaderContainer = styled(FlexDivCentered)`
    position: relative;
    min-height: 240px;
    width: 100%;
`;

export const ToggleContainer = styled(FlexDiv)`
    font-weight: 600;
    width: 100%;
    margin-bottom: 5px;
    text-transform: uppercase;
`;
