import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { TBD_ADDRESS } from 'constants/network';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { bigNumberFormatter, Coins, COLLATERAL_DECIMALS } from 'thales-utils';
import { NetworkConfig, SupportedNetwork } from 'types/network';
import { getContractInstance } from 'utils/contract';
import multipleCollateral from 'utils/contracts/multipleCollateralContract';

const useFreeBetCollateralBalanceQuery = (
    walletAddress: string,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<any>({
        queryKey: QUERY_KEYS.Wallet.FreeBetBalance(walletAddress, networkConfig.networkId),
        queryFn: async () => {
            try {
                const freeBetHolderContract = getContractInstance(ContractType.FREE_BET_HOLDER, networkConfig);

                if (!walletAddress || !networkConfig.networkId || !freeBetHolderContract || !multipleCollateral) {
                    return {
                        DAI: 0,
                        USDCe: 0,
                        USDT: 0,
                        OP: 0,
                        WETH: 0,
                        ETH: 0,
                        ARB: 0,
                        USDC: 0,
                        USDbC: 0,
                        OVER: 0,
                    };
                }

                const [
                    DAIBalance,
                    USDCBalance,
                    USDCeBalance,
                    USDTBalance,
                    OPBalance,
                    WETHBalance,
                    ARBBalance,
                    USDbCBalance,
                    OVERBalance,
                ] = await Promise.all([
                    multipleCollateral[CRYPTO_CURRENCY_MAP.DAI as Coins]?.addresses[
                        networkConfig.networkId as SupportedNetwork
                    ] !== TBD_ADDRESS
                        ? freeBetHolderContract?.read.balancePerUserAndCollateral([
                              walletAddress,
                              multipleCollateral[CRYPTO_CURRENCY_MAP.DAI as Coins]?.addresses[
                                  networkConfig.networkId as SupportedNetwork
                              ],
                          ])
                        : undefined,
                    multipleCollateral[CRYPTO_CURRENCY_MAP.USDC as Coins]?.addresses[
                        networkConfig.networkId as SupportedNetwork
                    ] !== TBD_ADDRESS
                        ? freeBetHolderContract?.read.balancePerUserAndCollateral([
                              walletAddress,
                              multipleCollateral[CRYPTO_CURRENCY_MAP.USDC as Coins]?.addresses[
                                  networkConfig.networkId as SupportedNetwork
                              ],
                          ])
                        : undefined,
                    multipleCollateral[CRYPTO_CURRENCY_MAP.USDCe as Coins]?.addresses[
                        networkConfig.networkId as SupportedNetwork
                    ] !== TBD_ADDRESS
                        ? freeBetHolderContract?.read.balancePerUserAndCollateral([
                              walletAddress,
                              multipleCollateral[CRYPTO_CURRENCY_MAP.USDCe as Coins]?.addresses[
                                  networkConfig.networkId as SupportedNetwork
                              ],
                          ])
                        : undefined,
                    multipleCollateral[CRYPTO_CURRENCY_MAP.USDT as Coins]?.addresses[
                        networkConfig.networkId as SupportedNetwork
                    ] !== TBD_ADDRESS
                        ? freeBetHolderContract?.read.balancePerUserAndCollateral([
                              walletAddress,
                              multipleCollateral[CRYPTO_CURRENCY_MAP.USDT as Coins]?.addresses[
                                  networkConfig.networkId as SupportedNetwork
                              ],
                          ])
                        : undefined,
                    multipleCollateral[CRYPTO_CURRENCY_MAP.OP as Coins]?.addresses[
                        networkConfig.networkId as SupportedNetwork
                    ] !== TBD_ADDRESS
                        ? freeBetHolderContract?.read.balancePerUserAndCollateral([
                              walletAddress,
                              multipleCollateral[CRYPTO_CURRENCY_MAP.OP as Coins]?.addresses[
                                  networkConfig.networkId as SupportedNetwork
                              ],
                          ])
                        : undefined,
                    multipleCollateral[CRYPTO_CURRENCY_MAP.WETH as Coins]?.addresses[
                        networkConfig.networkId as SupportedNetwork
                    ] !== TBD_ADDRESS
                        ? freeBetHolderContract?.read.balancePerUserAndCollateral([
                              walletAddress,
                              multipleCollateral[CRYPTO_CURRENCY_MAP.WETH as Coins]?.addresses[
                                  networkConfig.networkId as SupportedNetwork
                              ],
                          ])
                        : undefined,
                    multipleCollateral[CRYPTO_CURRENCY_MAP.ARB as Coins]?.addresses[
                        networkConfig.networkId as SupportedNetwork
                    ] !== TBD_ADDRESS
                        ? freeBetHolderContract?.read.balancePerUserAndCollateral([
                              walletAddress,
                              multipleCollateral[CRYPTO_CURRENCY_MAP.ARB as Coins]?.addresses[
                                  networkConfig.networkId as SupportedNetwork
                              ],
                          ])
                        : undefined,
                    multipleCollateral[CRYPTO_CURRENCY_MAP.USDbC as Coins]?.addresses[
                        networkConfig.networkId as SupportedNetwork
                    ] !== TBD_ADDRESS
                        ? freeBetHolderContract?.read.balancePerUserAndCollateral([
                              walletAddress,
                              multipleCollateral[CRYPTO_CURRENCY_MAP.USDbC as Coins]?.addresses[
                                  networkConfig.networkId as SupportedNetwork
                              ],
                          ])
                        : undefined,
                    multipleCollateral[CRYPTO_CURRENCY_MAP.OVER as Coins]?.addresses[
                        networkConfig.networkId as SupportedNetwork
                    ] !== TBD_ADDRESS
                        ? freeBetHolderContract?.read.balancePerUserAndCollateral([
                              walletAddress,
                              multipleCollateral[CRYPTO_CURRENCY_MAP.OVER as Coins]?.addresses[
                                  networkConfig.networkId as SupportedNetwork
                              ],
                          ])
                        : undefined,
                ]);

                return {
                    DAI: DAIBalance ? bigNumberFormatter(DAIBalance, COLLATERAL_DECIMALS.DAI) : 0,
                    USDC: USDCBalance ? bigNumberFormatter(USDCBalance, COLLATERAL_DECIMALS.USDC) : 0,
                    USDCe: USDCeBalance ? bigNumberFormatter(USDCeBalance, COLLATERAL_DECIMALS.USDCe) : 0,
                    USDT: USDTBalance ? bigNumberFormatter(USDTBalance, COLLATERAL_DECIMALS.USDT) : 0,
                    OP: OPBalance ? bigNumberFormatter(OPBalance, COLLATERAL_DECIMALS.OP) : 0,
                    WETH: WETHBalance ? bigNumberFormatter(WETHBalance, COLLATERAL_DECIMALS.WETH) : 0,
                    ETH: 0,
                    ARB: ARBBalance ? bigNumberFormatter(ARBBalance, COLLATERAL_DECIMALS.ARB) : 0,
                    USDbC: USDbCBalance ? bigNumberFormatter(USDbCBalance, COLLATERAL_DECIMALS.USDbC) : 0,
                    OVER: OVERBalance ? bigNumberFormatter(OVERBalance, COLLATERAL_DECIMALS.OVER) : 0,
                };
            } catch (e) {
                console.log('e ', e);
                return {
                    DAI: 0,
                    USDCe: 0,
                    USDT: 0,
                    OP: 0,
                    WETH: 0,
                    ETH: 0,
                    ARB: 0,
                    USDC: 0,
                    USDbC: 0,
                    OVER: 0,
                };
            }
        },
        ...options,
    });
};

export default useFreeBetCollateralBalanceQuery;
