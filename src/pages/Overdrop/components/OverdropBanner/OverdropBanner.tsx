import React from 'react';
import banner from 'assets/images/overdrop/overdrop-banner.png';
import styled from 'styled-components';

const OverdropBanner: React.FC<any> = () => {
    return <Container></Container>;
};

const Container = styled.div`
    height: 202px;
    border-radius: 8px;
    border: 1px solid ${(props) => props.theme.borderColor.primary};
    background-image: url(${banner});
    margin-bottom: 20px;
    @media (max-width: 767px) {
        display: none;
    }
`;

export default OverdropBanner;
