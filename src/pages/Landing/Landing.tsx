import bankImage from 'assets/images/landing/bank.png';
import { ReactComponent as Impression1Image } from 'assets/images/landing/impression-1.svg';
import { ReactComponent as Impression2Image } from 'assets/images/landing/impression-2.svg';
import { ReactComponent as Impression3Image } from 'assets/images/landing/impression-3.svg';
import { ReactComponent as LiveGameImage } from 'assets/images/landing/live-game.svg';
import { ReactComponent as OverdropRewardsImage } from 'assets/images/landing/overdrop-rewards.svg';
import Collapse from 'components/Collapse';
import { Trans } from 'react-i18next';
import { Carousel } from 'react-responsive-carousel';
import { FlexChild, FlexDivColumn } from 'styles/common';
import {
    CarouselContainer,
    CarouselIconContainer,
    Container,
    Description,
    FAQAnswer,
    HomepageIcon,
    Initiatives,
    LandingButton,
    LeagueIcon,
    LogoLink,
    Row,
    Section,
    Subtitle,
    Title,
    TitleContainer,
} from './styled-components';
import SPAAnchor from 'components/SPAAnchor';
import { buildHref } from 'utils/routes';
import ROUTES from 'constants/routes';
import ProgressLine from 'pages/Overdrop/components/ProgressLine';

