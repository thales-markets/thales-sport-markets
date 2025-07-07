import { USD_SIGN } from 'constants/currency';
import { ScreenSizeBreakpoint } from 'enums/ui';
import React from 'react';
import styled, { css } from 'styled-components';
import { formatCurrencyWithSign } from 'thales-utils';

type CurrentPriceProps = {
    asset: string;
    currentPrice: number | undefined;
    isPriceUp?: boolean;
};

const CurrentPrice: React.FC<CurrentPriceProps> = ({ currentPrice, isPriceUp }) => {
    const currentPriceFormatted = formatCurrencyWithSign(USD_SIGN, currentPrice || 0);
    const skipIndexes: number[] = [];

    return (
        <Container>
            <AnimatedPrice key={currentPrice}>
                {currentPriceFormatted.split('').map((letter: string, index) => {
                    if (isNaN(parseInt(letter))) {
                        skipIndexes.push(index + 1);
                        return (
                            <Price $isUp={isPriceUp} key={`priceLetter${index}`}>
                                {letter}
                            </Price>
                        );
                    } else {
                        return (
                            <PriceNumber
                                $priceLength={currentPriceFormatted.length}
                                $skipIndexes={skipIndexes}
                                $isUp={isPriceUp}
                                key={`priceNumber${index}`}
                            >
                                <i>1</i>
                                <i>2</i>
                                <i>3</i>
                                {letter}
                            </PriceNumber>
                        );
                    }
                })}
            </AnimatedPrice>
            <Icon className="icon icon--arrow" $isUp={isPriceUp} />
        </Container>
    );
};

const Container = styled.div`
    position: absolute;
    bottom: 2px;
    z-index: 10;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        gap: 5px;
    }
`;

const AnimatedPrice = styled.div`
    display: block;
    overflow: hidden;
`;

const Icon = styled.i<{ $isUp?: boolean }>`
    font-size: ${(props) => (props.$isUp !== undefined ? '22' : '28')}px;
    ${(props) =>
        props.$isUp !== undefined
            ? `color: ${props.$isUp ? props.theme.speedMarkets.price.up : props.theme.speedMarkets.price.down};`
            : ''}
    ${(props) =>
        props.$isUp !== undefined ? (props.$isUp ? 'transform: rotate(-90deg);' : 'transform: rotate(90deg);') : ''}
    
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: ${(props) => (props.$isUp !== undefined ? '18' : '22')}px;
    }
`;

const Price = styled.span<{ $isUp?: boolean }>`
    font-weight: 700;
    font-size: 18px;
    line-height: 100%;
    color: ${(props) =>
        props.$isUp !== undefined
            ? props.$isUp
                ? props.theme.speedMarkets.price.up
                : props.theme.speedMarkets.price.down
            : props.theme.textColor.primary};

    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 18px;
    }
    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        font-size: 16px;
    }
`;

const getPriceAnimation = (priceLength: number, skipIndexes: number[]) => {
    let styles = '';
    let j = 0;

    for (let i = 1; i <= priceLength; i++) {
        if (skipIndexes.includes(i)) {
            continue;
        } else {
            j++;
        }
        styles += `
                    &:nth-of-type(${i}) {
                        animation-delay: ${j * 0.1}s;
                    }
                `;
    }

    return css`
        ${styles}
    `;
};

const getPriceNumberStyle = () => {
    let styles = '';

    for (let i = 1; i <= 3; i++) {
        styles += `
                    &:nth-child(${i}) {
                        top: ${i * -100}%;
                    }
                `;
    }

    return css`
        ${styles}
    `;
};

const PriceNumber: any = styled(Price)<{ $priceLength: number; $skipIndexes: number[] }>`
    position: relative;
    display: inline-block;
    transform: translate3d(0, 400%, 0);
    animation: countdown 1s forwards;

    ${(props) => getPriceAnimation(props.$priceLength, props.$skipIndexes)};

    i {
        position: absolute;
        ${getPriceNumberStyle()}
    }

    @keyframes countdown {
        from {
            transform: translateY(400%);
        }

        to {
            transform: translateY(0);
        }
    }
`;

export default CurrentPrice;
