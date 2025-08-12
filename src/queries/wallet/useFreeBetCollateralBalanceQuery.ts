import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { CRYPTO_CURRENCY_MAP, DEFAULT_FREE_BET_COLLATERAL_BALANCE } from 'constants/currency';
import { TBD_ADDRESS } from 'constants/network';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { bigNumberFormatter, Coins, COLLATERAL_DECIMALS } from 'thales-utils';
import { FreeBetBalance } from 'types/collateral';
import { NetworkConfig, SupportedNetwork } from 'types/network';
import { getContractInstance } from 'utils/contract';
import multipleCollateral from 'utils/contracts/multipleCollateralContract';

const useFreeBetCollateralBalanceQuery = (
    walletAddress: string,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<FreeBetBalance>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<FreeBetBalance>({
        queryKey: QUERY_KEYS.Wallet.FreeBetBalance(walletAddress, networkConfig.networkId),
        queryFn: async () => {
            try {
                const freeBetHolderContract = getContractInstance(ContractType.FREE_BET_HOLDER, networkConfig);

                if (!walletAddress || !networkConfig.networkId || !freeBetHolderContract || !multipleCollateral) {
                    return DEFAULT_FREE_BET_COLLATERAL_BALANCE;
                }

                const DAIAddress =
                    multipleCollateral[CRYPTO_CURRENCY_MAP.DAI as Coins]?.addresses[
                        networkConfig.networkId as SupportedNetwork
                    ];
                const USDCAddress =
                    multipleCollateral[CRYPTO_CURRENCY_MAP.USDC as Coins]?.addresses[
                        networkConfig.networkId as SupportedNetwork
                    ];
                const USDCeAddress =
                    multipleCollateral[CRYPTO_CURRENCY_MAP.USDCe as Coins]?.addresses[
                        networkConfig.networkId as SupportedNetwork
                    ];
                const USDTAddress =
                    multipleCollateral[CRYPTO_CURRENCY_MAP.USDT as Coins]?.addresses[
                        networkConfig.networkId as SupportedNetwork
                    ];
                const OPAddress =
                    multipleCollateral[CRYPTO_CURRENCY_MAP.OP as Coins]?.addresses[
                        networkConfig.networkId as SupportedNetwork
                    ];
                const WETHAddress =
                    multipleCollateral[CRYPTO_CURRENCY_MAP.WETH as Coins]?.addresses[
                        networkConfig.networkId as SupportedNetwork
                    ];
                const ARBAddress =
                    multipleCollateral[CRYPTO_CURRENCY_MAP.ARB as Coins]?.addresses[
                        networkConfig.networkId as SupportedNetwork
                    ];
                const USDbCAddress =
                    multipleCollateral[CRYPTO_CURRENCY_MAP.USDbC as Coins]?.addresses[
                        networkConfig.networkId as SupportedNetwork
                    ];
                const OVERAddress =
                    multipleCollateral[CRYPTO_CURRENCY_MAP.OVER as Coins]?.addresses[
                        networkConfig.networkId as SupportedNetwork
                    ];

                const [
                    DAIBalance,
                    DAIBalanceValidity,
                    USDCBalance,
                    USDCBalanceValidity,
                    USDCeBalance,
                    USDCeBalanceValidity,
                    USDTBalance,
                    USDTBalanceValidity,
                    OPBalance,
                    OPBalanceValidity,
                    WETHBalance,
                    WETHBalanceValidity,
                    ARBBalance,
                    ARBBalanceValidity,
                    USDbCBalance,
                    USDbCBalanceValidity,
                    OVERBalance,
                    OVERBalanceValidity,
                ] = await Promise.all([
                    DAIAddress !== TBD_ADDRESS
                        ? freeBetHolderContract?.read.balancePerUserAndCollateral([walletAddress, DAIAddress])
                        : undefined,
                    DAIAddress !== TBD_ADDRESS
                        ? freeBetHolderContract?.read.isFreeBetValid([walletAddress, DAIAddress])
                        : undefined,
                    USDCAddress !== TBD_ADDRESS
                        ? freeBetHolderContract?.read.balancePerUserAndCollateral([walletAddress, USDCAddress])
                        : undefined,
                    USDCAddress !== TBD_ADDRESS
                        ? freeBetHolderContract?.read.isFreeBetValid([walletAddress, USDCAddress])
                        : undefined,
                    USDCeAddress !== TBD_ADDRESS
                        ? freeBetHolderContract?.read.balancePerUserAndCollateral([walletAddress, USDCeAddress])
                        : undefined,
                    USDCeAddress !== TBD_ADDRESS
                        ? freeBetHolderContract?.read.isFreeBetValid([walletAddress, USDCeAddress])
                        : undefined,
                    USDTAddress !== TBD_ADDRESS
                        ? freeBetHolderContract?.read.balancePerUserAndCollateral([walletAddress, USDTAddress])
                        : undefined,
                    USDTAddress !== TBD_ADDRESS
                        ? freeBetHolderContract?.read.isFreeBetValid([walletAddress, USDTAddress])
                        : undefined,
                    OPAddress !== TBD_ADDRESS
                        ? freeBetHolderContract?.read.balancePerUserAndCollateral([walletAddress, OPAddress])
                        : undefined,
                    OPAddress !== TBD_ADDRESS
                        ? freeBetHolderContract?.read.isFreeBetValid([walletAddress, OPAddress])
                        : undefined,
                    WETHAddress !== TBD_ADDRESS
                        ? freeBetHolderContract?.read.balancePerUserAndCollateral([walletAddress, WETHAddress])
                        : undefined,
                    WETHAddress !== TBD_ADDRESS
                        ? freeBetHolderContract?.read.isFreeBetValid([walletAddress, WETHAddress])
                        : undefined,
                    ARBAddress !== TBD_ADDRESS
                        ? freeBetHolderContract?.read.balancePerUserAndCollateral([walletAddress, ARBAddress])
                        : undefined,
                    ARBAddress !== TBD_ADDRESS
                        ? freeBetHolderContract?.read.isFreeBetValid([walletAddress, ARBAddress])
                        : undefined,
                    USDbCAddress !== TBD_ADDRESS
                        ? freeBetHolderContract?.read.balancePerUserAndCollateral([walletAddress, USDbCAddress])
                        : undefined,
                    USDbCAddress !== TBD_ADDRESS
                        ? freeBetHolderContract?.read.isFreeBetValid([walletAddress, USDbCAddress])
                        : undefined,
                    OVERAddress !== TBD_ADDRESS
                        ? freeBetHolderContract?.read.balancePerUserAndCollateral([walletAddress, OVERAddress])
                        : undefined,
                    OVERAddress !== TBD_ADDRESS
                        ? freeBetHolderContract?.read.isFreeBetValid([walletAddress, OVERAddress])
                        : undefined,
                ]);

                return {
                    balances: {
                        DAI: DAIBalance ? bigNumberFormatter(DAIBalance, COLLATERAL_DECIMALS.DAI) : 0,
                        USDC: USDCBalance ? bigNumberFormatter(USDCBalance, COLLATERAL_DECIMALS.USDC) : 0,
                        USDCe: USDCeBalance ? bigNumberFormatter(USDCeBalance, COLLATERAL_DECIMALS.USDCe) : 0,
                        USDT: USDTBalance ? bigNumberFormatter(USDTBalance, COLLATERAL_DECIMALS.USDT) : 0,
                        OP: OPBalance ? bigNumberFormatter(OPBalance, COLLATERAL_DECIMALS.OP) : 0,
                        WETH: WETHBalance ? bigNumberFormatter(WETHBalance, COLLATERAL_DECIMALS.WETH) : 0,
                        ARB: ARBBalance ? bigNumberFormatter(ARBBalance, COLLATERAL_DECIMALS.ARB) : 0,
                        USDbC: USDbCBalance ? bigNumberFormatter(USDbCBalance, COLLATERAL_DECIMALS.USDbC) : 0,
                        OVER: OVERBalance ? bigNumberFormatter(OVERBalance, COLLATERAL_DECIMALS.OVER) : 0,
                    },
                    validity: {
                        DAI: DAIBalanceValidity ? DAIBalanceValidity.isValid : false,
                        USDCe: USDCeBalanceValidity ? USDCeBalanceValidity.isValid : false,
                        USDbC: USDbCBalanceValidity ? USDbCBalanceValidity.isValid : false,
                        USDT: USDTBalanceValidity ? USDTBalanceValidity.isValid : false,
                        OP: OPBalanceValidity ? OPBalanceValidity.isValid : false,
                        WETH: WETHBalanceValidity ? WETHBalanceValidity.isValid : false,
                        ARB: ARBBalanceValidity ? ARBBalanceValidity.isValid : false,
                        USDC: USDCBalanceValidity ? USDCBalanceValidity.isValid : false,
                        OVER: OVERBalanceValidity ? OVERBalanceValidity.isValid : false,
                    },
                };
            } catch (e) {
                console.log('e ', e);
                return DEFAULT_FREE_BET_COLLATERAL_BALANCE;
            }
        },
        ...options,
    });
};

export default useFreeBetCollateralBalanceQuery;
