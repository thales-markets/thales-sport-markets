import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getBalance } from '@wagmi/core';
import { CRYPTO_CURRENCY_MAP, DEFAULT_MULTI_COLLATERAL_BALANCE } from 'constants/currency';
import { TBD_ADDRESS } from 'constants/network';
import QUERY_KEYS from 'constants/queryKeys';
import { BALANCE_THRESHOLD } from 'constants/wallet';
import { ContractType } from 'enums/contract';
import { wagmiConfig } from 'pages/Root/wagmiConfig';
import { bigNumberFormatter, Coins, COLLATERAL_DECIMALS } from 'thales-utils';
import { CollateralsBalance } from 'types/collateral';
import { NetworkConfig } from 'types/network';
import { getCollateralIndex } from 'utils/collaterals';
import { getContractInstance } from 'utils/contract';
import { Address } from 'viem';

const useMultipleCollateralBalanceQuery = (
    walletAddress: string,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<CollateralsBalance>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<CollateralsBalance>({
        queryKey: QUERY_KEYS.Wallet.MultipleCollateral(walletAddress, networkConfig.networkId),
        queryFn: async () => {
            let collateralsBalance: CollateralsBalance = DEFAULT_MULTI_COLLATERAL_BALANCE;
            try {
                const multipleCollateralObject = {
                    DAI: getContractInstance(
                        ContractType.MULTICOLLATERAL,
                        networkConfig,
                        getCollateralIndex(networkConfig.networkId, CRYPTO_CURRENCY_MAP.DAI as Coins)
                    ),
                    USDC: getContractInstance(
                        ContractType.MULTICOLLATERAL,
                        networkConfig,
                        getCollateralIndex(networkConfig.networkId, CRYPTO_CURRENCY_MAP.USDC as Coins)
                    ),
                    USDCe: getContractInstance(
                        ContractType.MULTICOLLATERAL,
                        networkConfig,
                        getCollateralIndex(networkConfig.networkId, CRYPTO_CURRENCY_MAP.USDCe as Coins)
                    ),
                    USDbC: getContractInstance(
                        ContractType.MULTICOLLATERAL,
                        networkConfig,
                        getCollateralIndex(networkConfig.networkId, CRYPTO_CURRENCY_MAP.USDbC as Coins)
                    ),
                    USDT: getContractInstance(
                        ContractType.MULTICOLLATERAL,
                        networkConfig,
                        getCollateralIndex(networkConfig.networkId, CRYPTO_CURRENCY_MAP.USDT as Coins)
                    ),
                    OP: getContractInstance(
                        ContractType.MULTICOLLATERAL,
                        networkConfig,
                        getCollateralIndex(networkConfig.networkId, CRYPTO_CURRENCY_MAP.OP as Coins)
                    ),
                    WETH: getContractInstance(
                        ContractType.MULTICOLLATERAL,
                        networkConfig,
                        getCollateralIndex(networkConfig.networkId, CRYPTO_CURRENCY_MAP.WETH as Coins)
                    ),
                    ETH: getContractInstance(
                        ContractType.MULTICOLLATERAL,
                        networkConfig,
                        getCollateralIndex(networkConfig.networkId, CRYPTO_CURRENCY_MAP.ETH as Coins)
                    ),
                    ARB: getContractInstance(
                        ContractType.MULTICOLLATERAL,
                        networkConfig,
                        getCollateralIndex(networkConfig.networkId, CRYPTO_CURRENCY_MAP.ARB as Coins)
                    ),
                    OVER: getContractInstance(
                        ContractType.MULTICOLLATERAL,
                        networkConfig,
                        getCollateralIndex(networkConfig.networkId, CRYPTO_CURRENCY_MAP.OVER as Coins)
                    ),
                    THALES: getContractInstance(ContractType.THALES, networkConfig),
                    cbBTC: getContractInstance(
                        ContractType.MULTICOLLATERAL,
                        networkConfig,
                        getCollateralIndex(networkConfig.networkId, CRYPTO_CURRENCY_MAP.cbBTC as Coins)
                    ),
                    wBTC: getContractInstance(
                        ContractType.MULTICOLLATERAL,
                        networkConfig,
                        getCollateralIndex(networkConfig.networkId, CRYPTO_CURRENCY_MAP.wBTC as Coins)
                    ),
                };

                if (!walletAddress || !networkConfig.networkId) {
                    return collateralsBalance;
                }

                const [
                    DAIBalance,
                    USDCBalance,
                    USDCeBalance,
                    USDbCBalance,
                    USDTBalance,
                    OPBalance,
                    WETHBalance,
                    ETHBalance,
                    ARBBalance,
                    OVERBalance,
                    THALESBalance,
                    cbBTCBalance,
                    wBTCBalance,
                ] = await Promise.all([
                    multipleCollateralObject?.DAI && multipleCollateralObject?.DAI?.address !== TBD_ADDRESS
                        ? multipleCollateralObject.DAI.read.balanceOf([walletAddress])
                        : 0,
                    multipleCollateralObject?.USDC && multipleCollateralObject?.USDC?.address !== TBD_ADDRESS
                        ? multipleCollateralObject.USDC.read.balanceOf([walletAddress])
                        : 0,
                    multipleCollateralObject?.USDCe && multipleCollateralObject?.USDCe?.address !== TBD_ADDRESS
                        ? multipleCollateralObject.USDCe.read.balanceOf([walletAddress])
                        : 0,
                    multipleCollateralObject?.USDbC && multipleCollateralObject?.USDbC?.address !== TBD_ADDRESS
                        ? multipleCollateralObject.USDbC.read.balanceOf([walletAddress])
                        : 0,
                    multipleCollateralObject?.USDT && multipleCollateralObject?.USDT?.address !== TBD_ADDRESS
                        ? multipleCollateralObject.USDT.read.balanceOf([walletAddress])
                        : 0,
                    multipleCollateralObject?.OP && multipleCollateralObject?.OP?.address !== TBD_ADDRESS
                        ? multipleCollateralObject.OP.read.balanceOf([walletAddress])
                        : 0,
                    multipleCollateralObject?.WETH && multipleCollateralObject?.WETH?.address !== TBD_ADDRESS
                        ? multipleCollateralObject.WETH.read.balanceOf([walletAddress])
                        : 0,
                    getBalance(wagmiConfig, { address: walletAddress as Address }),
                    multipleCollateralObject?.ARB && multipleCollateralObject?.ARB?.address !== TBD_ADDRESS
                        ? multipleCollateralObject.ARB.read.balanceOf([walletAddress])
                        : 0,
                    multipleCollateralObject?.OVER && multipleCollateralObject?.OVER?.address !== TBD_ADDRESS
                        ? multipleCollateralObject.OVER.read.balanceOf([walletAddress])
                        : 0,
                    multipleCollateralObject?.THALES && multipleCollateralObject?.THALES?.address !== TBD_ADDRESS
                        ? multipleCollateralObject.THALES.read.balanceOf([walletAddress])
                        : 0,
                    multipleCollateralObject?.cbBTC && multipleCollateralObject?.cbBTC?.address !== TBD_ADDRESS
                        ? multipleCollateralObject.cbBTC.read.balanceOf([walletAddress])
                        : 0,
                    multipleCollateralObject?.wBTC && multipleCollateralObject?.wBTC?.address !== TBD_ADDRESS
                        ? multipleCollateralObject.wBTC.read.balanceOf([walletAddress])
                        : 0,
                ]);

                collateralsBalance = {
                    DAI: DAIBalance ? bigNumberFormatter(DAIBalance, COLLATERAL_DECIMALS.DAI) : 0,
                    USDC: USDCBalance ? bigNumberFormatter(USDCBalance, COLLATERAL_DECIMALS.USDC) : 0,
                    USDCe: USDCeBalance ? bigNumberFormatter(USDCeBalance, COLLATERAL_DECIMALS.USDCe) : 0,
                    USDbC: USDbCBalance ? bigNumberFormatter(USDbCBalance, COLLATERAL_DECIMALS.USDbC) : 0,
                    USDT: USDTBalance ? bigNumberFormatter(USDTBalance, COLLATERAL_DECIMALS.USDT) : 0,
                    OP: OPBalance ? bigNumberFormatter(OPBalance, COLLATERAL_DECIMALS.OP) : 0,
                    WETH: WETHBalance ? bigNumberFormatter(WETHBalance, COLLATERAL_DECIMALS.WETH) : 0,
                    ETH: ETHBalance ? bigNumberFormatter(ETHBalance.value, COLLATERAL_DECIMALS.ETH) : 0,
                    ARB: ARBBalance ? bigNumberFormatter(ARBBalance, COLLATERAL_DECIMALS.ARB) : 0,
                    OVER: OVERBalance
                        ? bigNumberFormatter(OVERBalance, COLLATERAL_DECIMALS.OVER) < BALANCE_THRESHOLD
                            ? 0
                            : bigNumberFormatter(OVERBalance, COLLATERAL_DECIMALS.OVER)
                        : 0,
                    THALES: THALESBalance
                        ? bigNumberFormatter(THALESBalance, COLLATERAL_DECIMALS.THALES) < BALANCE_THRESHOLD
                            ? 0
                            : bigNumberFormatter(THALESBalance, COLLATERAL_DECIMALS.THALES)
                        : 0,
                    sTHALES: 0,
                    cbBTC: cbBTCBalance ? bigNumberFormatter(cbBTCBalance, COLLATERAL_DECIMALS.cbBTC) : 0,
                    wBTC: wBTCBalance ? bigNumberFormatter(wBTCBalance, COLLATERAL_DECIMALS.cbBTC) : 0,
                };
            } catch (e) {
                console.log('e ', e);
                return collateralsBalance;
            }

            return collateralsBalance;
        },
        ...options,
    });
};

export default useMultipleCollateralBalanceQuery;
