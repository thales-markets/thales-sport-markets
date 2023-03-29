import { useQuery, UseQueryOptions } from 'react-query';
import { Position } from '../../constants/options';
import { AvailablePerPosition, ParlaysMarket } from '../../types/markets';
import QUERY_KEYS from '../../constants/queryKeys';
import networkConnector from '../../utils/networkConnector';
import { bigNumberFormatter } from '../../utils/formatters/ethers';
import { ethers } from 'ethers';
import { convertPriceImpactToBonus } from 'utils/markets';

const useAvailablePerPositionMultiQuery = (
    marketAddresses: ParlaysMarket[],
    options?: UseQueryOptions<Record<string, AvailablePerPosition> | undefined>
) => {
    return useQuery<Record<string, AvailablePerPosition> | undefined>(
        QUERY_KEYS.AvailablePerPositionMulti(marketAddresses),
        async () => {
            const map = {} as Record<string, AvailablePerPosition>;

            for (let i = 0; i < marketAddresses.length; i++) {
                const address = marketAddresses[i].address;

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
                        sportsAMMContract?.availableToBuyFromAMM(address, Position.HOME),
                        sportsAMMContract?.availableToBuyFromAMM(address, Position.AWAY),
                        sportsAMMContract?.availableToBuyFromAMM(address, Position.DRAW),
                        sportsAMMContract?.buyPriceImpact(address, Position.HOME, ethers.utils.parseEther('1')),
                        sportsAMMContract?.buyPriceImpact(address, Position.AWAY, ethers.utils.parseEther('1')),
                        sportsAMMContract?.buyPriceImpact(address, Position.DRAW, ethers.utils.parseEther('1')),
                    ]);

                    map[address] = {
                        [Position.HOME]: {
                            available: bigNumberFormatter(availableToBuyHome),
                            buyBonus: convertPriceImpactToBonus(bigNumberFormatter(homePositionPriceImpact)),
                        },
                        [Position.AWAY]: {
                            available: bigNumberFormatter(availableToBuyAway),
                            buyBonus: convertPriceImpactToBonus(bigNumberFormatter(awayPositionPriceImpact)),
                        },
                        [Position.DRAW]: {
                            available: bigNumberFormatter(availableToBuyDraw),
                            buyBonus: convertPriceImpactToBonus(bigNumberFormatter(drawPositionPriceImpact)),
                        },
                    };
                } catch (e) {
                    console.log(e);
                    return undefined;
                }
            }

            return map;
        },
        {
            ...options,
        }
    );
};

export default useAvailablePerPositionMultiQuery;
