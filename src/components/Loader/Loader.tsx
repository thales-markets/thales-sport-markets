import React from 'react';
import { Oval } from 'react-loader-spinner';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { ThemeInterface } from 'types/ui';

const Loader: React.FC = () => {
    const theme: ThemeInterface = useTheme();

    return (
        <Wrapper>
            <Oval
                color={theme.textColor.quaternary}
                height={60}
                width={60}
                secondaryColor={theme.textColor.primary}
                ariaLabel="loading-indicator"
                strokeWidth={2}
            />
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivCentered)`
    position: relative;
    height: 100vh;
    background: ${(props) => props.theme.background.primary};
`;

export default Loader;
