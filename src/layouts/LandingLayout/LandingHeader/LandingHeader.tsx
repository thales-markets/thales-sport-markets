import Spline from '@splinetool/react-spline/dist/react-spline';
import Logo from 'components/Logo';
import SPAAnchor from 'components/SPAAnchor';
import ROUTES from 'constants/routes';
import { LandingButton } from 'pages/Landing/styled-components';
import { FlexDivCentered } from 'styles/common';
import { buildHref } from 'utils/routes';
import { HeaderContainer, SplineContainer } from './styled-components';

const LandingHeader: React.FC = () => {
    return (
        <>
            <SplineContainer>
                <Spline scene="https://prod.spline.design/TUYB2PknnYxFO6yQ/scene.splinecode" />
            </SplineContainer>

            <HeaderContainer>
                <Logo width={150} />
                <FlexDivCentered gap={25}>
                    <span>Overdrop token</span>
                    <span>Be the house</span>
                    <span>Airdrops</span>
                    <span>DAO</span>
                    <span>Blog</span>
                    <span>About</span>
                </FlexDivCentered>
                <SPAAnchor href={buildHref(ROUTES.Markets.Home)}>
                    <LandingButton>Open dApp</LandingButton>
                </SPAAnchor>
            </HeaderContainer>
        </>
    );
};

export default LandingHeader;
