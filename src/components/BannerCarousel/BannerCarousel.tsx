import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';

const BannerCarousel: React.FC = () => {
    const [urlMap, setUrlMap] = useState<Record<number, string>>({});
    const [imageCount, setImageCount] = useState<number>(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`https://api.thalesmarket.io/banner-image-count`);
                if (response) {
                    const json = await response.json();
                    setImageCount(json.count);
                }
            } catch (e) {}
        };
        fetchData();
    }, []);

    useEffect(() => {
        const map = {} as Record<number, string>;
        const fetchData = async () => {
            for (let i = 1; i <= imageCount; i++) {
                try {
                    const response = await fetch(`https://api.thalesmarket.io/banner-json/${i}`);
                    if (response) {
                        const json = await response.json();
                        map[i] = json.url;
                    }
                } catch (e) {}
            }
            setUrlMap(map);
        };
        fetchData();
    }, [imageCount]);

    const getStyledDivs = useCallback(() => {
        const divList = [];
        for (let i = 1; i <= imageCount; i++) {
            divList.push(<StyledDiv key={i} hasHref={!!urlMap[i]} index={i} />);
        }
        return divList;
    }, [imageCount, urlMap]);

    return (
        <Container>
            {!!imageCount && (
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
                        if (urlMap[index + 1]) {
                            window.open(urlMap[index + 1]);
                        }
                    }}
                >
                    {getStyledDivs()}
                </Carousel>
            )}
        </Container>
    );
};

const Container = styled.div`
    position: relative;
    z-index: 0;
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

const StyledDiv = styled.div<{ index: number; hasHref?: boolean }>`
    max-width: 100%;
    width: 1700px;
    height: 165px;
    margin: -1px;
    background-image: ${(props) => `url(https://api.thalesmarket.io/banner-image/${props.index})`};
    cursor: ${(props) => (props.hasHref ? 'pointer' : 'default')};
    background-position: center;
`;

export default BannerCarousel;
