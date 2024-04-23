import React from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';

type ScrollProps = {
    height: string;
};

const Scroll: React.FC<ScrollProps> = ({ children, height }) => {
    const renderThumb = ({ style, ...props }: any) => {
        const thumbStyle = {
            backgroundColor: `#3C498A`,
            borderRadius: '4px',
        };
        return <div style={{ ...style, ...thumbStyle }} {...props} />;
    };

    const renderTrack = ({ style, ...props }: any) => {
        const trackStyle = {
            backgroundColor: `#1F274D`,
            width: '5px',
            right: '2px',
            bottom: '2px',
            top: '2px',
            borderRadius: '4px',
        };
        return <div style={{ ...style, ...trackStyle }} {...props} />;
    };

    return (
        <Scrollbars
            hideTracksWhenNotNeeded
            style={{ height }}
            renderTrackHorizontal={renderTrack}
            renderThumbHorizontal={renderThumb}
            renderTrackVertical={renderTrack}
            renderThumbVertical={renderThumb}
        >
            {children}
        </Scrollbars>
    );
};

export default Scroll;
