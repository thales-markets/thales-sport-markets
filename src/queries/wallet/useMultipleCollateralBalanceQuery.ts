import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import { bigNumberFormatter, Coins, COLLATERAL_DECIMALS } from 'thales-utils';
import networkConnector from 'utils/networkConnector';

const useMultipleCollateralBalanceQuery = (
    walletAddress: string,
    networkId: Network,
    options?: UseQueryOptions<any>
) => {
    return useQuery<any>(
        QUERY_KEYS.Wallet.MultipleCollateral(walletAddress, networkId),
        async () => {
            try {
                const multipleCollateral = networkConnector.multipleCollateral;

                if (!walletAddress || !networkId) {
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
                        sTHALES: 0,
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
                    ETHBalance,
                    ARBBalance,
                    USDbCBalance,
                    THALESBalance,
                    sTHALESBalance,
                ] = await Promise.all([
                    multipleCollateral
                        ? multipleCollateral[CRYPTO_CURRENCY_MAP.sUSD as Coins]?.balanceOf(walletAddress)
                        : undefined,
                    multipleCollateral
                        ? multipleCollateral[CRYPTO_CURRENCY_MAP.DAI as Coins]?.balanceOf(walletAddress)
                        : undefined,
                    multipleCollateral
                        ? multipleCollateral[CRYPTO_CURRENCY_MAP.USDC as Coins]?.balanceOf(walletAddress)
                        : undefined,
                    multipleCollateral
                        ? multipleCollateral[CRYPTO_CURRENCY_MAP.USDCe as Coins]?.balanceOf(walletAddress)
                        : undefined,
                    multipleCollateral
                        ? multipleCollateral[CRYPTO_CURRENCY_MAP.USDT as Coins]?.balanceOf(walletAddress)
                        : undefined,
                    multipleCollateral
                        ? multipleCollateral[CRYPTO_CURRENCY_MAP.OP as Coins]?.balanceOf(walletAddress)
                        : undefined,
                    multipleCollateral
                        ? multipleCollateral[CRYPTO_CURRENCY_MAP.WETH as Coins]?.balanceOf(walletAddress)
                        : undefined,
                    networkConnector.provider ? networkConnector.provider.getBalance(walletAddress) : undefined,
                    multipleCollateral
                        ? multipleCollateral[CRYPTO_CURRENCY_MAP.ARB as Coins]?.balanceOf(walletAddress)
                        : undefined,
                    multipleCollateral
                        ? multipleCollateral[CRYPTO_CURRENCY_MAP.USDbC as Coins]?.balanceOf(walletAddress)
                        : undefined,
                    multipleCollateral
                        ? multipleCollateral[CRYPTO_CURRENCY_MAP.THALES as Coins]?.balanceOf(walletAddress)
                        : undefined,
                    multipleCollateral
                        ? multipleCollateral[CRYPTO_CURRENCY_MAP.sTHALES as Coins]?.stakedBalanceOf(walletAddress)
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
                    ETH: ETHBalance ? bigNumberFormatter(ETHBalance, COLLATERAL_DECIMALS.ETH) : 0,
                    ARB: ARBBalance ? bigNumberFormatter(ARBBalance, COLLATERAL_DECIMALS.ARB) : 0,
                    USDbC: USDbCBalance ? bigNumberFormatter(USDbCBalance, COLLATERAL_DECIMALS.USDbC) : 0,
                    THALES: THALESBalance ? bigNumberFormatter(THALESBalance, COLLATERAL_DECIMALS.THALES) : 0,
                    // sub 1 staked THALES due to limitation on contract side
                    sTHALES: sTHALESBalance ? bigNumberFormatter(sTHALESBalance, COLLATERAL_DECIMALS.sTHALES) - 1 : 0,
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

export default useMultipleCollateralBalanceQuery;
