import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow, FlexDivRowCentered } from 'styles/common';

export const Container = styled(FlexDivColumn)`
    width: 75%;
    align-items: center;
    @media (max-width: 600px) {
        width: 100%;
    }
`;

export const Header = styled(FlexDivRowCentered)`
    align-items: center;
    width: 100%;
`;
export const Logo = styled.img`
    color: ${(props) => props.theme.textColor.primary};
    height: 0.7em;
`;

export const Section = styled(FlexDivColumn)`
    display: flex;
    position: relative;
    width: 100%;
    align-items: center;
    &.first {
        margin-top: 80px;
        @media (max-width: 500px) {
            margin-top: 70px;
        }
    }
    &.second {
        margin-top: 100px;
        @media (max-width: 960px) {
            margin-top: 200px;
        }
        @media (max-width: 750px) {
            margin-top: 150px;
        }
        @media (max-width: 450px) {
            margin-top: 105px;
        }
    }
    &.third {
        margin-top: 200px;
        text-align: end;
        @media (max-width: 400px) {
            margin-top: 100px;
        }
    }
    &.fourth {
        margin-top: 150px;
        text-align: end;
        @media (max-width: 960px) {
            margin-top: 200px;
        }
    }
    &.fifth {
        margin-top: 250px;
        @media (max-width: 750px) {
            margin-top: 200px;
        }
        @media (max-width: 500px) {
            margin-top: 200px;
        }
        @media (max-width: 450px) {
            margin-top: 150px;
        }
    }
    &.sixth {
        margin-bottom: 150px;
        @media (max-width: 960px) {
            margin-top: 100px;
        }
        @media (max-width: 500px) {
            margin-top: 100px;
        }
        @media (max-width: 450px) {
            margin-top: 50px;
            margin-bottom: 50px;
        }
    }
`;

export const ZebraLogo = styled.img`
    height: 110px;
    @media (max-width: 750px) {
        height: 80px;
    }
`;

export const Zebro = styled.img`
    position: absolute;
    &.baseball {
        top: -160px;
        left: -100px;
        height: 40em;
        width: 40em;
        @media (max-width: 960px) {
            top: -200px;
            left: -100px;
            width: 38em;
            height: 38em;
        }
        @media (max-width: 750px) {
            top: -160px;
            left: -90px;
            height: 35em;
            width: 35em;
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
        @media (max-width: 400px) {
            height: 22em;
            width: 22em;
        }
    }
    &.basketball {
        top: -185px;
        left: 230px;
        height: 40em;
        width: 40em;
        @media (max-width: 960px) {
            top: -280px;
            left: 140px;
            height: 38em;
            width: 38em;
        }
        @media (max-width: 750px) {
            height: 35em;
            width: 35em;
            top: -220px;
            left: 85px;
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
        top: -280px;
        left: 0px;
        height: 40em;
        width: 40em;
        @media (max-width: 960px) {
            left: -80px;
            height: 38em;
            width: 38em;
        }
        @media (max-width: 750px) {
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
        right: 95px;
        height: 40em;
        width: 40em;
        @media (max-width: 960px) {
            height: 38em;
            width: 38em;
            right: 0px;
            top: -225px;
        }
        @media (max-width: 750px) {
            height: 35em;
            width: 35em;
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
        top: -200px;
        left: 15px;
        height: 40em;
        width: 40em;
        @media (max-width: 960px) {
            height: 35em;
            width: 35em;
            top: -180px;
            left: -90px;
        }
        @media (max-width: 750px) {
            height: 35em;
            width: 35em;
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
            top: -130px;
        }
        @media (max-width: 400px) {
            top: -150px;
        }
    }
    &.racing {
        top: -48px;
        right: -60px;
        width: 40em;
        z-index: 0;
        @media (max-width: 960px) {
            width: 38em;
            top: -100px;
        }

        @media (max-width: 750px) {
            right: -125px;
            width: 35em;
        }

        @media (max-width: 600px) {
            right: -100px;
            top: -125px;
        }

        @media (max-width: 500px) {
            width: 30em;
            right: -195px;
            top: -135px;
        }
        @media (max-width: 500px) {
            right: -135px;
            height: 25em;
            width: 25em;
        }
    }
`;

