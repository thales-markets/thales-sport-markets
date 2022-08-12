/**
 * @param {number} maxsUSDToSpend - price in sUSD for total liquidity of selected position
 * @param {number} liquidity - number of tokens available for position
 * @param {number} basePrice - price of 1 token for selected position without skew impact
 * @return - net price impact on total liquidity level (difference between price with max avg skew and base price)
 */
export const netPriceImpactAtMaxBuyVolume = (maxsUSDToSpend: number, liquidity: number, basePrice: number) =>
    maxsUSDToSpend / liquidity - basePrice;

/**
 * @param {number} usdToSpend - amount of sUSD user wants to spend on buying selected position
 * @param {number} maxsUSDToSpend - price in sUSD for total liquidity of selected position
 * @param {number} netPriceImpactAtMaxBuyVolume - net price impact on total liquidity level
 * @return - net price impact for amount user wants to spend on selected position
 */
export const netPriceImpactForXsUSD = (
    usdToSpend: number,
    maxsUSDToSpend: number,
    netPriceImpactAtMaxBuyVolume: number
) => (usdToSpend / maxsUSDToSpend) * netPriceImpactAtMaxBuyVolume;

/**
 * @param {number} usdToSpend - amount of sUSD user wants to spend on buying selected position
 * @param {number} basePrice - price of 1 token for selected position without skew impact
 * @param {number} netPriceImpactForXsUSD - net price impact for amount user wants to spend on selected position
 * @return - amount of positional tokens to be received for amount of sUSD user wants to spend, per price with calculated price impact
 */
export const amountOfOptionsForXsUSD = (usdToSpend: number, basePrice: number, netPriceImpactForXsUSD: number) =>
    usdToSpend / (basePrice + netPriceImpactForXsUSD);

/**
 * @param {number} usdToSpend - amount of sUSD user wants to spend on buying selected position
 * @param {number} basePrice - price of 1 token for selected position without skew impact
 * @param {number} maxsUSDToSpend - price in sUSD for total liquidity of selected position
 * @param {number} liquidity - number of tokens available for position
 * @return - amount of positional tokens to be received for amount of sUSD user wants to spend, when AMM balance of token is 0
 */
export const calculateAmountOfTokensForXsUSD = (
    usdToSpend: number,
    basePrice: number,
    maxsUSDToSpend: number,
    liquidity: number
) => {
    const priceImpactForMaxVolume = netPriceImpactAtMaxBuyVolume(maxsUSDToSpend, liquidity, basePrice);
    const priceImpactForAmountToSpend = netPriceImpactForXsUSD(usdToSpend, maxsUSDToSpend, priceImpactForMaxVolume);
    return amountOfOptionsForXsUSD(usdToSpend, basePrice, priceImpactForAmountToSpend);
};

/**
 * @param {number} usdToSpend - amount of sUSD user wants to spend on buying selected position
 * @param {number} basePrice - price of 1 token for selected position without skew impact
 * @param {number} maxsUSDToSpend - price in sUSD for total liquidity of selected position
 * @param {number} liquidity - number of tokens available for position
 * @param {number} ammBalanceOfToken - number of tokens available for position not impacted by skew
 * @return - amount of positional tokens to be received for amount of sUSD user wants to spend, when AMM balance of token is greater than 0
 */
export const calculateAmountOfTokensForXsUSDOnOppositeSide = (
    usdToSpend: number,
    basePrice: number,
    maxsUSDToSpend: number,
    liquidity: number,
    ammBalanceOfToken: number
) => {
    const priceOfNoSkewTokens = basePrice * ammBalanceOfToken;
    const sUSDToSpendOnOptionsWithSkew = usdToSpend - priceOfNoSkewTokens;

    if (sUSDToSpendOnOptionsWithSkew <= 0) return usdToSpend / basePrice;

    const amountOfTokensWithSkew = liquidity - ammBalanceOfToken;
    const priceOfTokensWithSkew = maxsUSDToSpend - priceOfNoSkewTokens;

    const priceImpactForTokensWithSkew = netPriceImpactAtMaxBuyVolume(
        priceOfTokensWithSkew,
        amountOfTokensWithSkew,
        basePrice
    );

    const priceImpactForsUSDToSpendOnTokensWithSkew = netPriceImpactForXsUSD(
        sUSDToSpendOnOptionsWithSkew,
        priceOfTokensWithSkew,
        priceImpactForTokensWithSkew
    );

    const amountOfOptionsForsUSDToSpendOnTokensWithSkew = amountOfOptionsForXsUSD(
        sUSDToSpendOnOptionsWithSkew,
        basePrice,
        priceImpactForsUSDToSpendOnTokensWithSkew
    );

    return ammBalanceOfToken + amountOfOptionsForsUSDToSpendOnTokensWithSkew;
};

/**
 *
 * @param {number} usdToSpend - amount of sUSD user wants to spend on buying selected position
 * @param {number} basePrice - price of 1 token for selected position without skew impact
 * @param {number} maxsUSDToSpend - price in sUSD for total liquidity of selected position
 * @param {number} liquidity - number of tokens available for position
 * @param {number} ammBalanceOfToken - number of tokens available for position not impacted by skew
 * @return - amount of positional tokens to be received for amount of sUSD user wants to spend
 */
export const fetchAmountOfTokensForXsUSDAmount = (
    usdToSpend: number,
    basePrice: number,
    maxsUSDToSpend: number,
    liquidity: number,
    ammBalanceOfToken: number
) => {
    if (ammBalanceOfToken > 0) {
        return calculateAmountOfTokensForXsUSDOnOppositeSide(
            usdToSpend,
            basePrice,
            maxsUSDToSpend,
            liquidity,
            ammBalanceOfToken
        );
    }

    return calculateAmountOfTokensForXsUSD(usdToSpend, basePrice, maxsUSDToSpend, liquidity);
};
