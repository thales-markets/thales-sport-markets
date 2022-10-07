import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow, FlexDivRowCentered } from 'styles/common';

export const Container = styled(FlexDivColumn)`
    width: 100%;
    align-items: center;
`;

export const Header = styled(FlexDivRowCentered)`
    align-items: center;
`;
export const Logo = styled.img`
    color: ${(props) => props.theme.textColor.primary};
    height: 50px;
`;

export const Section = styled(FlexDivColumn)`
    display: flex;
    position: relative;
    width: 100%;
    align-items: center;
    &.first {
        margin-top: 100px;
    }
    &.second {
        margin-top: 150px;
    }
`;

export const Zebra = styled.img``;

export const ZebraBaseballImg = styled.img`
    position: absolute;
    top: -300px;
    left: -280px;
`;

export const LargeText = styled.label`
    display: flex;
    font-family: JostExtraBold !important;
    font-style: normal;
    font-weight: 900;
    font-size: 150px;
    line-height: 135px;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
    &.first {
        align-self: center;
        width: min-content;
        text-align: center;
    }
    &.second {
        text-align: left;
        align-self: flex-start;
    }
    &.in-front {
        z-index: 1001;
    }
`;

export const CallToAction = styled.label`
    display: flex;
    font-family: NunitoExtraBold !important;
    font-style: normal;
    font-weight: 900;
    font-size: 45px;
    line-height: 61px;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.quaternary};
    cursor: pointer;
    &.first {
        align-self: flex-end;
        margin-right: 15%;
    }
    &.second {
        align-self: flex-start;
    }
`;

export const ArrowIcon = styled.i`
    font-size: 55px;
    color: ${(props) => props.theme.textColor.quaternary};
`;

export const SubSection = styled(FlexDivColumn)`
    display: flex;
    flex: initial;
    width: 100%;
    height: 56px;
    background-color: ${(props) => props.theme.textColor.quaternary};
    color: ${(props) => props.theme.textColor.tertiary};
    font-family: NunitoExtraBold !important;
    font-style: normal;
    font-weight: 800;
    font-size: 45px;
    line-height: 61px;
    text-transform: uppercase;
    &.first {
        margin-top: 80px;
        align-items: center;
    }
`;

export const Initiatives = styled(FlexDivRow)`
    display: flex;
    width: 100%;
    margin-top: 50px;
`;

export const Link = styled.a<{ height: string }>`
    display: flex;
    height: 50px;
    width: 33%;
    height: ${(props) => props.height};
    cursor: pointer;
    transition: 0.2s;
    justify-content: center;
    &:hover {
        transform: scale(1.2);
    }
    &:first-child {
        margin-top: -13px;
    }
    &:nth-child(2) {
        margin-top: -4px;
    }
`;

export const ZebraBasketballImg = styled.img`
    position: absolute;
    top: -255px;
    left: 245px;
`;

export const Initiative = styled.img``;