export const LargeText = styled.label`
    display: flex;
    font-family: JostExtraBold !important;
    font-style: normal;
    font-weight: 900;
    font-size: 80px;
    line-height: 90%;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
    &.first {
        align-self: center;
        width: 51%;
        text-align: center;
        z-index: 100;
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
        width: 50%;
    }
    &.fifth {
        text-align: right;
        width: 70%;
        display: flex;
        align-self: self-end;
        @media (max-width: 960px) {
            width: 80%;
            margin-left: 20%;
        }
        @media (max-width: 450px) {
            width: 75%;
        }
    }
    &.in-front {
        z-index: 1001;
    }
    @media (max-width: 960px) {
        font-size: 60px;
    }
    @media (max-width: 500px) {
        font-size: 50px;
    }
    @media (max-width: 450px) {
        font-size: 40px;
    }
    @media (max-width: 400px) {
        font-size: 35px;
    }
`;

export const CallToAction = styled.label`
    display: flex;
    font-family: NunitoExtraBold !important;
    font-style: normal;
    font-weight: 900;
    font-size: 30px;
    line-height: 61px;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.quaternary};
    cursor: pointer;
    z-index: 999;
    margin-top: 10px;
    & > a {
        font-family: NunitoExtraBold !important;
        font-style: normal;
        font-weight: 900;
        font-size: 30px;
        line-height: 61px;
        cursor: pointer;
        @media (max-width: 600px) {
            font-size: 25px;
            line-height: 90%;
        }
        @media (max-width: 500px) {
            line-height: 120%;
        }
        @media (max-width: 450px) {
            font-size: 20px;
            line-height: 120%;
        }
    }
    &.header {
        margin-top: 0px;
        margin-left: 15px;
    }
    &.first {
        align-self: center;
        margin-left: 45%;
        @media (max-width: 750px) {
            align-self: end;
            margin-left: 0;
            margin-right: 7%;
        }
    }
    &.second {
        align-self: flex-start;
    }
    &.third {
        align-self: flex-end;
    }
    &.fourth {
        align-self: flex-start;
    }
    &.fifth {
        align-self: flex-end;
        margin-top: 10px;
    }
    &.info-box {
        justify-content: center;
        margin-top: 6px;
        & > a {
            font-size: 25px;
            line-height: 80%;
            align-self: center;
            width: 50%;
            @media (max-width: 500px) {
                font-size: 20px;
            }
            @media (max-width: 450px) {
                font-size: 18px;
            }

            @media (max-width: 400px) {
                font-size: 15px;
            }
        }
    }
    @media (max-width: 600px) {
        font-size: 35px;
        line-height: 90%;
    }
`;

export const ArrowIcon = styled.i`
    font-size: 30px;
    color: ${(props) => props.theme.textColor.quaternary};
    vertical-align: baseline;

    &.triple {
        display: block;
        margin-top: 20px;
    }

    @media (max-width: 600px) {
        font-size: 25px;
        &.triple {
            font-size: 25px;
        }
    }
    @media (max-width: 500px) {
        font-size: 20px;
    }
`;

export const SubSection = styled(FlexDivColumn)`
    display: flex;
    flex: initial;
    width: 100%;
    height: 36px;
    background-color: ${(props) => props.theme.textColor.quaternary};
    color: ${(props) => props.theme.textColor.tertiary};
    font-family: NunitoExtraBold !important;
    font-style: normal;
    font-weight: 800;
    font-size: 30px;
    line-height: 37px;
    text-transform: uppercase;
    &.first {
        margin-top: 50px;
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
        font-size: 25px;
        line-height: 37px;
        height: 36px;
    }
    @media (max-width: 500px) {
        font-size: 20px;
        line-height: 30px;
        height: 30px;
    }

    @media (max-width: 400px) {
        font-size: 18px;
        line-height: 30px;
        height: 30px;
    }
`;

export const Initiatives = styled(FlexDivRow)`
    display: flex;
    width: 100%;
    margin-top: 50px;
    @media (max-width: 750px) {
        margin-top: 35px;
    }
`;

