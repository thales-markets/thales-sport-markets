import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';

type InlineLoaderProps = {
    thickness?: number;
    size?: number;
};

const InlineLoader: React.FC<InlineLoaderProps> = ({ thickness, size }) => {
    return (
        <LoaderContainer>
            <CircularProgress thickness={thickness || 7} size={size || 15} disableShrink color="inherit" />
        </LoaderContainer>
    );
};

const LoaderContainer = styled(FlexDivCentered)`
    color: ${(props) => props.theme.borderColor.tertiary};
    margin-bottom: 2px;
`;

export default InlineLoader;
