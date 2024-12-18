import Lottie from 'lottie-react';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';

import SnowAnimationData from 'assets/lotties/snow-animation.json';

const ChristmasHeaderAnimation: React.FC = () => {
    return (
        <Wrapper>
            <Lottie animationData={SnowAnimationData} style={{ width: '100%' }} loop={2} />
        </Wrapper>
    );
};

const Wrapper = styled(FlexDiv)`
    z-index: 0;
    position: absolute;
    top: 0;
    width: 100%;
    padding: 0px !important;
`;

export default ChristmasHeaderAnimation;
