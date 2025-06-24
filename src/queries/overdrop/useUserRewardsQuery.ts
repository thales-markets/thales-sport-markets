import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import merkleProofsOArb from 'assets/json/overdropRewards/merkleProofsArb.json';
import merkleProofsOp from 'assets/json/overdropRewards/merkleProofsOp.json';
import merkleProofsOpSepolia from 'assets/json/overdropRewards/merkleProofsOpSepolia.json';
import { OVERDROP_REWARDS_COLLATERALS } from 'constants/overdrop';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { Network } from 'enums/network';
import { bigNumberFormatter, Coins, COLLATERAL_DECIMALS } from 'thales-utils';
import { NetworkConfig, SupportedNetwork } from 'types/network';
import { UserRewards } from 'types/overdrop';
import { ViemContract } from 'types/viem';
import { getContractInstance } from 'utils/contract';

const MERKLE_PROOFS: Record<SupportedNetwork, any> = {
    [Network.OptimismMainnet]: merkleProofsOp,
    [Network.Arbitrum]: merkleProofsOArb,
    [Network.OptimismSepolia]: merkleProofsOpSepolia,
    [Network.Base]: undefined,
};

const useUserRewardsQuery = (
    walletAddress: string,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<UserRewards | undefined>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<UserRewards | undefined>({
        queryKey: QUERY_KEYS.Overdrop.UserRewards(networkConfig.networkId, walletAddress),
        queryFn: async () => {
            try {
                console.log(`Fetching user rewards for ${walletAddress} on network ${networkConfig.networkId}`);
                const overdropRewardsContract = getContractInstance(
                    ContractType.OVERDROP_REWARDS,
                    networkConfig
                ) as ViemContract;

                if (overdropRewardsContract) {
                    const [hasClaimed] = await Promise.all([
                        overdropRewardsContract.read.hasClaimedCurrentSeason([walletAddress]),
                    ]);

                    let amount = 0;
                    let rawAmount = '';
                    let proof: string[] = [];

                    const networkMerkleProofs = MERKLE_PROOFS[networkConfig.networkId];
                    const merkleProof =
                        networkMerkleProofs &&
                        MERKLE_PROOFS[networkConfig.networkId].find(
                            (proof: any) => proof.address.toLowerCase() === walletAddress.toLowerCase()
                        );

                    if (merkleProof) {
                        amount = bigNumberFormatter(
                            merkleProof.amount as any,
                            COLLATERAL_DECIMALS[OVERDROP_REWARDS_COLLATERALS[networkConfig.networkId] as Coins]
                        );
                        rawAmount = merkleProof.amount.toString();
                        proof = merkleProof.proof;
                    }

                    return {
                        walletAddress,
                        amount,
                        rawAmount,
                        hasRewards: amount > 0,
                        hasClaimed,
                        proof,
                    };
                }
            } catch (e) {
                console.error(e);
            }
            return undefined;
        },
        ...options,
    });
};

export default useUserRewardsQuery;
