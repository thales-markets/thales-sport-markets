import styled from 'styled-components';
import { FlexDivColumn, FlexDivRowCentered } from 'styles/common';

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
    &.first {
        margin-top: 100px;
        align-items: center;
    }
`;

export const Zebra = styled.img``;

export const ZebraBaseballImg = styled.img`
    position: absolute;
    top: -300px;
    left: -335px;
`;

export const LargeText = styled.label`
    display: flex;
    font-family: JostExtraBold !important;
    font-style: normal;
    font-weight: 900;
    font-size: 150px;
    line-height: 135px;
    text-align: center;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
    &.first {
        align-self: flex-end;
        margin-right: 20%;
        width: min-content;
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
    &.first {
        align-self: flex-end;
        margin-right: 20%;
    }
`;