export const InitiativeLink = styled.a<{ height: string }>`
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
            height: 42px;
        }

        @media (max-width: 750px) {
            height: 35px;
        }
        @media (max-width: 450px) {
            height: 30px;
        }
    }
    &:nth-child(2) {
        margin-top: -10px;
        @media (max-width: 960px) {
            height: 39px;
        }

        @media (max-width: 750px) {
            height: 30px;
            margin-top: -8px;
        }

        @media (max-width: 450px) {
            height: 25px;
        }
        @media (max-width: 400px) {
            height: 23px;
        }
    }
    &:nth-child(3) {
        margin-top: -9px;
        @media (max-width: 960px) {
            height: 27px;
            margin-top: -7px;
        }
        @media (max-width: 750px) {
            height: 20px;
            margin-top: -5px;
        }

        @media (max-width: 500px) {
            height: 20px;
            margin-top: -5px;
        }
        @media (max-width: 450px) {
            height: 17px;
            margin-top: -6px;
        }
        @media (max-width: 400px) {
            height: 15px;
            margin-top: -6px;
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
    width: 30%;
    color: ${(props) => props.theme.textColor.primary};
    height: 290px;
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
    }
`;

export const InfoBoxTitle = styled.label`
    display: block;
    margin: 0px 10px;
    font-family: NunitoExtraBold !important;
    font-style: normal;
    font-weight: 800;
    font-size: 25px;
    line-height: 90%;
    text-align: center;
    text-transform: uppercase;
    @media (max-width: 750px) {
        font-size: 25px;
    }

    @media (max-width: 500px) {
        font-size: 20px;
    }
    @media (max-width: 450px) {
        font-size: 18px;
    }

    @media (max-width: 400px) {
        font-size: 14px;
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
    @media (max-width: 400px) {
        font-size: 13px;
        line-height: 20px;
    }
`;

export const DiscordInfo = styled(FlexDivRow)`
    align-self: start;
    width: 45%;
    margin-top: 200px;
    margin-left: 50px;
    @media (max-width: 960px) {
        width: 55%;
        margin-top: 65px;
        margin-left: 25px;
    }
    @media (max-width: 750px) {
        width: 80%;
        margin-left: 25px;
    }
    @media (max-width: 600px) {
        width: 70%;
    }
    @media (max-width: 450px) {
        width: 65%;
    }
`;

export const DiscordIcon = styled.img`
    margin-right: 10px;
    height: 2em;
`;

export const DiscordLink = styled.a`
    display: flex;
    font-family: Nunito !important;
    font-style: normal;
    font-weight: 700;
    font-size: 30px;
    line-height: 90%;
    text-align: left;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
    z-index: 1001;
    @media (max-width: 600px) {
        font-size: 25px;
    }
    @media (max-width: 500px) {
        font-size: 25px;
    }
    @media (max-width: 450px) {
        font-size: 20px;
    }
`;

export const DocsLink = styled.a`
    display: flex;
    font-family: NunitoExtraBold !important;
    font-style: normal;
    font-weight: 900;
    font-size: 30px;
    line-height: 61px;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.quaternary};
    cursor: pointer;
    z-index: 999;
    margin-top: 10px;
    @media (max-width: 600px) {
        font-size: 25px;
    }
    @media (max-width: 500px) {
        font-size: 25px;
    }
    @media (max-width: 450px) {
        font-size: 20px;
    }
`;

export const CarouselContainer = styled.div`
    width: 100%;
    margin-top: 50px;
    margin-bottom: 50px;
    height: 180px;
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
                height: 20px !important;
                margin: 0px 10px !important;
                width: 20px !important;
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
    font-size: 120px;

    @media (max-width: 750px) {
        font-size: 100px;
    }

    @media (max-width: 600px) {
        font-size: 115px;
    }
    @media (max-width: 500px) {
        font-size: 100px;
    }
    @media (max-width: 450px) {
        font-size: 80px;
    }
    @media (max-width: 400px) {
        font-size: 70px;
    }
`;

export const LogoContainer = styled(FlexDivRow)`
    align-items: center;
    font-size: 80px;
    @media (max-width: 960px) {
        font-size: 60px;
    }
    @media (max-width: 500px) {
        font-size: 50px;
    }
    @media (max-width: 450px) {
        font-size: 40px;
    }
    @media (max-width: 400px) {
        font-size: 35px;
    }
`;

export const LogoLink = styled.a``;
