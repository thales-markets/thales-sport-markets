import React, { useEffect, useRef, useState } from 'react';
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

    useEffect(() => {
        setSliderValue(value < min ? min : value > max ? max : value);
    }, [value, min, max]);

    const sliderRef = useRef<HTMLDivElement>(null);

    const handleThumbPosition = (event: React.MouseEvent | React.DragEvent) => {
        if (disabled || !event.clientX) return;

        const rect = sliderRef.current?.getBoundingClientRect();
        if (!rect) return;

        const newValue = Math.ceil(
            Math.min(Math.max(min, ((event.clientX - rect.left) / rect.width) * (max - min) + min), max)
        );
        setSliderValue(newValue);
        onChange && onChange(newValue);
    };

    return (
        <SliderContainer
            isDisabled={!!disabled}
            ref={sliderRef}
            onClick={handleThumbPosition}
            onDrag={handleThumbPosition}
            onDragEnter={(e) => e.preventDefault()}
            onDragOver={(e) => e.preventDefault()}
        >
            <SliderTrackDefault />
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

const SliderContainer = styled.div<{ isDisabled: boolean }>`
    position: relative;
    width: 100%;
    height: 10px;
    border-radius: 10px;
    cursor: ${(props) => (props.isDisabled ? 'deafult' : 'pointer')};
    opacity: ${(props) => (props.isDisabled ? '0.5' : '1')};
`;

const SliderTrack = styled.div<{ value: number; min: number; max: number }>`
    position: absolute;
    height: 100%;
    background-color: ${(props) => props.theme.slider.trackColor};
    border-radius: 10px;
    width: ${({ value, min, max }) => ((value - min) / (max - min)) * 100}%;
`;

const SliderTrackDefault = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 10px;
    background-color: ${(props) => props.theme.slider.trackColor};
    opacity: 0.38;
    z-index: 1;
`;

const SliderThumb = styled.div<{ value: number; min: number; max: number }>`
    position: absolute;
    top: 50%;
    left: ${({ value, min, max }) => ((value - min) / (max - min)) * 100}%;
    transform: translate(-50%, -50%);
    width: 14px;
    height: 14px;
    background-color: ${(props) => props.theme.slider.thumbColor};
    border-radius: 50%;
    cursor: pointer;
    z-index: 2;
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
