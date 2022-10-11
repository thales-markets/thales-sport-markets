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
    &.third {
        margin-top: 200px;
        text-align: end;
    }
    &.fourth {
        margin-top: 200px;
        text-align: end;
    }
    &.fifth {
        margin-top: 400px;
    }
    &.sixth {
        margin-top: 200px;
        margin-bottom: 200px;
    }
`;

export const ZebraLogo = styled.img``;

export const Zebro = styled.img`
    position: absolute;
    &.baseball {
        top: -300px;
        left: -280px;
    }
    &.basketball {
        top: -255px;
        left: 245px;
    }
    &.nfl {
        top: -320px;
        left: -50px;
    }
    &.hockey {
        top: -190px;
        right: -75px;
    }
    &.boxing {
        top: -330px;
        left: -100px;
    }
    &.racing {
        top: -180px;
        right: -200px;
    }
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
    &.third {
        text-align: right;
        align-self: flex-end;
        width: min-content;
    }
    &.fourth {
        text-align: left;
        align-self: flex-start;
        width: min-content;
    }
    &.fifth {
        text-align: right;
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
    z-index: 1001;
    & > a {
        font-family: NunitoExtraBold !important;
        font-style: normal;
        font-weight: 900;
        font-size: 45px;
        line-height: 61px;
        cursor: pointer;
    }
    &.first {
        align-self: flex-end;
        margin-right: 15%;
    }
    &.second {
        align-self: flex-start;
    }
    &.third {
        align-self: flex-end;
    }
    &.fifth {
        align-self: flex-end;
    }
    &.info-box {
        & > a {
            font-size: 35px;
            line-height: 80%;
            align-self: center;
        }
    }
`;

export const ArrowIcon = styled.i`
    font-size: 55px;
    color: ${(props) => props.theme.textColor.quaternary};
    vertical-align: baseline;
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
    &.fifth {
        margin-top: 80px;
        align-items: flex-end;
        padding-right: 75px;
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
    z-index: 1001;
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

export const Initiative = styled.img``;

export const SectionRow = styled(FlexDivRow)`
    display: flex;
    position: relative;
    width: 100%;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
    &.first {
        margin-top: 100px;
    }
    &.second {
        margin-top: 150px;
    }
`;

export const InfoBox = styled.div`
    border: 5px solid ${(props) => props.theme.borderColor.secondary};
    border-radius: 6.41853px;
    width: 366px;
    color: ${(props) => props.theme.textColor.primary};
    height: 260px;
    text-align: center;
    margin: 11px;
    padding: 40px 0px;
    &.last {
        border: none;
        color: ${(props) => props.theme.textColor.quaternary};
    }
`;

export const InfoBoxTitle = styled.label`
    display: block;
    margin: 0px 10px;
    font-family: NunitoExtraBold !important;
    font-style: normal;
    font-weight: 800;
    font-size: 35px;
    line-height: 36px;
    text-align: center;
    text-transform: uppercase;
`;

export const InfoBoxText = styled.label`
    display: block;
    margin: 10px;
    font-family: Nunito !important;
    font-style: normal;
    font-weight: 400;
    font-size: 18px;
    line-height: 25px;
    text-align: center;
`;

export const DiscordInfo = styled(FlexDivRow)`
    align-self: start;
    width: 45%;
    margin-top: 200px;
    margin-left: 150px;
`;

export const DiscordIcon = styled.img`
    margin-right: 10px;
`;

export const DiscordLink = styled.a`
    display: flex;
    font-family: Nunito !important;
    font-style: normal;
    font-weight: 700;
    font-size: 45px;
    line-height: 90%;
    text-align: left;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
    z-index: 1001;
`;

export const CarouselContainer = styled.div`
    width: 100%;
    margin-top: 100px;
    margin-bottom: 100px;
    height: 180px;
    color: ${(props) => props.theme.textColor.primary};
    & ul {
        &.control-dots {
            bottom: -10px;
        }
        & > li {
            &.dot {
                height: 32px !important;
                margin: 0px 15px !important;
                width: 32px !important;
            }
        }
    }
`;

export const CarouselIconContainer = styled(FlexDivRow)`
    width: 100%;
    justify-content: space-evenly;
`;

export const LeagueIcon = styled.i`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 150px;
`;
