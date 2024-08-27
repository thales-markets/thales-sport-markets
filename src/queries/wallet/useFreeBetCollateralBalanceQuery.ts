import { COLLATERAL_DECIMALS, CRYPTO_CURRENCY_MAP } from 'constants/currency';
import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { UseQueryOptions, useQuery } from 'react-query';
import { bigNumberFormatter } from 'thales-utils';
import { SupportedNetwork } from 'types/network';
import { Coins } from 'types/tokens';
import multipleCollateral from 'utils/contracts/multipleCollateralContract';
import networkConnector from 'utils/networkConnector';

const useFreeBetCollateralBalanceQuery = (
    walletAddress: string,
    networkId: Network,
    options?: UseQueryOptions<any>
) => {
    return useQuery<any>(
        QUERY_KEYS.Wallet.FreeBetBalance(walletAddress, networkId),
        async () => {
            try {
                const { freeBetHolderContract } = networkConnector;

                if (!walletAddress || !networkId || !freeBetHolderContract || !multipleCollateral) {
                    return {
                        sUSD: 0,
                        DAI: 0,
                        USDCe: 0,
                        USDT: 0,
                        OP: 0,
                        WETH: 0,
                        ETH: 0,
                        ARB: 0,
                        USDC: 0,
                        USDbC: 0,
                        THALES: 0,
                    };
                }

                const [
                    sUSDBalance,
                    DAIBalance,
                    USDCBalance,
                    USDCeBalance,
                    USDTBalance,
                    OPBalance,
                    WETHBalance,
                    ARBBalance,
                    USDbCBalance,
                    THALESBalance,
                ] = await Promise.all([
                    multipleCollateral[CRYPTO_CURRENCY_MAP.sUSD as Coins]?.addresses[networkId as SupportedNetwork]
                        ? freeBetHolderContract?.balancePerUserAndCollateral(
                              walletAddress,
                              multipleCollateral[CRYPTO_CURRENCY_MAP.sUSD as Coins]?.addresses[
                                  networkId as SupportedNetwork
                              ]
                          )
                        : undefined,
                    multipleCollateral[CRYPTO_CURRENCY_MAP.DAI as Coins]?.addresses[networkId as SupportedNetwork]
                        ? freeBetHolderContract?.balancePerUserAndCollateral(
                              walletAddress,
                              multipleCollateral[CRYPTO_CURRENCY_MAP.DAI as Coins]?.addresses[
                                  networkId as SupportedNetwork
                              ]
                          )
                        : undefined,
                    multipleCollateral[CRYPTO_CURRENCY_MAP.USDC as Coins]?.addresses[networkId as SupportedNetwork]
                        ? freeBetHolderContract?.balancePerUserAndCollateral(
                              walletAddress,
                              multipleCollateral[CRYPTO_CURRENCY_MAP.USDC as Coins]?.addresses[
                                  networkId as SupportedNetwork
                              ]
                          )
                        : undefined,
                    multipleCollateral[CRYPTO_CURRENCY_MAP.USDCe as Coins]?.addresses[networkId as SupportedNetwork]
                        ? freeBetHolderContract?.balancePerUserAndCollateral(
                              walletAddress,
                              multipleCollateral[CRYPTO_CURRENCY_MAP.USDCe as Coins]?.addresses[
                                  networkId as SupportedNetwork
                              ]
                          )
                        : undefined,
                    multipleCollateral[CRYPTO_CURRENCY_MAP.USDT as Coins]?.addresses[networkId as SupportedNetwork]
                        ? freeBetHolderContract?.balancePerUserAndCollateral(
                              walletAddress,
                              multipleCollateral[CRYPTO_CURRENCY_MAP.USDT as Coins]?.addresses[
                                  networkId as SupportedNetwork
                              ]
                          )
                        : undefined,
                    multipleCollateral[CRYPTO_CURRENCY_MAP.OP as Coins]?.addresses[networkId as SupportedNetwork]
                        ? freeBetHolderContract?.balancePerUserAndCollateral(
                              walletAddress,
                              multipleCollateral[CRYPTO_CURRENCY_MAP.OP as Coins]?.addresses[
                                  networkId as SupportedNetwork
                              ]
                          )
                        : undefined,
                    multipleCollateral[CRYPTO_CURRENCY_MAP.WETH as Coins]?.addresses[networkId as SupportedNetwork]
                        ? freeBetHolderContract?.balancePerUserAndCollateral(
                              walletAddress,
                              multipleCollateral[CRYPTO_CURRENCY_MAP.WETH as Coins]?.addresses[
                                  networkId as SupportedNetwork
                              ]
                          )
                        : undefined,
                    multipleCollateral[CRYPTO_CURRENCY_MAP.ARB as Coins]?.addresses[networkId as SupportedNetwork]
                        ? freeBetHolderContract?.balancePerUserAndCollateral(
                              walletAddress,
                              multipleCollateral[CRYPTO_CURRENCY_MAP.ARB as Coins]?.addresses[
                                  networkId as SupportedNetwork
                              ]
                          )
                        : undefined,
                    multipleCollateral[CRYPTO_CURRENCY_MAP.USDbC as Coins]?.addresses[networkId as SupportedNetwork]
                        ? freeBetHolderContract?.balancePerUserAndCollateral(
                              walletAddress,
                              multipleCollateral[CRYPTO_CURRENCY_MAP.USDbC as Coins]?.addresses[
                                  networkId as SupportedNetwork
                              ]
                          )
                        : undefined,
                    multipleCollateral[CRYPTO_CURRENCY_MAP.THALES as Coins]?.addresses[networkId as SupportedNetwork]
                        ? freeBetHolderContract?.balancePerUserAndCollateral(
                              walletAddress,
                              multipleCollateral[CRYPTO_CURRENCY_MAP.THALES as Coins]?.addresses[
                                  networkId as SupportedNetwork
                              ]
                          )
                        : undefined,
                ]);

                return {
                    sUSD: sUSDBalance ? bigNumberFormatter(sUSDBalance, COLLATERAL_DECIMALS.sUSD) : 0,
                    DAI: DAIBalance ? bigNumberFormatter(DAIBalance, COLLATERAL_DECIMALS.DAI) : 0,
                    USDC: USDCBalance ? bigNumberFormatter(USDCBalance, COLLATERAL_DECIMALS.USDC) : 0,
                    USDCe: USDCeBalance ? bigNumberFormatter(USDCeBalance, COLLATERAL_DECIMALS.USDCe) : 0,
                    USDT: USDTBalance ? bigNumberFormatter(USDTBalance, COLLATERAL_DECIMALS.USDT) : 0,
                    OP: OPBalance ? bigNumberFormatter(OPBalance, COLLATERAL_DECIMALS.OP) : 0,
                    WETH: WETHBalance ? bigNumberFormatter(WETHBalance, COLLATERAL_DECIMALS.WETH) : 0,
                    ETH: 0,
                    ARB: ARBBalance ? bigNumberFormatter(ARBBalance, COLLATERAL_DECIMALS.ARB) : 0,
                    USDbC: USDbCBalance ? bigNumberFormatter(USDbCBalance, COLLATERAL_DECIMALS.USDbC) : 0,
                    THALES: THALESBalance ? bigNumberFormatter(THALESBalance, COLLATERAL_DECIMALS.THALES) : 0,
                };
            } catch (e) {
                console.log('e ', e);
                return {
                    sUSD: 0,
                    DAI: 0,
                    USDCe: 0,
                    USDT: 0,
                    OP: 0,
                    WETH: 0,
                    ETH: 0,
                    ARB: 0,
                    USDC: 0,
                    USDbC: 0,
                };
            }
        },
        options
    );
};

export default useFreeBetCollateralBalanceQuery;
