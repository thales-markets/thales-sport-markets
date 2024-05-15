import React from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { useTheme } from 'styled-components';
import { ThemeInterface } from '../../types/ui';

type ScrollProps = {
    height: string;
};

const Scroll: React.FC<ScrollProps> = ({ children, height }) => {
    const theme: ThemeInterface = useTheme();

    const renderThumb = ({ style, ...props }: any) => {
        const thumbStyle = {
            backgroundColor: theme.background.senary,
            borderRadius: '4px',
        };
        return <div style={{ ...style, ...thumbStyle }} {...props} />;
    };

    const renderTrack = ({ style, ...props }: any) => {
        const trackStyle = {
            backgroundColor: theme.background.secondary,
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
