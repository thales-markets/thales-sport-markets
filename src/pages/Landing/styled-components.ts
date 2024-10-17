import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivRow, FlexDivRowCentered } from 'styles/common';
import ScreenshotBackground from 'assets/images/landing/screenshot.png';
import { ReactComponent as PlayImage } from 'assets/images/landing/play.svg';

export const Container = styled(FlexDivColumn)`
    font-family: DMSans !important;
    z-index: 1;
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
`;

export const Initiatives = styled(FlexDivRow)`
    color: white;
    display: flex;
    width: 100%;
    align-items: center;
    line-height: 60px;
    @media (max-width: 750px) {
        margin-top: 35px;
    }
`;

export const CarouselContainer = styled.div<{ height?: string; dotsOffset?: string }>`
    width: 100%;
    margin-top: 50px;
    margin-bottom: 50px;
    height: ${(props) => props.height || '180px'};
    .carousel.carousel-slider {
        overflow: visible;
    }
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
            bottom: ${(props) => props.dotsOffset || '0'};
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
                height: 12px !important;
                margin: 0px 10px !important;
                width: 12px !important;
                @media (max-width: 600px) {
                    height: 10px !important;
                    width: 10px !important;
                }
            }
            &.dot.selected {
                background-color: ${(props) => props.theme.textColor.quaternary};
            }
        }
    }
`;
export const CarouselIconContainer = styled(FlexDivRow)`
    width: 100%;
    justify-content: space-evenly;
`;

export const HomepageIcon = styled.i<{
    fontSize?: string;
    paddingBottom?: string;
    mobileFontSize?: string;
    margin?: string;
    height?: string;
}>`
    display: flex;
    position: relative;
    height: ${(props) => props.height ?? 'auto'};
    align-items: center;
    justify-content: center;
    color: white;
    font-size: ${(props) => props.fontSize ?? '120px'};
    padding-bottom: ${(props) => props.paddingBottom ?? '0'};
    line-height: 0.5em;
    margin: ${(props) => props.margin ?? '0'};
    @media screen and (max-width: 767px) {
        font-size: ${(props) => props.mobileFontSize ?? props.fontSize ?? '120px'};
    }
`;

export const LeagueIcon = styled.i<{ fontSize?: number }>`
    color: ${(props) => props.theme.textColor.primary};
    font-size: ${(props) => props.fontSize || 120}px;
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

export const LogoLink = styled.a``;

export const LandingButton = styled.button`
    background-color: ${(props) => props.theme.textColor.quaternary};
    border-radius: 30px;
    padding: 5px 10px;
    text-transform: uppercase;
    font-weight: bold;
    cursor: pointer;
`;

export const TitleContainer = styled(FlexDivColumn)`
    width: 100%;
    margin-top: 50px;
`;

export const Title = styled.div`
    letter-spacing: 2px;
    font-family: DMSans !important;
    color: ${(props) => props.theme.textColor.primary};
    font-size: 50px;
    font-weight: 600;
    line-height: 60px;
    span {
        color: ${(props) => props.theme.textColor.quaternary};
        font-family: DMSans !important;
    }
`;

export const Subtitle = styled.div<{ align?: string; mt?: string }>`
    margin-top: ${(props) => props.mt || '0'};
    text-align: ${(props) => props.align || 'left'};
    font-weight: 600;
    letter-spacing: 1px;
    line-height: 40px;
    margin-bottom: 10px;
    font-family: DMSans !important;
    color: ${(props) => props.theme.textColor.primary};
    font-size: 30px;
    span {
        color: ${(props) => props.theme.textColor.quaternary};
        font-family: DMSans !important;
    }
`;

export const Description = styled.div<{ align?: string }>`
    text-align: ${(props) => props.align || 'left'};
    font-family: DMSans !important;
    font-weight: 300;
    color: ${(props) => props.theme.textColor.primary};
    font-size: 18px;
    line-height: 25px;
    span {
        font-weight: 600;
        font-family: DMSans !important;
    }
`;

export const FAQAnswer = styled.div`
    font-family: DMSans !important;
    color: ${(props) => props.theme.textColor.primary};
    font-size: 14px;
    font-weight: 200;
    margin-bottom: 20px;
`;

export const Row = styled(FlexDiv)<{ align?: string; justify?: string; mt?: string }>`
    margin-top: ${(props) => props.mt || '0'};
    align-items: ${(props) => props.align || 'flex-start'};
    justify-content: ${(props) => props.justify || 'flex-start'};
    width: 100%;
`;

export const IFrameContainer = styled.div`
    position: relative;
    width: 70%;
    height: 300px;
    border-radius: 6px;
    background: linear-gradient(160deg, #3f48ff, #7983a9);
    padding: 1px;
`;

export const IFrame = styled.iframe`
    border-radius: 6px;
`;

export const Screenshot = styled.div`
    position: absolute;
    left: 1px;
    right: 1px;
    top: 1px;
    bottom: 1px;
    border-radius: 6px;
    cursor: pointer;
    background-image: url(${ScreenshotBackground});
    height: 298px;
`;

export const Play = styled(PlayImage)`
    cursor: pointer;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
`;

export const NewsWrapper = styled(FlexDiv)<{ backgroundImageUrl: string; isMobile?: boolean }>`
    font-size: 14px;
    flex-direction: column;
    flex: 1;
    height: 250px;
    cursor: pointer;
    border-radius: 5px;
    border: 2px #2e2a2a solid;
    padding: 10px;
    justify-content: end;
    background: url(${(props) => props.backgroundImageUrl});
    background-size: cover;
`;

export const NewsTitle = styled.h2`
    font-size: 16px;
    line-height: 20px;
    font-weight: 600;
    color: ${(props) => props.theme.textColor.primary};
    text-align: center;
    margin-bottom: 16px;
`;
