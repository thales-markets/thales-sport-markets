import { useQuery, UseQueryOptions } from 'react-query';
import { Position } from '../../constants/options';
import { AvailablePerPosition } from '../../types/markets';
import QUERY_KEYS from '../../constants/queryKeys';
import networkConnector from '../../utils/networkConnector';
import { bigNumberFormatter } from '../../utils/formatters/ethers';
import { ethers } from 'ethers';

const useAvailablePerPositionQuery = (
    marketAddress: string,
    options?: UseQueryOptions<AvailablePerPosition | undefined>
) => {
    return useQuery<AvailablePerPosition | undefined>(
        QUERY_KEYS.AvailablePerPosition(marketAddress),
        async () => {
            try {
                const sportsAMMContract = networkConnector.sportsAMMContract;

                const [
                    availableToBuyHome,
                    availableToBuyAway,
                    availableToBuyDraw,
                    homePositionPriceImpact,
                    awayPositionPriceImpact,
                    drawPositionPriceImpact,
                ] = await Promise.all([
                    sportsAMMContract?.availableToBuyFromAMM(marketAddress, Position.HOME),
                    sportsAMMContract?.availableToBuyFromAMM(marketAddress, Position.AWAY),
                    sportsAMMContract?.availableToBuyFromAMM(marketAddress, Position.DRAW),
                    sportsAMMContract?.buyPriceImpact(marketAddress, Position.HOME, ethers.utils.parseEther('1')),
                    sportsAMMContract?.buyPriceImpact(marketAddress, Position.AWAY, ethers.utils.parseEther('1')),
                    sportsAMMContract?.buyPriceImpact(marketAddress, Position.DRAW, ethers.utils.parseEther('1')),
                ]);

                return {
                    [Position.HOME]: {
                        available: bigNumberFormatter(availableToBuyHome),
                        buyBonus: -(
                            (bigNumberFormatter(homePositionPriceImpact) /
                                (1 + bigNumberFormatter(homePositionPriceImpact))) *
                            100
                        ),
                    },
                    [Position.AWAY]: {
                        available: bigNumberFormatter(availableToBuyAway),
                        buyBonus: -(
                            (bigNumberFormatter(awayPositionPriceImpact) /
                                (1 + bigNumberFormatter(awayPositionPriceImpact))) *
                            100
                        ),
                    },
                    [Position.DRAW]: {
                        available: bigNumberFormatter(availableToBuyDraw),
                        buyBonus: -(
                            (bigNumberFormatter(drawPositionPriceImpact) /
                                (1 + bigNumberFormatter(drawPositionPriceImpact))) *
                            100
                        ),
                    },
                };
            } catch (e) {
                console.log(e);
                return undefined;
            }
        },
        {
            ...options,
        }
    );
};

export default useAvailablePerPositionQuery;
