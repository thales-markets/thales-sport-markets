import React from 'react';
import { useTranslation } from 'react-i18next';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';
import OvertimeLogo from 'assets/images/overtime-logo.svg';
import ZebraLogoImg from 'assets/images/landing-page/zebra-logo.svg';
import ZebraBaseball from 'assets/images/landing-page/zebra-baseball.svg';
import ZebraBasketball from 'assets/images/landing-page/zebra-basketball.svg';
import ZebraNfl from 'assets/images/landing-page/zebra-nfl.svg';
import ZebraHockey from 'assets/images/landing-page/zebra-hockey.svg';
import ZebraBoxing from 'assets/images/landing-page/zebra-boxing.svg';
import ZebraRacing from 'assets/images/landing-page/zebra-racing.svg';
import ChainlinkLogo from 'assets/images/landing-page/chainlink.svg';
import OptimismLogo from 'assets/images/landing-page/optimism.svg';
import ThalesLogo from 'assets/images/landing-page/thales.svg';
import DiscordLogo from 'assets/images/landing-page/discord.svg';
import {
    Container,
    Header,
    Logo,
    ZebraLogo,
    Section,
    Zebro,
    LargeText,
    CallToAction,
    ArrowIcon,
    SubSection,
    Initiative,
    Initiatives,
    Link,
    InfoBoxTitle,
    InfoBox,
    InfoBoxText,
    SectionRow,
    DiscordLink,
    DiscordInfo,
    DiscordIcon,
    LeagueIcon,
    CarouselContainer,
    CarouselIconContainer,
} from './styled-components';
import SPAAnchor from 'components/SPAAnchor';
import { buildHref } from 'utils/routes';
import ROUTES from 'constants/routes';
import { LINKS } from 'constants/links';

const LandingPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Container>
            <Header>
                <Logo src={OvertimeLogo} alt="overtime logo" />
                <ZebraLogo src={ZebraLogoImg} alt="zebra logo" />
            </Header>
            <Section className="first">
                <Zebro className="baseball" src={ZebraBaseball} alt="Zebro Baseball" />
                <LargeText className="first">{t('landing-page.best-odds')}</LargeText>
                <CallToAction className="first">
                    <SPAAnchor href={buildHref(ROUTES.Markets.Home)}>
                        {t('landing-page.try-now')} <ArrowIcon className={`icon icon--arrow`} />
                    </SPAAnchor>
                </CallToAction>

                <SubSection className="first">{t('landing-page.powered-by')}</SubSection>
                <Initiatives>
                    <Link target="_blank" rel="noreferrer" height={'70px'} href="https://chain.link/">
                        <Initiative src={ChainlinkLogo} alt="Chainlink logo" />
                    </Link>
                    <Link target="_blank" rel="noreferrer" height={'65px'} href="https://thalesmarket.io/">
                        <Initiative src={ThalesLogo} alt="Thales logo" />
                    </Link>
                    <Link target="_blank" rel="noreferrer" height={'45px'} href="https://www.optimism.io/">
                        <Initiative src={OptimismLogo} alt="Optimism logo" />
                    </Link>
                </Initiatives>
            </Section>
            <Section className="second">
                <Zebro className="basketball" src={ZebraBasketball} alt="Zebro Basketball" />
                <LargeText className="second in-front">{t('landing-page.no-kyc')}</LargeText>
                <CallToAction className="second">
                    <SPAAnchor href={buildHref(ROUTES.Markets.Home)}>
                        {t('landing-page.launch-dapp')} <ArrowIcon className={`icon icon--arrow`} />
                    </SPAAnchor>
                </CallToAction>
                <SubSection className="first">{t('landing-page.leagues')}</SubSection>
                <CarouselContainer>
                    <Carousel
                        transitionTime={1000}
                        showStatus={false}
                        showArrows={false}
                        showThumbs={false}
                        swipeable={true}
                        infiniteLoop={true}
                        dynamicHeight={true}
                        autoPlay={true}
                        centerSlidePercentage={25}
                    >
                        <CarouselIconContainer>
                            <LeagueIcon className="icon-league icon-league--fifa-world-cup" />
                            <LeagueIcon className="icon-league icon-league--uefa-cl" />
                            <LeagueIcon className="icon-league icon-league--epl" />
                            <LeagueIcon className="icon-league icon-league--la-liga" />
                        </CarouselIconContainer>
                        <CarouselIconContainer>
                            <LeagueIcon className="icon-league icon-league--nba" />
                            <LeagueIcon className="icon-league icon-league--nhl" />
                            <LeagueIcon className="icon-league icon-league--nfl" />
                            <LeagueIcon className="icon-league icon-league--mlb" />
                        </CarouselIconContainer>
                        <CarouselIconContainer>
                            <LeagueIcon className="icon-league icon-league--ncaa" />
                            <LeagueIcon className="icon-league icon-league--ufc" />
                            <LeagueIcon className="icon-league icon-league--f1" />
                            <LeagueIcon className="icon-league icon-league--motogp" />
                        </CarouselIconContainer>
                        <CarouselIconContainer>
                            <LeagueIcon className="icon-league icon-league--ligue1" />
                            <LeagueIcon className="icon-league icon-league--serie-a" />
                            <LeagueIcon className="icon-league icon-league--bundesliga" />
                            <LeagueIcon className="icon-league icon-league--mls" />
                        </CarouselIconContainer>
                    </Carousel>
                </CarouselContainer>
            </Section>
            <SectionRow>
                <InfoBox>
                    <InfoBoxTitle>{t('landing-page.info-text-title-1')}</InfoBoxTitle>
                    <InfoBoxText>{t('landing-page.info-text-1')}</InfoBoxText>
                </InfoBox>
                <InfoBox>
                    <InfoBoxTitle>{t('landing-page.info-text-title-2')}</InfoBoxTitle>
                    <InfoBoxText>{t('landing-page.info-text-2')}</InfoBoxText>
                </InfoBox>
                <InfoBox>
                    <InfoBoxTitle>{t('landing-page.info-text-title-3')}</InfoBoxTitle>
                    <InfoBoxText>{t('landing-page.info-text-3')}</InfoBoxText>
                </InfoBox>
                <InfoBox>
                    <InfoBoxTitle>{t('landing-page.info-text-title-4')}</InfoBoxTitle>
                    <InfoBoxText>{t('landing-page.info-text-4')}</InfoBoxText>
                </InfoBox>
                <InfoBox>
                    <InfoBoxTitle>{t('landing-page.info-text-title-5')}</InfoBoxTitle>
                    <InfoBoxText>{t('landing-page.info-text-5')}</InfoBoxText>
                </InfoBox>
                <InfoBox className="last">
                    <CallToAction className="info-box">
                        <SPAAnchor href={buildHref(ROUTES.Markets.Home)}>
                            {t('landing-page.browse-markets')}
                            <ArrowIcon className={`icon icon--triple-arrow triple`} />
                        </SPAAnchor>
                    </CallToAction>
                </InfoBox>
            </SectionRow>
            <Section className="third">
                <Zebro className="nfl" src={ZebraNfl} alt="Zebro American Football" />
                <LargeText className="third in-front">{t('landing-page.web3-positioning')}</LargeText>
                <CallToAction className="third">
                    <SPAAnchor href={buildHref(ROUTES.Markets.Home)}>
                        {t('landing-page.try-now')} <ArrowIcon className={`icon icon--arrow`} />
                    </SPAAnchor>
                </CallToAction>
            </Section>
            <Section className="fourth">
                <Zebro className="hockey" src={ZebraHockey} alt="Zebro Hockey" />
                <LargeText className="fourth in-front">{t('landing-page.learn-more')}</LargeText>
                <SPAAnchor
                    style={{ width: '100%', zIndex: 1001, cursor: 'pointer' }}
                    href={buildHref(LINKS.Footer.Docs)}
                >
                    <SubSection className="first">{t('landing-page.documentation')}</SubSection>
                </SPAAnchor>
            </Section>
            <Section className="fifth">
                <Zebro className="boxing" src={ZebraBoxing} alt="Zebro Boxing" />
                <LargeText className="fifth in-front">{t('landing-page.jump-in')}</LargeText>

                <SubSection className="fifth">{t('landing-page.open-overtime')}</SubSection>
                <CallToAction className="fifth">
                    <SPAAnchor href={buildHref(ROUTES.Markets.Home)}>
                        {t('landing-page.try-now')} <ArrowIcon className={`icon icon--arrow`} />
                    </SPAAnchor>
                </CallToAction>
            </Section>
            <Section className="sixth">
                <Zebro className="racing" src={ZebraRacing} alt="Zebro Racing " />
                <DiscordInfo>
                    <DiscordLink target="_blank" rel="noreferrer" href={LINKS.Footer.Discord}>
                        <DiscordIcon src={DiscordLogo} />
                        {t('landing-page.join-discord')}
                    </DiscordLink>
                </DiscordInfo>
            </Section>
        </Container>
    );
};

export default LandingPage;
