import React from 'react';
import { Oval } from 'react-loader-spinner';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';

const SimpleLoader: React.FC = () => {
    return (
        <Wrapper>
            <Oval
                color="#ce348a"
                height={60}
                width={60}
                secondaryColor="#f6f6fe"
                ariaLabel="loading-indicator"
                strokeWidth={2}
            />
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivCentered)`
    position: absolute;
    left: calc(50% - 30px);
    top: calc(50% - 30px);
`;

export default SimpleLoader;
