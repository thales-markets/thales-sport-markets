import React from 'react';
// import { useTranslation } from 'react-i18next';
import OvertimeLogo from 'assets/images/overtime-logo.svg';
import ZebraLogo from 'assets/images/landing-page/zebra-logo.svg';
import ZebraBaseball from 'assets/images/landing-page/zebra-baseball.svg';
import ZebraBasketball from 'assets/images/landing-page/zebra-basketball.svg';
import ChainlinkLogo from 'assets/images/landing-page/chainlink.svg';
import OptimismLogo from 'assets/images/landing-page/optimism.svg';
import ThalesLogo from 'assets/images/landing-page/thales.svg';
import {
    Container,
    Header,
    Logo,
    Zebra,
    Section,
    ZebraBaseballImg,
    LargeText,
    CallToAction,
    ArrowIcon,
    SubSection,
    Initiative,
    Initiatives,
    Link,
    ZebraBasketballImg,
} from './styled-components';

const LandingPage: React.FC = () => {
    // const { t } = useTranslation();

    return (
        <Container>
            <Header>
                <Logo src={OvertimeLogo} alt="overtime logo" />
                <Zebra src={ZebraLogo} alt="zebra logo" />
            </Header>
            <Section className="first">
                <ZebraBaseballImg src={ZebraBaseball} alt="zebra baseball" />
                <LargeText className="first">BEST ODDS IN THE INDUSTRY</LargeText>
                <CallToAction className="first">
                    {'TRY NOW'} <ArrowIcon className={`icon-exotic icon-exotic--right`} />
                </CallToAction>
                <SubSection className="first">POWERED BY</SubSection>
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
                <ZebraBasketballImg src={ZebraBasketball} alt="zebra basketball" />
                <LargeText className="second">SPORTS POSITIONING</LargeText>
                <LargeText className="second in-front">WITH NO KYC</LargeText>
                <CallToAction className="second">
                    {'LAUNCH DAPP'} <ArrowIcon className={`icon-exotic icon-exotic--right`} />
                </CallToAction>
                <SubSection className="first">LEAGUES</SubSection>
            </Section>
            <Section></Section>
            <Section></Section>
            <Section></Section>
            <Section></Section>
            <Section></Section>
        </Container>
    );
};

export default LandingPage;
