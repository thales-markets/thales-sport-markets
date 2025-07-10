import Tooltip from 'components/Tooltip';
import { USD_SIGN } from 'constants/currency';
import { SPEED_MARKETS_WIDGET_Z_INDEX } from 'constants/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css, useTheme } from 'styled-components';
import { formatCurrencyWithSign } from 'thales-utils';
import { ThemeInterface } from 'types/ui';

type CurrentPriceProps = {
    asset: string;
    currentPrice: number | undefined;
    isPriceUp?: boolean;
};

const CurrentPrice: React.FC<CurrentPriceProps> = ({ currentPrice, isPriceUp }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

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
            <Icon className="speedmarkets-icon speedmarkets-icon--arrow" $isUp={isPriceUp} />
            <Tooltip
                overlay={t('speed-markets.tooltips.current-price')}
                customIconStyling={{
                    color: isPriceUp ? theme.speedMarkets.price.up : theme.speedMarkets.price.down,
                }}
                iconFontSize={14}
                zIndex={SPEED_MARKETS_WIDGET_Z_INDEX}
            />
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
    gap: 5px;
`;

const AnimatedPrice = styled.div`
    display: block;
    overflow: hidden;
`;

const Icon = styled.i<{ $isUp?: boolean }>`
    font-size: 14px;
    line-height: 100%;
    ${(props) =>
        props.$isUp !== undefined
            ? `color: ${props.$isUp ? props.theme.speedMarkets.price.up : props.theme.speedMarkets.price.down};`
            : ''}
    ${(props) =>
        props.$isUp !== undefined ? (props.$isUp ? 'transform: rotate(-90deg);' : 'transform: rotate(90deg);') : ''}
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
