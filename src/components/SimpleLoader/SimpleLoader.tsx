import React from 'react';
import { Oval } from 'react-loader-spinner';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { ThemeInterface } from 'types/ui';

const DEFAULT_SIZE = 60;
const DEFAULT_STROKE_WIDTH = 2;

const SimpleLoader: React.FC<{ size?: number; strokeWidth?: number }> = ({ size, strokeWidth }) => {
    const theme: ThemeInterface = useTheme();

    return (
        <Wrapper size={size}>
            <Oval
                color={theme.textColor.quaternary}
                height={size || DEFAULT_SIZE}
                width={size || DEFAULT_SIZE}
                secondaryColor={theme.textColor.primary}
                ariaLabel="loading-indicator"
                strokeWidth={strokeWidth || DEFAULT_STROKE_WIDTH}
            />
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivCentered)<{ size?: number }>`
    position: absolute;
    left: calc(50% - ${(props) => (props.size ? props.size : DEFAULT_SIZE) / 2}px);
    top: calc(50% - ${(props) => (props.size ? props.size : DEFAULT_SIZE) / 2}px);
`;

export default SimpleLoader;
