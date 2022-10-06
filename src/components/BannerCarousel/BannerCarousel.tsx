import React from 'react';
import styled from 'styled-components';
import banner_image from 'assets/images/banner-image.jpg';

const BannerCarousel: React.FC = () => {
    return (
        <Container>
            <StyledDiv image={banner_image} />
        </Container>
    );
};

const Container = styled.div`
    width: 1700px;
    height: 165px;
    border: 1.4px solid #5f6180;
    border-radius: 11px;
    overflow: hidden;
    margin: 30px 0;
    max-width: 100%;
    @media (max-width: 768px) {
        display: none;
    }
`;

const StyledDiv = styled.div<{ image: string }>`
    max-width: 100%;
    width: 1700px;
    height: 165px;
    margin: -1px;
    background-image: ${(props) => `url(${props.image})`};
    background-position: center;
`;

export default BannerCarousel;
