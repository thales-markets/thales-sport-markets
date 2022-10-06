import React from 'react';
// import { useTranslation } from 'react-i18next';
import OvertimeLogo from 'assets/images/overtime-logo.svg';
import ZebraLogo from 'assets/images/landing-page/zebra-logo.svg';
import ZebraBaseball from 'assets/images/landing-page/zebra-baseball.svg';
import {
    Container,
    Header,
    Logo,
    Zebra,
    Section,
    ZebraBaseballImg,
    LargeText,
    CallToAction,
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
                <CallToAction className="first">{'TRY NOW'}</CallToAction>
            </Section>
            <Section></Section>
            <Section></Section>
            <Section></Section>
            <Section></Section>
            <Section></Section>
            <Section></Section>
        </Container>
    );
};

export default LandingPage;
