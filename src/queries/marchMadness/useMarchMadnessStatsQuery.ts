import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getClient } from '@wagmi/core';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { wagmiConfig } from 'pages/Root/wagmiConfig';
import { coinFormatter, NetworkId } from 'thales-utils';
import { NetworkConfig } from 'types/network';
import { getContractInstance } from 'utils/contract';
import { isMarchMadnessAvailableForNetworkId } from 'utils/marchMadness';

type MarchMadnessStats = {
    totalBracketsMinted: number;
    poolSize: number;
};

const DEFAULT_MINT_PRICE = 20;

const useMarchMadnessStatsQuery = (
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<MarchMadnessStats>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<MarchMadnessStats>({
        queryKey: QUERY_KEYS.MarchMadness.Stats(networkConfig.networkId),
        queryFn: async () => {
            const marchMadnessData: MarchMadnessStats = {
                totalBracketsMinted: 0,
                poolSize: 0,
            };

            try {
                const marchMadnessContract = getContractInstance(ContractType.MARCH_MADNESS, networkConfig);

                const marchMadnessOpContract = getContractInstance(ContractType.MARCH_MADNESS, {
                    client: getClient(wagmiConfig, { chainId: NetworkId.OptimismMainnet }),
                    networkId: NetworkId.OptimismMainnet,
                });
                const marchMadnessArbContract = getContractInstance(ContractType.MARCH_MADNESS, {
                    client: getClient(wagmiConfig, { chainId: NetworkId.Arbitrum }),
                    networkId: NetworkId.Arbitrum,
                });
                const marchMadnessBaseContract = getContractInstance(ContractType.MARCH_MADNESS, {
                    client: getClient(wagmiConfig, { chainId: NetworkId.Base }),
                    networkId: NetworkId.Base,
                });

                if (isMarchMadnessAvailableForNetworkId(networkConfig.networkId)) {
                    let poolSize = 0;
                    let totalBracketsMinted = 0;

                    let mintingPrice = DEFAULT_MINT_PRICE;
                    if (marchMadnessContract) {
                        const mintingPriceBigInt = await marchMadnessContract.read.mintingPrice();
                        mintingPrice = coinFormatter(mintingPriceBigInt, networkConfig.networkId);
                    }

                    if (networkConfig.networkId !== NetworkId.OptimismSepolia) {
                        if (marchMadnessOpContract && marchMadnessArbContract && marchMadnessBaseContract) {
                            const [
                                totalBracketsMintedOp,
                                totalBracketsMintedArb,
                                totalBracketsMintedBase,
                            ] = await Promise.all([
                                await marchMadnessOpContract.read.getCurrentTokenId(),
                                await marchMadnessArbContract.read.getCurrentTokenId(),
                                await marchMadnessBaseContract.read.getCurrentTokenId(),
                            ]);

                            totalBracketsMinted =
                                Number(totalBracketsMintedOp) +
                                Number(totalBracketsMintedArb) +
                                Number(totalBracketsMintedBase);

                            poolSize = mintingPrice * totalBracketsMinted;
                        }
                    } else {
                        if (marchMadnessContract) {
                            const totalBracketsMintedSep = await marchMadnessContract.read.getCurrentTokenId();
                            totalBracketsMinted = Number(totalBracketsMintedSep);
                            poolSize = mintingPrice * totalBracketsMinted;
                        }
                    }

                    marchMadnessData.poolSize = poolSize;
                    marchMadnessData.totalBracketsMinted = totalBracketsMinted;
                }

                return marchMadnessData;
            } catch (e) {
                console.log(e);
                return marchMadnessData;
            }
        },
        ...options,
    });
};

export default useMarchMadnessStatsQuery;
