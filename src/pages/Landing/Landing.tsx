import bankImage from 'assets/images/landing/bank.png';
import { ReactComponent as Impression1Image } from 'assets/images/landing/impression-1.svg';
import { ReactComponent as Impression2Image } from 'assets/images/landing/impression-2.svg';
import { ReactComponent as Impression3Image } from 'assets/images/landing/impression-3.svg';
import { ReactComponent as LiveGameImage } from 'assets/images/landing/live-game.svg';
import { ReactComponent as OverdropRewardsImage } from 'assets/images/landing/overdrop-rewards.svg';
import Collapse from 'components/Collapse';
import { Trans } from 'react-i18next';
import { Carousel } from 'react-responsive-carousel';
import { FlexChild, FlexDiv, FlexDivColumn } from 'styles/common';
import {
    CarouselContainer,
    CarouselIconContainer,
    Container,
    Description,
    FAQAnswer,
    IFrameContainer,
    HomepageIcon,
    IFrame,
    Initiatives,
    LandingButton,
    LeagueIcon,
    LogoLink,
    Row,
    Section,
    Subtitle,
    Title,
    TitleContainer,
    Screenshot,
    Play,
    NewsWrapper,
    NewsTitle,
} from './styled-components';
import SPAAnchor from 'components/SPAAnchor';
import { buildHref } from 'utils/routes';
import ROUTES from 'constants/routes';
import ProgressLine from 'pages/Overdrop/components/ProgressLine';
import { useMemo, useState } from 'react';
import { usePromotionsQuery } from 'queries/promotions/usePromotionsQuery';
import { getIsAppReady } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import { useSelector } from 'react-redux';
import { getPromotionStatus } from 'utils/ui';
import { PromotionStatus } from 'types/ui';
import { chunk } from 'lodash';

let promotionsCache: any[] = [];

const Landing: React.FC = () => {
    const [showIFrame, setShowIFrame] = useState(false);
    const [showIScreenshot, setShowIScreenshot] = useState(true);

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));

    const promotionsQuery = usePromotionsQuery('', {
        enabled: isAppReady,
    });

    const promotionsChunks = useMemo(() => {
        const promotions = promotionsQuery.isSuccess && promotionsQuery.data ? promotionsQuery.data : promotionsCache;
        const chunkedPromotions = chunk(
            promotions.filter((item) => {
                const status = getPromotionStatus(item.startDate, item.endDate);
                return status == PromotionStatus.ONGOING || status == PromotionStatus.COMING_SOON;
            }),
            3
        );
        promotionsCache = chunkedPromotions;
        return chunkedPromotions;
    }, [promotionsQuery.data, promotionsQuery.isSuccess]);

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
                <Row justify="center">
                    <IFrameContainer>
                        {showIFrame && (
                            <IFrame
                                width="100%"
                                height="298px"
                                src={'https://www.youtube.com/embed/udYpsNueZp4?&autoplay=1'}
                                title="test"
                                allow={
                                    'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                                }
                                allowFullScreen
                                onLoad={() => setShowIScreenshot(false)}
                            />
                        )}
                        {showIScreenshot && <Screenshot onClick={() => setShowIFrame(true)} />}
                        {showIScreenshot && <Play onClick={() => setShowIFrame(true)} />}
                    </IFrameContainer>
                </Row>
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
                <Row align="center">
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
                                    br: <br />,
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
                        <Subtitle mt="5px">
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
                <Row mt="-50px" justify="center">
                    <SPAAnchor href={buildHref(ROUTES.Markets.Home)}>
                        <LandingButton>
                            <Trans i18nKey={'landing.open-dapp'} />
                        </LandingButton>
                    </SPAAnchor>
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
                                br: <br />,
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
                <Section>
                    <Subtitle>
                        <Trans
                            i18nKey={'landing.news-title'}
                            components={{
                                span: <span />,
                                br: <br />,
                            }}
                        />
                    </Subtitle>
                    <CarouselContainer height="auto" dotsOffset="-40px">
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
                            {promotionsChunks.map((chunk, index) => {
                                return (
                                    <FlexDiv gap={10} key={index}>
                                        {chunk.map((promotion, index) => {
                                            return (
                                                <SPAAnchor
                                                    key={`${index}-${promotion.promotionUrl}`}
                                                    href={`${promotion.promotionUrl}`}
                                                >
                                                    <NewsWrapper backgroundImageUrl={promotion.backgroundImageUrl}>
                                                        <NewsTitle>{promotion.title}</NewsTitle>
                                                    </NewsWrapper>
                                                </SPAAnchor>
                                            );
                                        })}
                                    </FlexDiv>
                                );
                            })}
                        </Carousel>
                    </CarouselContainer>
                </Section>
                <Row>
                    <Subtitle>
                        <span>FAQ</span>
                    </Subtitle>
                </Row>

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
                <Row>
                    <Subtitle>
                        <span>
                            <Trans i18nKey={'landing.powered-title'} />
                        </span>
                    </Subtitle>
                </Row>
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
                        <span>
                            <Trans i18nKey={'landing.supported-title'} />
                        </span>
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
