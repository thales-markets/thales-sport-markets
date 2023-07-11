import { BigNumberish } from 'ethers';
import { ethers } from 'ethers';

export const bigNumberFormatter = (value: BigNumberish) => Number(ethers.utils.formatEther(value));

export const bigNumberFormmaterWithDecimals = (value: string, decimals?: number) =>
    Number(ethers.utils.formatUnits(value, decimals ? decimals : 18));

export const getAddress = (addr: string) => ethers.utils.getAddress(addr);
