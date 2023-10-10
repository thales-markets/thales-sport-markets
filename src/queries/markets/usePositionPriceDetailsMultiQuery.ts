import { useQuery, UseQueryOptions } from 'react-query';
import { AMMPosition, MultiSingleTokenQuoteAndBonus, ParlaysMarket } from 'types/markets';
import QUERY_KEYS from 'constants/queryKeys';
import networkConnector from 'utils/networkConnector';
import { bigNumberFormatter, coinFormatter } from 'utils/formatters/ethers';
import { Network } from 'enums/network';
import { ethers } from 'ethers';
import { ZERO_ADDRESS } from 'constants/network';
import { Coins } from 'types/tokens';

const usePositionPriceDetailsMultiQuery = (
    parlaysMarkets: ParlaysMarket[],
    multiSingleTokenQuotes: MultiSingleTokenQuoteAndBonus[],
    selectedCollateral: string,
    collateralAddress: string,
    isDefaultCollateral: boolean,
    networkId: Network,
    options?: UseQueryOptions<Record<string, AMMPosition> | undefined>
) => {
    return useQuery<Record<string, AMMPosition> | undefined>(
        QUERY_KEYS.PositionDetailsMulti(
            parlaysMarkets.map((market) => market.address).join('-'),
            parlaysMarkets.map((market) => market.position).join('-'),
            multiSingleTokenQuotes.map((market) => market.tokenAmount).join('-')
        ),
        async () => {
            const map = {} as Record<string, AMMPosition>;
            const promises: any[] = [];
            const sportPositionalMarketDataContract = networkConnector.sportPositionalMarketDataContract;

            try {
                for (let i = 0; i < parlaysMarkets.length; i++) {
                    const tokenQuote = multiSingleTokenQuotes.find(
                        (tokenQuote) => tokenQuote.sportMarketAddress === parlaysMarkets[i].address
                    );
                    const tokenAmount = tokenQuote ? tokenQuote.tokenAmount : 0;
                    const parsedAmount = ethers.utils.parseEther(tokenAmount.toString());
                    promises.push(
                        tokenAmount > 0
                            ? sportPositionalMarketDataContract?.getPositionDetails(
                                  parlaysMarkets[i].address,
                                  parlaysMarkets[i].position,
                                  parsedAmount,
                                  isDefaultCollateral ? ZERO_ADDRESS : collateralAddress
                              )
                            : {
                                  available: 0,
                                  quote: 0,
                                  priceImpact: 0,
                                  usdQuote: 0,
                              }
                    );
                }

                const responses = await Promise.all(promises);

                for (let i = 0; i < parlaysMarkets.length; i++) {
                    const positionDetails = responses[i];

                    map[parlaysMarkets[i].address] = {
                        available: positionDetails.liquidity > 0 ? bigNumberFormatter(positionDetails.liquidity) : 0,
                        quote:
                            positionDetails.quote > 0
                                ? coinFormatter(
                                      isDefaultCollateral
                                          ? positionDetails.quote
                                          : positionDetails.quoteDifferentCollateral,
                                      networkId,
                                      selectedCollateral as Coins
                                  )
                                : 0,
                        priceImpact:
                            positionDetails.priceImpact > 0 ? bigNumberFormatter(positionDetails.priceImpact) : 0,
                        usdQuote: positionDetails.quote > 0 ? coinFormatter(positionDetails.quote, networkId) : 0,
                    };
                }
            } catch (e) {
                console.log(e);
                return undefined;
            }

            return map;
        },
        {
            ...options,
        }
    );
};

export default usePositionPriceDetailsMultiQuery;
