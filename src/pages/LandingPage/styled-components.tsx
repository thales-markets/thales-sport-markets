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
    @media (max-width: 500px) {
        height: 35px;
    }
`;

export const Section = styled(FlexDivColumn)`
    display: flex;
    position: relative;
    width: 100%;
    align-items: center;
    &.first {
        margin-top: 100px;
        @media (max-width: 500px) {
            margin-top: 75px;
        }
    }
    &.second {
        margin-top: 150px;
    }
    &.third {
        margin-top: 200px;
        text-align: end;
    }
    &.fourth {
        margin-top: 300px;
        text-align: end;
        @media (max-width: 960px) {
            margin-top: 200px;
        }
    }
    &.fifth {
        margin-top: 400px;
        @media (max-width: 750px) {
            margin-top: 300px;
        }
        @media (max-width: 500px) {
            margin-top: 200px;
        }
        @media (max-width: 450px) {
            margin-top: 150px;
        }
    }
    &.sixth {
        margin-top: 200px;
        margin-bottom: 200px;
        @media (max-width: 500px) {
            margin-top: 100px;
        }
    }
`;

export const ZebraLogo = styled.img`
    @media (max-width: 500px) {
        height: 100px;
    }
`;

export const Zebro = styled.img`
    position: absolute;
    &.baseball {
        top: -300px;
        left: -280px;
        @media (max-width: 960px) {
            height: 45em;
            width: 45em;
            top: -200px;
            left: -70px;
        }
        @media (max-width: 750px) {
            height: 42em;
            width: 42em;
            top: -163px;
            left: -105px;
        }
        @media (max-width: 600px) {
            height: 33em;
            width: 33em;
            top: -145px;
            left: -50px;
        }
        @media (max-width: 500px) {
            height: 30em;
            width: 30em;
            top: -145px;
            left: -70px;
        }
        @media (max-width: 450px) {
            height: 25em;
            width: 25em;
            left: -60px;
            top: -115px;
        }
    }
    &.basketball {
        top: -255px;
        left: 245px;
        @media (max-width: 960px) {
            height: 50em;
            width: 50em;
            top: -250px;
            left: 100px;
        }
        @media (max-width: 750px) {
            height: 40em;
            width: 40em;
            top: -200px;
        }
        @media (max-width: 600px) {
            height: 35em;
            width: 35em;
            left: 30px;
        }
        @media (max-width: 500px) {
            height: 30em;
            width: 30em;
            left: 0px;
        }
        @media (max-width: 450px) {
            height: 25em;
            width: 25em;
            top: -150px;
        }
    }
    &.nfl {
        top: -320px;
        left: -50px;
        @media (max-width: 960px) {
            height: 40em;
            width: 40em;
        }
        @media (max-width: 600px) {
            height: 35em;
            width: 35em;
        }
        @media (max-width: 500px) {
            height: 30em;
            width: 30em;
            top: -260px;
        }
        @media (max-width: 450px) {
            height: 25em;
            width: 25em;
        }
    }
    &.hockey {
        top: -190px;
        right: -75px;
        @media (max-width: 960px) {
            height: 40em;
            width: 40em;
            right: 0px;
        }
        @media (max-width: 600px) {
            height: 35em;
            width: 35em;
        }
        @media (max-width: 500px) {
            height: 30em;
            width: 30em;
        }
        @media (max-width: 450px) {
            height: 25em;
            width: 25em;
        }
    }
    &.boxing {
        top: -330px;
        left: -100px;
        @media (max-width: 960px) {
            height: 42em;
            width: 42em;
            top: -260px;
        }

        @media (max-width: 750px) {
            height: 40em;
            width: 40em;
        }
        @media (max-width: 600px) {
            height: 35em;
            width: 35em;
        }
        @media (max-width: 500px) {
            height: 30em;
            width: 30em;
            top: -195px;
            left: -65px;
        }
        @media (max-width: 450px) {
            height: 25em;
            width: 25em;
            top: -140px;
        }
    }
    &.racing {
        top: -180px;
        right: -200px;
        @media (max-width: 960px) {
            height: 48em;
            width: 48em;
            top: -250px;
        }

        @media (max-width: 750px) {
            right: -260px;
        }

        @media (max-width: 600px) {
            height: 35em;
            width: 35em;
            right: -210px;
            top: -135px;
        }

        @media (max-width: 500px) {
            height: 30em;
            width: 30em;
            right: -195px;
            top: -135px;
        }
    }
