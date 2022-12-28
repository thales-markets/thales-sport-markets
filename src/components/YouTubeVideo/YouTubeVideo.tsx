import React from 'react';
import styled from 'styled-components';

type YouTubeVideoProps = {
    source: string;
    title: string;
};

const YouTubeVideo: React.FC<YouTubeVideoProps> = ({ source, title }) => {
    return (
        <IFrame
            src={source}
            title={title}
            allow={'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'}
            allowFullScreen
        />
    );
};

const IFrame = styled.iframe`
    width: 100%;
    aspect-ratio: 16 / 9;
`;

export default YouTubeVideo;
