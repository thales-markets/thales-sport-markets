import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import { bigNumberFormatter } from 'utils/formatters/ethers';
import networkConnector from 'utils/networkConnector';
import { NetworkId } from 'types/network';
import { VaultOverview } from 'types/vault';
import vaultContract from 'utils/contracts/sportVaultContract';
import { ethers } from 'ethers';
import { VAULT_MAP } from 'constants/vault';
import parlayVaultContract from 'utils/contracts/parlayVaultContract';

const useVaultOverviewQuery = (
    vaultAddress: string,
    networkId: NetworkId,
    options?: UseQueryOptions<VaultOverview | undefined>
) => {
    return useQuery<VaultOverview | undefined>(
        QUERY_KEYS.Vault.Data(vaultAddress, networkId),
        async () => {
            const vaultData: VaultOverview = {
                roundEndTime: 0,
                isRoundEnded: false,
                lifetimePnl: 0,
                utilizationRate: 0,
                priceLowerLimit: 0,
                skewImpactLimit: 0,
                allocationLimitsPerMarketPerRound: 0,
            };

            try {
                const sportVaultContract = new ethers.Contract(
                    vaultAddress,
                    vaultAddress !== VAULT_MAP['parlay-discount-vault'].addresses[networkId]
                        ? vaultContract.abi
                        : parlayVaultContract.abi,
                    networkConnector.provider
                );
                if (sportVaultContract) {
                    const [
                        round,
                        roundEndTime,
                        utilizationRate,
                        priceLowerLimit,
                        skewImpactLimit,
                        allocationLimitsPerMarketPerRound,
                    ] = await Promise.all([
                        sportVaultContract?.round(),
                        sportVaultContract?.getCurrentRoundEnd(),

                        sportVaultContract?.utilizationRate(),
                        sportVaultContract?.priceLowerLimit(),

                        sportVaultContract?.skewImpactLimit(),
                        vaultAddress !== VAULT_MAP['parlay-discount-vault'].addresses[networkId]
                            ? sportVaultContract?.allocationLimitsPerMarketPerRound()
                            : sportVaultContract?.maxTradeRate(),
                    ]);

                    vaultData.roundEndTime = Number(roundEndTime) * 1000;

                    vaultData.isRoundEnded = new Date().getTime() > vaultData.roundEndTime;

                    vaultData.utilizationRate = bigNumberFormatter(utilizationRate);
                    vaultData.priceLowerLimit = bigNumberFormatter(priceLowerLimit);

                    vaultData.skewImpactLimit = bigNumberFormatter(skewImpactLimit);
                    vaultData.allocationLimitsPerMarketPerRound =
                        vaultAddress === VAULT_MAP['parlay-discount-vault'].addresses[networkId]
                            ? bigNumberFormatter(allocationLimitsPerMarketPerRound)
                            : bigNumberFormatter(allocationLimitsPerMarketPerRound) / 100;

                    const pnl = await sportVaultContract?.cumulativeProfitAndLoss(round > 0 ? round - 1 : 0);
                    vaultData.lifetimePnl = bigNumberFormatter(pnl) === 0 ? 0 : bigNumberFormatter(pnl) - 1;

                    return vaultData;
                }
            } catch (e) {
                console.log(e);
            }
            return undefined;
        },
        {
            refetchInterval: 60 * 1000,
            ...options,
        }
    );
};

export default useVaultOverviewQuery;
