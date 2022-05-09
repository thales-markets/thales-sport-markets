import React from 'react';
import { Oval } from 'react-loader-spinner';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';

const Loader: React.FC = () => {
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
    position: fixed;
    height: 100%;
    width: 100%;
    background: ${(props) => props.theme.background.primary};
`;

export default Loader;
