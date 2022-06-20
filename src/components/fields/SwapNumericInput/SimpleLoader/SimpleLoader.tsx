import React from 'react';
import { Oval } from 'react-loader-spinner';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';

const SimpleLoader: React.FC = () => {
    return (
        <Wrapper>
            <Oval
                color="#ce348a"
                height={20}
                width={20}
                secondaryColor="#f6f6fe"
                ariaLabel="loading-indicator"
                strokeWidth={5}
            />
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivCentered)`
    position: absolute;
    right: 0;
    top: -2px;
`;

export default SimpleLoader;
