import React, { LegacyRef } from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { useTheme } from 'styled-components';
import { ThemeInterface } from '../../types/ui';

type ScrollProps = {
    innerRef?: LegacyRef<Scrollbars>;
    height: string;
    children: React.ReactNode;
    renderOnlyChildren?: boolean;
    onScroll?: () => void;
    onScrollStart?: () => void;
    onScrollStop?: () => void;
};

const Scroll: React.FC<ScrollProps> = ({
    children,
    renderOnlyChildren,
    height,
    onScrollStart,
    onScrollStop,
    onScroll,
    innerRef,
}) => {
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

    return renderOnlyChildren ? (
        <>{children}</>
    ) : (
        <Scrollbars
            ref={innerRef}
            hideTracksWhenNotNeeded
            style={{ height }}
            renderTrackHorizontal={renderTrack}
            renderThumbHorizontal={renderThumb}
            renderTrackVertical={renderTrack}
            renderThumbVertical={renderThumb}
            onScroll={onScroll}
            onScrollStart={onScrollStart}
            onScrollStop={onScrollStop}
        >
            {children}
        </Scrollbars>
    );
};

export default Scroll;
