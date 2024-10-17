// @ts-ignore
import Spline from '@splinetool/react-spline/dist/react-spline';
import Logo from 'components/Logo';
import SPAAnchor from 'components/SPAAnchor';
import ROUTES from 'constants/routes';
import { LandingButton } from 'pages/Landing/styled-components';
import { useTranslation } from 'react-i18next';
import { buildHref } from 'utils/routes';
import { HeaderContainer, NavLinks, SplineContainer } from './styled-components';

const LandingHeader: React.FC = () => {
    const { t } = useTranslation();

    return (
        <>
            <SplineContainer>
                <Spline scene="https://prod.spline.design/TUYB2PknnYxFO6yQ/scene.splinecode" />
            </SplineContainer>

            <HeaderContainer>
                <Logo width={150} />
                <NavLinks gap={25}>
                    <span>{t('landing.nav.overdrop-token')}</span>
                    <span>{t('landing.nav.be-the-house')}</span>
                    <span>{t('landing.nav.airdrops')}</span>
                    <span>{t('landing.nav.dao')}</span>
                    <span>{t('landing.nav.blog')}</span>
                    <span>{t('landing.nav.about')}</span>
                </NavLinks>
                <SPAAnchor href={buildHref(ROUTES.Markets.Home)}>
                    <LandingButton>{t('landing.open-dapp')}</LandingButton>
                </SPAAnchor>
            </HeaderContainer>
        </>
    );
};

export default LandingHeader;
