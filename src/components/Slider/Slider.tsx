import React, { useRef, useState } from 'react';
import styled from 'styled-components';

interface SliderProps {
    min?: number;
    max?: number;
    value?: number;
    onChange?: (value: number) => void;
    disabled?: boolean;
    marks?: { value: number; label: string }[];
}

const Slider: React.FC<SliderProps> = ({ min = 0, max = 100, value = 0, onChange, disabled = false, marks = [] }) => {
    const [sliderValue, setSliderValue] = useState(value);
    const sliderRef = useRef<HTMLDivElement>(null);

    const handleThumbPosition = (event: React.MouseEvent) => {
        if (disabled) return;
        const rect = sliderRef.current?.getBoundingClientRect();
        if (!rect) return;
        const newValue = Math.min(Math.max(min, ((event.clientX - rect.left) / rect.width) * (max - min) + min), max);
        setSliderValue(newValue);
        onChange && onChange(newValue);
    };

    return (
        <SliderContainer ref={sliderRef} onClick={handleThumbPosition}>
            <SliderTrack value={sliderValue} min={min} max={max} />
            <SliderThumb value={sliderValue} min={min} max={max} />
            <SliderMarks>
                {marks.map((mark) => (
                    <SliderMark key={mark.value} value={mark.value} min={min} max={max} />
                ))}
            </SliderMarks>
        </SliderContainer>
    );
};

const SliderContainer = styled.div`
    position: relative;
    width: 100%;
    height: 4px;
    background-color: #e0e0e0;
    border-radius: 2px;
`;

const SliderTrack = styled.div<{ value: number; min: number; max: number }>`
    position: absolute;
    height: 100%;
    background-color: #3f51b5;
    border-radius: 2px;
    width: ${({ value, min, max }) => ((value - min) / (max - min)) * 100}%;
`;

const SliderThumb = styled.div<{ value: number; min: number; max: number }>`
    position: absolute;
    top: 50%;
    left: ${({ value, min, max }) => ((value - min) / (max - min)) * 100}%;
    transform: translate(-50%, -50%);
    width: 12px;
    height: 12px;
    background-color: #3f51b5;
    border-radius: 50%;
    cursor: pointer;
`;

const SliderMarks = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
`;

const SliderMark = styled.div<{ value: number; min: number; max: number }>`
    position: absolute;
    left: ${({ value, min, max }) => ((value - min) / (max - min)) * 100}%;
    transform: translateX(-50%);
    width: 2px;
    height: 8px;
    background-color: #000;
`;

export default Slider;
