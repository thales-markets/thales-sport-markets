import SPAAnchor from 'components/SPAAnchor';
import { LINKS } from 'constants/links';
import ROUTES from 'constants/routes';
import { t } from 'i18next';
import { Carousel } from 'react-responsive-carousel';
import { buildHref } from 'utils/routes';
import {
    ArrowIcon,
    CallToAction,
    CarouselContainer,
    CarouselIconContainer,
    Container,
    DiscordInfo,
    DiscordLink,
    DocsLink,
    HomepageIcon,
    InfoBox,
    InfoBoxText,
    InfoBoxTitle,
    Initiatives,
    LargeText,
    LogoLink,
    Section,
    SectionRow,
    SubSection,
} from './styled-components';

const Landing: React.FC = () => {
    return (
        <>
            <Container>
                <Section className="first">
                    <LargeText className="first">{t('landing-page.best-odds')}</LargeText>
                    <CallToAction className="first">
                        <SPAAnchor href={buildHref(ROUTES.Markets.Home)}>
                            {t('landing-page.try-now')} <ArrowIcon className={`icon icon--caret-right`} />
                        </SPAAnchor>
                    </CallToAction>
                    <SubSection className="first">{t('landing-page.powered-by')}</SubSection>
                    <Initiatives>
                        <LogoLink target="_blank" rel="norefferer" href="https://chain.link/">
                            <HomepageIcon fontSize={250} className="icon-homepage icon--optimism-logo" />
                        </LogoLink>
                        <LogoLink target="_blank" rel="norefferer" href="https://thalesmarket.io/">
                            <HomepageIcon fontSize={250} className="icon-homepage icon--arbitrum-logo" />
                        </LogoLink>
                        <LogoLink target="_blank" rel="norefferer" href="https://www.optimism.io/">
                            <HomepageIcon fontSize={250} className="icon-homepage icon--base-logo" />
                        </LogoLink>
                    </Initiatives>
                    <Initiatives>
                        <LogoLink target="_blank" rel="norefferer" href="https://www.arbitrum.io/">
                            <HomepageIcon fontSize={250} className="icon-homepage icon--thales-logo" />
                        </LogoLink>
                        <LogoLink target="_blank" rel="norefferer" href="https://www.arbitrum.io/">
                            <HomepageIcon fontSize={250} className="icon-homepage icon--chainlink-logo" />
                        </LogoLink>
                    </Initiatives>
                </Section>
                <Section className="second">
                    <LargeText className="second in-front">{t('landing-page.no-kyc')}</LargeText>
                    <CallToAction className="second">
                        <SPAAnchor href={buildHref(ROUTES.Markets.Home)}>
                            {t('landing-page.launch-dapp')} <ArrowIcon className={`icon icon--caret-right`} />
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
                                    rel="norefferer"
                                    href="https://www.uefa.com/uefachampionsleague/"
                                >
                                    <HomepageIcon className="icon-homepage league--ucl" />
                                </LogoLink>
                                <LogoLink
                                    target="_blank"
                                    rel="norefferer"
                                    href="https://www.uefa.com/uefaeuropaleague/"
                                >
                                    <HomepageIcon className="icon-homepage league--uel" />
                                </LogoLink>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.premierleague.com/">
                                    <HomepageIcon className="icon-homepage league--epl" />
                                </LogoLink>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.laliga.com/en-GB">
                                    <HomepageIcon className="icon-homepage league--la-liga" />
                                </LogoLink>
                            </CarouselIconContainer>
                            <CarouselIconContainer>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.nba.com/">
                                    <HomepageIcon className="icon-homepage league--nba" />
                                </LogoLink>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.nhl.com/">
                                    <HomepageIcon className="icon-homepage league--nhl" />
                                </LogoLink>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.nfl.com/">
                                    <HomepageIcon className="icon-homepage league--nfl" />
                                </LogoLink>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.mlb.com/">
                                    <HomepageIcon className="icon-homepage league--mlb" />
                                </LogoLink>
                            </CarouselIconContainer>
                            <CarouselIconContainer>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.ncaa.com/">
                                    <HomepageIcon className="icon-homepage league--ncaa" />
                                </LogoLink>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.ufc.com/">
                                    <HomepageIcon className="icon-homepage league--ufc" />
                                </LogoLink>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.formula1.com/">
                                    <HomepageIcon className="icon-homepage league--f1" />
                                </LogoLink>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.motogp.com/">
                                    <HomepageIcon className="icon-homepage league--motogp" />
                                </LogoLink>
                            </CarouselIconContainer>
                            <CarouselIconContainer>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.ligue1.com/">
                                    <HomepageIcon className="icon-homepage league--ligue1" />
                                </LogoLink>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.legaseriea.it/">
                                    <HomepageIcon className="icon-homepage league--serie-a" />
                                </LogoLink>
                                <LogoLink
                                    target="_blank"
                                    rel="norefferer"
                                    href="https://www.bundesliga.com/en/bundesliga"
                                >
                                    <HomepageIcon className="icon-homepage league--bundesliga" />
                                </LogoLink>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.mlssoccer.com/">
                                    <HomepageIcon className="icon-homepage league--mls" />
                                </LogoLink>
                            </CarouselIconContainer>
                            <CarouselIconContainer>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.jleague.co/">
                                    <HomepageIcon className="icon-homepage league--j1" />
                                </LogoLink>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.atptour.com/en/">
                                    <HomepageIcon className="icon-homepage league--atp" />
                                </LogoLink>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.wtatennis.com/">
                                    <HomepageIcon className="icon-homepage league--wta" />
                                </LogoLink>
                                <LogoLink target="_blank" rel="norefferer" href="https://iesf.org/">
                                    <HomepageIcon className="icon-homepage league--csgo" />
                                </LogoLink>
                                <LogoLink target="_blank" rel="norefferer" href="https://iesf.org/">
                                    <HomepageIcon className="icon-homepage league--dota2" />
                                </LogoLink>
                                <LogoLink target="_blank" rel="norefferer" href="https://iesf.org/">
                                    <HomepageIcon className="icon-homepage league--lol" />
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
                    <LargeText className="fourth in-front">{t('landing-page.learn-more')}</LargeText>
                    <CallToAction className="fourth">
                        <DocsLink href={LINKS.Footer.Docs}>
                            {t('landing-page.read-now')} <ArrowIcon className={`icon icon--caret-right`} />
                        </DocsLink>
                    </CallToAction>
                    <SubSection className="first">{t('landing-page.documentation')}</SubSection>
                </Section>
                <Section className="fifth">
                    <LargeText className="fifth in-front">{t('landing-page.jump-in')}</LargeText>
                    <SubSection className="fifth">{t('landing-page.open-overtime')}</SubSection>
                    <CallToAction className="fifth">
                        <SPAAnchor href={buildHref(ROUTES.Markets.Home)}>
                            {t('landing-page.try-now')} <ArrowIcon className={`icon icon--caret-right`} />
                        </SPAAnchor>
                    </CallToAction>
                </Section>
                <Section className="sixth">
                    <DiscordInfo>
                        <DiscordLink target="_blank" rel="noreferrer" href={LINKS.Footer.Discord}>
                            {/* <DiscordIcon src={DiscordLogo} /> */}
                            {t('landing-page.join-discord')}
                        </DiscordLink>
                    </DiscordInfo>
                </Section>
            </Container>
        </>
    );
};

export default Landing;
