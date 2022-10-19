import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';

const BannerCarousel: React.FC = () => {
    const [urlMap, setUrlMap] = useState<Record<number, string>>({});
    useEffect(() => {
        const map = {} as Record<number, string>;
        const fetchData = async () => {
            for (let i = 1; i <= 3; i++) {
                try {
                    const response = await fetch(
                        `https://raw.githubusercontent.com/thales-markets/thales-sport-markets/dev/src/assets/images/banner/${i}/json.json`
                    );
                    if (response) {
                        const json = await response.json();
                        map[i] = json.url;
                    }
                } catch (e) {}
            }
            setUrlMap(map);
        };
        fetchData();
    }, []);

    return (
        <Container>
            <Carousel
                transitionTime={1000}
                interval={5000}
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
                <StyledDiv hasHref={!!urlMap[1]} index={1} />
                <StyledDiv hasHref={!!urlMap[2]} index={2} />
                <StyledDiv hasHref={!!urlMap[3]} index={3} />
            </Carousel>
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

const StyledDiv = styled.div<{ index: number; hasHref?: boolean }>`
    max-width: 100%;
    width: 1700px;
    height: 165px;
    margin: -1px;
    background-image: ${(props) =>
        `url(https://raw.githubusercontent.com/thales-markets/thales-sport-markets/dev/src/assets/images/banner/${props.index}/image.jpg)`};
    cursor: ${(props) => (props.hasHref ? 'pointer' : 'default')};
    background-position: center;
`;

export default BannerCarousel;
