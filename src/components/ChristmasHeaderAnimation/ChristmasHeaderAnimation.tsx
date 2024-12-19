import Snowfall from 'react-snowfall';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';

const ChristmasHeaderAnimation: React.FC = () => {
    return (
        <Wrapper>
            <Snowfall snowflakeCount={80} radius={[0.5, 2]} speed={[0.5, 3]} />
        </Wrapper>
    );
};

const Wrapper = styled(FlexDiv)`
    z-index: 0;
    position: absolute;
    top: 0;
    width: 100%;
    height: 200px;
    padding: 0px !important;
`;

export default ChristmasHeaderAnimation;
