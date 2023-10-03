import { BigNumberish } from 'ethers';
import { ethers } from 'ethers';
import { Coins } from 'types/tokens';
import { getDefaultDecimalsForNetwork } from 'utils/network';
import { COLLATERAL_DECIMALS } from 'constants/currency';

export const bytesFormatter = (input: string) => ethers.utils.formatBytes32String(input);

export const parseBytes32String = (input: string) => ethers.utils.parseBytes32String(input);

export const bigNumberFormatter = (value: BigNumberish, decimals?: number) =>
    Number(ethers.utils.formatUnits(value, decimals !== undefined ? decimals : 18));

export const coinFormatter = (value: BigNumberish, networkId: number, currency?: Coins) => {
    const decimals = currency ? COLLATERAL_DECIMALS[currency] : getDefaultDecimalsForNetwork(networkId);

    return Number(ethers.utils.formatUnits(value, decimals));
};

export const coinParser = (value: string, networkId: number, currency?: Coins) => {
    const decimals = currency ? COLLATERAL_DECIMALS[currency] : getDefaultDecimalsForNetwork(networkId);

    return ethers.utils.parseUnits(value, decimals);
};

export const getAddress = (addr: string) => ethers.utils.getAddress(addr);
