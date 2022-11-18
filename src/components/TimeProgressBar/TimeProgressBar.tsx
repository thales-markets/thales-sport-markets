import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

type TimeProgressBarProps = {
    durationInSec: number;
    increasing: boolean;
};

const TimeProgressBar: React.FC<TimeProgressBarProps> = ({ durationInSec, increasing }) => {
    const [percent, setPercent] = useState(increasing ? 0 : 100);

    useEffect(() => {
        const timeoutId = setTimeout(() => setPercent(increasing ? 100 : 0), 1);
        return () => clearTimeout(timeoutId);
    }, [increasing]);

    return (
        <Container>
            <Background />
            <Progress percent={percent} duration={durationInSec} />
        </Container>
    );
};

const Container = styled.div`
    height: 7px;
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
`;

const BaseBox = styled.div<{ duration?: number }>`
    height: 100%;
    position: absolute;
    left: 0;
    top: -15px;
    border-radius: 10px;
    transition: width ${(props) => (props.duration ? props.duration : 1)}s linear;
`;

const Background = styled(BaseBox)`
    background: #5f6180;
    width: 100%;
`;

const Progress = styled(BaseBox)<{ percent: number }>`
    background: linear-gradient(269.97deg, #64d9fe 16.18%, #3f75ff 77.77%);
    width: ${(props) => props.percent}%;
`;

export default React.memo(TimeProgressBar);
