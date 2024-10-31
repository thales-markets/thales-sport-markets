import { Banner, useBannersQuery } from 'queries/banners/useBannersQuery';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';

const BannerCarousel: React.FC = () => {
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const bannersQuery = useBannersQuery(networkId);

    const banners: Banner[] = useMemo(() => {
        return bannersQuery.isSuccess && bannersQuery.data ? bannersQuery.data : [];
    }, [bannersQuery.isSuccess, bannersQuery.data]);

    return (
        <Container>
            {banners.length > 0 && (
                <Carousel
                    transitionTime={1000}
                    interval={10000}
                    showStatus={false}
                    showArrows={false}
                    showThumbs={false}
                    infiniteLoop={true}
                    dynamicHeight={true}
                    autoPlay={true}
                    onClickItem={(index) => {
                        if (banners[index].url !== '') {
                            window.open(banners[index].url);
                        }
                    }}
                >
                    {banners.map((banner: Banner) => (
                        <StyledDiv key={banner.image} hasHref={banner.url !== ''} image={banner.image} />
                    ))}
                </Carousel>
            )}
        </Container>
    );
};

const Container = styled.div`
    position: relative;
    z-index: 0;
    width: 263px;
    height: 263px;
    border-radius: 11px;
    overflow: hidden;
    margin: 0 0 15px 0;
    max-width: 100%;
    margin-right: 15px;
    @media (max-width: 1199px) {
        margin-right: 5px;
    }
    .dot.selected {
        opacity: 0 !important;
    }
`;

const StyledDiv = styled.div<{ image: string; hasHref: boolean }>`
    max-width: 100%;
    width: 263px;
    height: 263px;
    background-image: ${(props) => `url(${props.image})`};
    cursor: ${(props) => (props.hasHref ? 'pointer' : 'default')};
    background-position: center;
`;

export default BannerCarousel;