`;

export const LargeText = styled.label`
    display: flex;
    font-family: JostExtraBold !important;
    font-style: normal;
    font-weight: 900;
    font-size: 150px;
    line-height: 90%;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
    &.first {
        align-self: center;
        width: min-content;
        text-align: center;
        @media (max-width: 960px) {
            margin-left: 10%;
        }
        @media (max-width: 750px) {
            margin-left: 25%;
        }
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
        @media (max-width: 960px) {
            width: 80%;
            margin-left: 20%;
        }
    }
    &.in-front {
        z-index: 1001;
    }
    @media (max-width: 960px) {
        font-size: 100px;
    }
    @media (max-width: 750px) {
        font-size: 90px;
    }
    @media (max-width: 600px) {
        font-size: 60px;
    }
    @media (max-width: 500px) {
        font-size: 50px;
    }
    @media (max-width: 450px) {
        font-size: 40px;
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
    margin-top: 10px;
    & > a {
        font-family: NunitoExtraBold !important;
        font-style: normal;
        font-weight: 900;
        font-size: 45px;
        line-height: 61px;
        cursor: pointer;
        @media (max-width: 600px) {
            font-size: 35px;
            line-height: 90%;
        }
        @media (max-width: 500px) {
            font-size: 30px;
            line-height: 120%;
        }
        @media (max-width: 450px) {
            font-size: 20px;
            line-height: 120%;
        }
    }
    &.first {
        align-self: flex-end;
        margin-right: 15%;
        @media (max-width: 750px) {
            margin-right: 0px;
        }
    }
    &.second {
        align-self: flex-start;
    }
    &.third {
        align-self: flex-end;
    }
    &.fifth {
        align-self: flex-end;
        margin-top: 10px;
    }
    &.info-box {
        justify-content: center;
        margin-top: 7px;
        & > a {
            font-size: 35px;
            line-height: 80%;
            align-self: center;
            width: 50%;
            @media (max-width: 750px) {
                font-size: 30px;
            }
            @media (max-width: 600px) {
                font-size: 25px;
            }
            @media (max-width: 500px) {
                font-size: 20px;
            }
        }
    }
    @media (max-width: 600px) {
        font-size: 35px;
        line-height: 90%;
    }
`;

export const ArrowIcon = styled.i`
    font-size: 55px;
    color: ${(props) => props.theme.textColor.quaternary};
    vertical-align: baseline;

    &.triple {
        display: block;
        margin-top: 20px;
    }

    @media (max-width: 600px) {
        font-size: 40px;
        &.triple {
            font-size: 55px;
        }
    }
    @media (max-width: 500px) {
        font-size: 30px;
    }
    @media (max-width: 450px) {
        font-size: 20px;
    }
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
        @media (max-width: 960px) {
            margin-top: 150px;
            padding-right: 15px;
        }
    }
    @media (max-width: 600px) {
        font-size: 30px;
        line-height: 45px;
        height: 45px;
    }
    @media (max-width: 500px) {
        font-size: 20px;
        line-height: 30px;
        height: 30px;
    }
`;

export const Initiatives = styled(FlexDivRow)`
    display: flex;
    width: 100%;
    margin-top: 50px;
    @media (max-width: 500px) {
        margin-top: 35px;
    }
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
        @media (max-width: 960px) {
            height: 60px;
        }

        @media (max-width: 750px) {
            height: 50px;
        }

        @media (max-width: 600px) {
            height: 45px;
        }
        @media (max-width: 500px) {
            height: 35px;
        }
    }
    &:nth-child(2) {
        margin-top: -4px;
        @media (max-width: 960px) {
            height: 55px;
        }

        @media (max-width: 750px) {
            height: 45px;
        }
        @media (max-width: 600px) {
            height: 35px;
        }
        @media (max-width: 500px) {
            height: 30px;
            margin-top: -7px;
        }
        @media (max-width: 450px) {
            height: 25px;
        }
    }
    &:nth-child(3) {
        @media (max-width: 960px) {
            height: 35px;
        }
        @media (max-width: 750px) {
            height: 30px;
        }
        @media (max-width: 600px) {
            height: 25px;
            margin-top: -2px;
        }
        @media (max-width: 500px) {
            height: 20px;
            margin-top: -5px;
        }
        @media (max-width: 450px) {
            height: 17px;
        }
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

    @media (max-width: 960px) {
        width: 45%;
    }

    @media (max-width: 500px) {
        width: 44%;
        height: 290px;
    }

    @media (max-width: 450px) {
        height: 290px;
    }
`;

export const InfoBoxTitle = styled.label`
    display: block;
    margin: 0px 10px;
    font-family: NunitoExtraBold !important;
    font-style: normal;
    font-weight: 800;
    font-size: 35px;
    line-height: 90%;
    text-align: center;
    text-transform: uppercase;
    @media (max-width: 750px) {
        font-size: 30px;
    }
    @media (max-width: 600px) {
        font-size: 25px;
    }
    @media (max-width: 500px) {
        font-size: 20px;
    }
    @media (max-width: 450px) {
        word-break: break-all;
    }
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
    @media (max-width: 750px) {
        font-size: 15px;
    }
`;

export const DiscordInfo = styled(FlexDivRow)`
    align-self: start;
    width: 45%;
    margin-top: 200px;
    margin-left: 150px;
    @media (max-width: 960px) {
        width: 60%;
        margin-top: 65px;
        margin-left: 100px;
    }
    @media (max-width: 750px) {
        width: 80%;
        margin-left: 25px;
    }
`;

export const DiscordIcon = styled.img`
    margin-right: 10px;
    @media (max-width: 600px) {
        height: 2em;
    }
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
    @media (max-width: 600px) {
        font-size: 35px;
    }
    @media (max-width: 500px) {
        font-size: 30px;
    }
    @media (max-width: 450px) {
        font-size: 20px;
    }
`;

export const CarouselContainer = styled.div`
    width: 100%;
    margin-top: 100px;
    margin-bottom: 100px;
    height: 220px;
    color: ${(props) => props.theme.textColor.primary};
    @media (max-width: 500px) {
        margin-top: 50px;
        margin-bottom: 0px;
    }
    & > div {
        height: 100%;
        & > div {
            height: 100%;
        }
    }
    & ul {
        &.control-dots {
            bottom: -13px;
            @media (max-width: 600px) {
                bottom: 0px;
            }
            @media (max-width: 500px) {
                bottom: 30px;
            }
            @media (max-width: 450px) {
                bottom: 60px;
            }
        }
        & > li {
            &.dot {
                height: 32px !important;
                margin: 0px 15px !important;
                width: 32px !important;
                @media (max-width: 600px) {
                    height: 16px !important;
                    width: 16px !important;
                }
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

    @media (max-width: 600px) {
        font-size: 115px;
    }
    @media (max-width: 500px) {
        font-size: 100px;
    }
    @media (max-width: 450px) {
        font-size: 80px;
    }
`;
