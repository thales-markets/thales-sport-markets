import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

const OutsideClickHandler: React.FC<{ children: React.ReactNode; onOutsideClick: (e: MouseEvent) => void }> = ({
    children,
    onOutsideClick,
}) => {
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event: any) => {
            if (wrapperRef.current && !(wrapperRef.current as any).contains(event.target)) {
                onOutsideClick(event);
            }
        };
        document.addEventListener('mouseup', handleOutsideClick);
        document.addEventListener('touchend', handleOutsideClick);

        return () => {
            document.removeEventListener('mouseup', handleOutsideClick);
            document.removeEventListener('touchend', handleOutsideClick);
        };
    }, [onOutsideClick]);

    return <Wrapper ref={wrapperRef}>{children}</Wrapper>;
};

const Wrapper = styled.div`
    display: contents;
`;

export default OutsideClickHandler;
