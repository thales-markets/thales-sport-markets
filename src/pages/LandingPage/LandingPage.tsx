import ChainlinkLogo from 'assets/images/landing-page/chainlink.svg';
import DiscordLogo from 'assets/images/landing-page/discord.svg';
import OptimismLogo from 'assets/images/landing-page/optimism.svg';
import ThalesLogo from 'assets/images/landing-page/thales.svg';
import ZebraBaseball from 'assets/images/landing-page/zebra-baseball.svg';
import ZebraBasketball from 'assets/images/landing-page/zebra-basketball.svg';
import ZebraBoxing from 'assets/images/landing-page/zebra-boxing.svg';
import ZebraHockey from 'assets/images/landing-page/zebra-hockey.svg';
import ZebraRacing from 'assets/images/landing-page/zebra-racing.svg';
import OvertimeLogo from 'assets/images/overtime-logo.svg';
import LanguageSelector from 'components/LanguageSelector';
import SPAAnchor from 'components/SPAAnchor';
import { LINKS } from 'constants/links';
import ROUTES from 'constants/routes';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { FlexDivRowCentered } from 'styles/common';
import { buildHref } from 'utils/routes';
import {
    ArrowIcon,
    CallToAction,
    CarouselContainer,
    CarouselIconContainer,
    Container,
    DiscordIcon,
    DiscordInfo,
    DiscordLink,
    DocsLink,
    Header,
    InfoBox,
    InfoBoxText,
    InfoBoxTitle,
    Initiative,
    InitiativeLink,
    Initiatives,
    LargeText,
    LeagueIcon,
    Logo,
    LogoContainer,
    LogoLink,
    Section,
    SectionRow,
    SubSection,
    Zebro,
} from './styled-components';

const LandingPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Container>
            <Header>
                <LogoContainer>
                    <Logo src={OvertimeLogo} alt="overtime logo" />
                </LogoContainer>
                <FlexDivRowCentered>
                    <LanguageSelector />
                    <CallToAction className="header">
                        <SPAAnchor href={buildHref(ROUTES.Markets.Home)}>
                            DAPP <ArrowIcon className={`icon icon--arrow`} />
                        </SPAAnchor>
                    </CallToAction>
                </FlexDivRowCentered>
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
                    <InitiativeLink target="_blank" rel="noreferrer" height={'42px'} href="https://chain.link/">
                        <Initiative src={ChainlinkLogo} alt="Chainlink logo" />
                    </InitiativeLink>
                    <InitiativeLink target="_blank" rel="noreferrer" height={'39px'} href="https://thalesmarket.io/">
                        <Initiative src={ThalesLogo} alt="Thales logo" />
                    </InitiativeLink>
                    <InitiativeLink target="_blank" rel="noreferrer" height={'27px'} href="https://www.optimism.io/">
                        <Initiative src={OptimismLogo} alt="Optimism logo" />
                    </InitiativeLink>
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
                            <LogoLink
                                target="_blank"
                                rel="noreferrer"
                                href="https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/qatar2022"
                            >
                                <LeagueIcon className="icon-league icon-league--fifa-world-cup" />
                            </LogoLink>
                            <LogoLink target="_blank" rel="norefferer" href="https://www.uefa.com/uefachampionsleague/">
                                <LeagueIcon className="icon-league icon-league--uefa-cl" />
                            </LogoLink>
                            <LogoLink target="_blank" rel="norefferer" href="https://www.premierleague.com/">
                                <LeagueIcon className="icon-league icon-league--epl" />
                            </LogoLink>
                            <LogoLink target="_blank" rel="norefferer" href="https://www.laliga.com/en-GB">
                                <LeagueIcon className="icon-league icon-league--la-liga" />
                            </LogoLink>
                        </CarouselIconContainer>
                        <CarouselIconContainer>
                            <LogoLink target="_blank" rel="norefferer" href="https://www.nba.com/">
                                <LeagueIcon className="icon-league icon-league--nba" />
                            </LogoLink>
                            <LogoLink target="_blank" rel="norefferer" href="https://www.nhl.com/">
                                <LeagueIcon className="icon-league icon-league--nhl" />
                            </LogoLink>
                            <LogoLink target="_blank" rel="norefferer" href="https://www.nfl.com/">
                                <LeagueIcon className="icon-league icon-league--nfl" />
                            </LogoLink>
                            <LogoLink target="_blank" rel="norefferer" href="https://www.mlb.com/">
                                <LeagueIcon className="icon-league icon-league--mlb" />
                            </LogoLink>
                        </CarouselIconContainer>
                        <CarouselIconContainer>
                            <LogoLink target="_blank" rel="norefferer" href="https://www.ncaa.com/">
                                <LeagueIcon className="icon-league icon-league--ncaa" />
                            </LogoLink>
                            <LogoLink target="_blank" rel="norefferer" href="https://www.ufc.com/">
                                <LeagueIcon className="icon-league icon-league--ufc" />
                            </LogoLink>
                            <LogoLink target="_blank" rel="norefferer" href="https://www.formula1.com/">
                                <LeagueIcon className="icon-league icon-league--f1" />
                            </LogoLink>
                            <LogoLink target="_blank" rel="norefferer" href="https://www.motogp.com/">
                                <LeagueIcon className="icon-league icon-league--motogp" />
                            </LogoLink>
                        </CarouselIconContainer>
                        <CarouselIconContainer>
                            <LogoLink target="_blank" rel="norefferer" href="https://www.ligue1.com/">
                                <LeagueIcon className="icon-league icon-league--ligue1" />
                            </LogoLink>
                            <LogoLink target="_blank" rel="norefferer" href="https://www.legaseriea.it/">
                                <LeagueIcon className="icon-league icon-league--serie-a" />
                            </LogoLink>
                            <LogoLink target="_blank" rel="norefferer" href="https://www.bundesliga.com/en/bundesliga">
                                <LeagueIcon className="icon-league icon-league--bundesliga" />
                            </LogoLink>
                            <LogoLink target="_blank" rel="norefferer" href="https://www.mlssoccer.com/">
                                <LeagueIcon className="icon-league icon-league--mls" />
                            </LogoLink>
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
            <Section className="fourth">
                <Zebro className="hockey" src={ZebraHockey} alt="Zebro Hockey" />
                <LargeText className="fourth in-front">{t('landing-page.learn-more')}</LargeText>
                <CallToAction className="fourth">
                    <DocsLink href={LINKS.Footer.Docs}>
                        {t('landing-page.read-now')} <ArrowIcon className={`icon icon--arrow`} />
                    </DocsLink>
                </CallToAction>
                <SubSection className="first">{t('landing-page.documentation')}</SubSection>
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
