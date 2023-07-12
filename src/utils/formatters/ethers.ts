import { STABLE_DECIMALS } from 'constants/currency';
import { BigNumberish } from 'ethers';
import { ethers } from 'ethers';
import { StablecoinKey } from 'types/tokens';
import { getDefaultDecimalsForNetwork } from 'utils/network';

export const bigNumberFormatter = (value: BigNumberish) => Number(ethers.utils.formatEther(value));

export const bigNumberFormmaterWithDecimals = (value: string, decimals?: number) =>
    Number(ethers.utils.formatUnits(value, decimals ? decimals : 18));

export const getAddress = (addr: string) => ethers.utils.getAddress(addr);

export const stableCoinParser = (value: string, networkId: number, currency?: StablecoinKey) => {
    const decimals = currency ? STABLE_DECIMALS[currency] : getDefaultDecimalsForNetwork(networkId);
    return ethers.utils.parseUnits(value, decimals);
};