const Landing: React.FC = () => {
    return (
        <>
            <Container gap={20}>
                <TitleContainer>
                    <Title>
                        <Trans
                            i18nKey={'landing.title-1'}
                            components={{
                                span: <span />,
                            }}
                        />
                    </Title>
                    <Title>
                        <Trans
                            i18nKey={'landing.title-2'}
                            components={{
                                span: <span />,
                            }}
                        />
                    </Title>
                </TitleContainer>
                <Description>
                    <Trans
                        i18nKey={'landing.title-description'}
                        components={{
                            span: <span />,
                        }}
                    />
                </Description>
                <Row>
                    <FlexChild flex={0.6}>
                        <Subtitle>
                            <Trans
                                i18nKey={'landing.connect-title'}
                                components={{
                                    span: <span />,
                                }}
                            />
                        </Subtitle>
                        <Description>
                            <Trans i18nKey={'landing.connect-description'} />
                        </Description>
                    </FlexChild>
                </Row>
                <Row justify="center">
                    <SPAAnchor href={buildHref(ROUTES.Markets.Home)}>
                        <LandingButton>
                            <Trans i18nKey={'landing.open-dapp'} />
                        </LandingButton>
                    </SPAAnchor>
                </Row>
                <Row>
                    <FlexChild>
                        <LiveGameImage />
                    </FlexChild>
                    <FlexChild>
                        <Subtitle align="right">
                            <Trans
                                i18nKey={'landing.live-games-title'}
                                components={{
                                    span: <span />,
                                    br: <br />,
                                }}
                            />
                        </Subtitle>
                        <Description align="right">
                            <Trans i18nKey={'landing.live-games-description'} />
                        </Description>
                    </FlexChild>
                </Row>
                <Row>
                    <FlexChild flex={0.6}>
                        <Subtitle>
                            <Trans
                                i18nKey={'landing.win-title'}
                                components={{
                                    span: <span />,
                                }}
                            />
                        </Subtitle>
                        <Description>
                            <Trans i18nKey={'landing.win-description'} />
                        </Description>
                    </FlexChild>
                </Row>
                <Row justify={'flex-end'}>
                    <FlexChild flex={0.5}>
                        <Subtitle>
                            <Trans
                                i18nKey={'landing.various-title'}
                                components={{
                                    span: <span />,
                                }}
                            />
                        </Subtitle>
                        <Description>
                            <Trans i18nKey={'landing.various-description'} />
                        </Description>
                    </FlexChild>
                </Row>
                <Row align={'center'} justify={'center'}>
                    <FlexChild>
                        <ProgressLine
                            progressUpdate={0}
                            progress={80}
                            currentPoints={4800}
                            currentLevelMinimum={0}
                            nextLevelMinimumPoints={6000}
                            level={0}
                            hideLevelLabel={true}
                            height="20px"
                        />
                        <Subtitle>
                            <Trans
                                i18nKey={'landing.rewards-title'}
                                components={{
                                    span: <span />,
                                }}
                            />
                        </Subtitle>
                        <Description>
                            <Trans i18nKey={'landing.rewards-description'} />
                        </Description>
                    </FlexChild>
                    <FlexChild>
                        <OverdropRewardsImage />
                    </FlexChild>
                </Row>
                <Row align={'center'} justify={'center'}>
                    <FlexChild>
                        <img style={{ width: '400px' }} src={bankImage} />
                    </FlexChild>
                    <FlexChild>
                        <Subtitle>
                            <Trans
                                i18nKey={'landing.house-title'}
                                components={{
                                    span: <span />,
                                }}
                            />
                        </Subtitle>
                        <Description>
                            <Trans i18nKey={'landing.house-description'} />
                        </Description>
                    </FlexChild>
                </Row>
                <Section>
                    <Subtitle>
                        <Trans
                            i18nKey={'landing.impressions-title'}
                            components={{
                                span: <span />,
                            }}
                        />
                    </Subtitle>
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
                                <Impression1Image />
                                <Impression2Image />
                                <Impression3Image />
                            </CarouselIconContainer>
                            <CarouselIconContainer>
                                <Impression1Image />
                                <Impression2Image />
                                <Impression3Image />
                            </CarouselIconContainer>
                        </Carousel>
                    </CarouselContainer>
                </Section>
                <Subtitle>
                    <span>FAQ</span>
                </Subtitle>
                <FlexDivColumn>
                    <Collapse
                        title={'Do I need to do KYC to play on Overtime?'}
                        additionalStyling={{
                            titleFontFamily: 'DMSans !important',
                            downwardsArrowAlignRight: true,
                            titleMarginRight: '5px',
                        }}
                    >
                        <FAQAnswer>
                            {
                                "No. Overtime Markets won't collect your personalized data or require you to submit official documentation to be able to use the platform. You can sign up using an Ethereum wallet or your social account."
                            }
                        </FAQAnswer>
                    </Collapse>
                    <Collapse
                        title={'Do I need to do KYC to play on Overtime?'}
                        additionalStyling={{
                            titleFontFamily: 'DMSans !important',
                            downwardsArrowAlignRight: true,
                            titleMarginRight: '5px',
                        }}
                    >
                        <FAQAnswer>
                            {
                                "No. Overtime Markets won't collect your personalized data or require you to submit official documentation to be able to use the platform. You can sign up using an Ethereum wallet or your social account."
                            }
                        </FAQAnswer>
                    </Collapse>
                </FlexDivColumn>
                <Subtitle>
                    <span>Powered by</span>
                </Subtitle>
                <Initiatives>
                    <LogoLink target="_blank" rel="norefferer" href="https://www.optimism.io/">
                        <HomepageIcon fontSize="250px" className="icon-homepage icon--optimism-logo" />
                    </LogoLink>
                    <LogoLink target="_blank" rel="norefferer" href="https://www.arbitrum.io/">
                        <HomepageIcon fontSize="250px" className="icon-homepage icon--arbitrum-logo" />
                    </LogoLink>
                    <LogoLink target="_blank" rel="norefferer" href="https://www.base.org/">
                        <HomepageIcon fontSize="250px" className="icon-homepage icon--base-logo" />
                    </LogoLink>
                </Initiatives>
                <Initiatives>
                    <LogoLink target="_blank" rel="norefferer" href="https://thalesmarket.io/">
                        <HomepageIcon fontSize="250px" className="icon-homepage icon--thales-logo" />
                    </LogoLink>
                    <LogoLink target="_blank" rel="norefferer" href="https://chain.link/">
                        <HomepageIcon fontSize="250px" className="icon-homepage icon--chainlink-logo" />
                    </LogoLink>
                </Initiatives>
                <Section>
                    <Subtitle>
                        <span>Supported sports, events, and leagues:</span>
                    </Subtitle>
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
                                    <LeagueIcon className="icon-homepage league--ucl" />
                                </LogoLink>
                                <LogoLink
                                    target="_blank"
                                    rel="norefferer"
                                    href="https://www.uefa.com/uefaeuropaleague/"
                                >
                                    <LeagueIcon className="icon-homepage league--uel" />
                                </LogoLink>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.premierleague.com/">
                                    <LeagueIcon className="icon-homepage league--epl" />
                                </LogoLink>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.laliga.com/en-GB">
                                    <LeagueIcon className="icon-homepage league--la-liga" />
                                </LogoLink>
                            </CarouselIconContainer>
                            <CarouselIconContainer>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.nba.com/">
                                    <LeagueIcon className="icon-homepage league--nba" />
                                </LogoLink>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.nhl.com/">
                                    <LeagueIcon className="icon-homepage league--nhl" />
                                </LogoLink>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.nfl.com/">
                                    <LeagueIcon className="icon-homepage league--nfl" />
                                </LogoLink>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.mlb.com/">
                                    <LeagueIcon className="icon-homepage league--mlb" />
                                </LogoLink>
                            </CarouselIconContainer>
                            <CarouselIconContainer>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.ncaa.com/">
                                    <LeagueIcon className="icon-homepage league--ncaa" />
                                </LogoLink>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.ufc.com/">
                                    <LeagueIcon className="icon-homepage league--ufc" />
                                </LogoLink>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.formula1.com/">
                                    <LeagueIcon className="icon-homepage league--f1" />
                                </LogoLink>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.motogp.com/">
                                    <LeagueIcon className="icon-homepage league--motogp" />
                                </LogoLink>
                            </CarouselIconContainer>
                            <CarouselIconContainer>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.ligue1.com/">
                                    <LeagueIcon className="icon-homepage league--ligue1" />
                                </LogoLink>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.legaseriea.it/">
                                    <LeagueIcon className="icon-homepage league--serie-a" />
                                </LogoLink>
                                <LogoLink
                                    target="_blank"
                                    rel="norefferer"
                                    href="https://www.bundesliga.com/en/bundesliga"
                                >
                                    <LeagueIcon className="icon-homepage league--bundesliga" />
                                </LogoLink>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.mlssoccer.com/">
                                    <LeagueIcon className="icon-homepage league--mls" />
                                </LogoLink>
                            </CarouselIconContainer>
                            <CarouselIconContainer>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.jleague.co/">
                                    <LeagueIcon className="icon-homepage league--j1" />
                                </LogoLink>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.atptour.com/en/">
                                    <LeagueIcon className="icon-homepage league--atp" />
                                </LogoLink>
                                <LogoLink target="_blank" rel="norefferer" href="https://www.wtatennis.com/">
                                    <LeagueIcon className="icon-homepage league--wta" />
                                </LogoLink>
                                <LogoLink target="_blank" rel="norefferer" href="https://iesf.org/">
                                    <LeagueIcon className="icon-homepage league--csgo" />
                                </LogoLink>
                                <LogoLink target="_blank" rel="norefferer" href="https://iesf.org/">
                                    <LeagueIcon className="icon-homepage league--dota2" />
                                </LogoLink>
                                <LogoLink target="_blank" rel="norefferer" href="https://iesf.org/">
                                    <LeagueIcon className="icon-homepage league--lol" />
                                </LogoLink>
                            </CarouselIconContainer>
                        </Carousel>
                    </CarouselContainer>
                </Section>
            </Container>
        </>
    );
};

export default Landing;
