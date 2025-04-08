import React from 'react';
import styled from 'styled-components';
import {
    FlexDiv,
    FlexDivCentered,
    FlexDivColumn,
    FlexDivColumnCentered,
    FlexDivRow,
    FlexDivStart,
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
    @media (max-width: 950px) {
        width: 100%;
        padding: 0;
    }
    @media (max-width: 767px) {
        flex-direction: column;
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

export const MainContentContainer = styled(ContentContainer)`
    padding: 10px 10px 10px 10px;
    :first-child {
        padding-right: 0;
    }
    :last-child {
        padding-left: 0;
    }
    @media (max-width: 767px) {
        padding: 10px 5px 10px 5px;
        :first-child {
            padding-right: 5px;
        }
        :last-child {
            padding-left: 5px;
        }
    }
`;

export const MainContainer = styled(Container)`
    width: 100%;
    background: ${(props) => props.theme.background.quinary};
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
        color: ${(props) => props.theme.textColor.quaternary};
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

export const RoundEnd = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-weight: 600;
    font-size: 25px;
    color: ${(props) => props.theme.textColor.quaternary};
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
    color: ${(props) => props.theme.textColor.quaternary};
    line-height: 20px;
`;

export const CopyContainer = styled(Container)`
    align-items: start;
    width: 80%;
    @media (max-width: 1199px) {
        width: 90%;
    }
    @media (max-width: 950px) {
        width: 100%;
        padding: 0;
    }
`;

export const Description = styled.div`
    font-size: 14px;
    line-height: 16px;
    text-align: justify;
    padding: 0 10px;
    width: 50%;
    :first-child {
        width: 90%;
    }
    :last-child {
        width: 32%;
    }
    h1 {
        font-size: 15px;
        font-weight: 600;
        margin-bottom: 10px;
    }
    p {
        margin-bottom: 10px;
        text-align: start;
    }
    ul {
        list-style: initial;
        margin-left: 20px;
    }
    li {
        margin-bottom: 4px;
        text-align: start;
    }
    @media (max-width: 767px) {
        padding: 0 5px;
        width: 100%;
        :first-child {
            width: 100%;
        }
        :last-child {
            width: 100%;
        }
    }
`;

export const ContentInfoContainer = styled.div``;

export const ContentInfo = styled.p`
    text-align: center;
`;

export const WarningContentInfo = styled(ContentInfo)`
    color: ${(props) => props.theme.warning.textColor.primary};
    i {
        color: ${(props) => props.theme.warning.textColor.primary};
    }
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

export const LiquidityPoolFilledText = styled(FlexDivRow)`
    margin-top: 10px;
    margin-bottom: 20px;
    width: 100%;
`;

export const LiquidityPoolFilledGraphicContainer = styled(FlexDivStart)`
    position: relative;
    width: 100%;
    height: 14px;
    background: ${(props) => props.theme.background.tertiary};
    border-radius: 9px;
    margin-top: 10px;
`;

export const LiquidityPoolFilledGraphicPercentage = styled(FlexDivStart)<{ width: number }>`
    position: absolute;
    width: ${(props) => props.width}%;
    transition: width 1s linear;
    max-width: 100%;
    height: 10px;
    left: 2px;
    top: 2px;
    background: linear-gradient(269.97deg, #ff774c 16.18%, #b50a5e 77.77%);
    border-radius: 9px;
`;

export const ExternalButton = styled.a`
    background: ${(props) => props.theme.button.background.quaternary};
    margin-top: 5px;
    border-radius: 5px;
    font-size: 16px;
    font-weight: 600;
    line-height: 20px;
    color: ${(props) => props.theme.button.textColor.primary};
    width: 100%;
    border: none;
    padding: 3px;
    cursor: pointer;
    text-align: center;
    text-transform: uppercase;
    height: 26px;
`;

export const ButtonContainer = styled(FlexDivColumnCentered)`
    width: 100%;
`;

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

export const LiquidityPoolInfoTitle = styled.div`
    text-align: center;
    white-space: nowrap;
    font-weight: 400;
    font-size: 18px;
    line-height: 100%;
    margin-top: 10px;
    margin-bottom: 15px;
`;

export const LiquidityPoolInfoContainer = styled(FlexDivStart)`
    align-items: center;
    margin-bottom: 10px;
`;

export const LiquidityPoolInfoLabel = styled.span`
    white-space: nowrap;
    margin-right: 6px;
    width: 135px;
`;

export const LiquidityPoolReturnlabel = styled(LiquidityPoolInfoLabel)`
    width: initial;
`;

export const LiquidityPoolReturnInfo = styled(LiquidityPoolReturnlabel)`
    font-weight: 600;
    color: ${(props) => props.theme.status.win};
    font-size: 16px;
`;

export const LiquidityPoolInfoGraphic = styled(FlexDivStart)<{ background: string; widthPercentage: number }>`
    width: ${(props) => 200 * props.widthPercentage}px;
    height: 14px;
    background: ${(props) => props.background};
    border-radius: 9px;
    margin-right: ${(props) => (props.widthPercentage === 0 ? 0 : 6)}px;
    @media (max-width: 1199px) {
        width: ${(props) => 150 * props.widthPercentage}px;
    }
    @media (max-width: 950px) {
        width: ${(props) => 120 * props.widthPercentage}px;
    }
    @media (max-width: 767px) {
        width: ${(props) => 200 * props.widthPercentage}px;
    }
    @media (max-width: 575px) {
        width: ${(props) => 120 * props.widthPercentage}px;
    }
`;

export const LiquidityPoolInfo = styled.span`
    white-space: nowrap;
`;

export const TextLink = styled.a`
    color: ${(props) => props.theme.link.textColor.primary};
    &:hover {
        text-decoration: underline;
    }
`;

export const TipLink: React.FC<{ href: string; children?: React.ReactNode }> = ({ children, href }) => {
    return (
        <TextLink target="_blank" rel="noreferrer" href={href}>
            {children}
        </TextLink>
    );
};

export const RadioButtonContainer = styled(FlexDivColumnCentered)`
    align-items: center;
    label {
        padding-left: 26px;
        font-size: 16px;
        line-height: 20px;
        min-height: 24px;
        text-transform: uppercase;
        margin-bottom: 0px;
        :first-child {
            margin-bottom: 4px;
        }
    }
    .checkmark {
        height: 18px;
        width: 18px;
        border-width: 3px;
        :after {
            left: 2px;
            top: 2px;
            width: 8px;
            height: 8px;
        }
    }
`;

export const SliderContainer = styled.div`
    position: relative;
    width: 100%;
    padding: 5px;
    margin-bottom: 5px;
`;

export const InputButtonContainer = styled.div`
    max-width: 350px;
    width: 100%;
    display: flex;
    flex-direction: column;
`;

export const SliderRange = styled.div`
    font-size: 13px;
    line-height: 13px;
    letter-spacing: 0.4px;
    color: ${(props) => props.theme.status.win};
    &.disabled {
        opacity: 0.4;
        cursor: default;
    }
`;

export const SliderRangeWrapper = styled(FlexDivRow)`
    padding-top: 5px;
`;

export const defaultButtonProps = {
    width: '100%',
};

export const NavigationContainer = styled(FlexDivRow)`
    margin-top: 20px;
    margin-bottom: 20px;
    gap: 30px;
    font-size: 20px;
    font-weight: 600;
    @media (max-width: 575px) {
        flex-wrap: wrap;
        gap: 15px;
        justify-content: center;
    }
`;

export const NavigationItem = styled(FlexDivRow)`
    color: ${(props) => props.theme.textColor.primary};
    white-space: nowrap;
    &.selected {
        transition: 0.2s;
        color: ${(props) => props.theme.textColor.quaternary};
    }
    &:hover:not(.selected) {
        cursor: pointer;
        color: ${(props) => props.theme.textColor.secondary};
    }
    @media (max-width: 575px) {
        font-size: 14px;
    }
`;

export const CurrencyText = styled.span`
    text-transform: none;
    margin-left: 5px;
`;
