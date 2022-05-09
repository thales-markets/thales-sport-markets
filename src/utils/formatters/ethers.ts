import { BigNumberish } from 'ethers';
import { ethers } from 'ethers';

export const bytesFormatter = (input: string) => ethers.utils.formatBytes32String(input);

export const parseBytes32String = (input: string) => ethers.utils.parseBytes32String(input);

export const bigNumberFormatter = (value: BigNumberish) => Number(ethers.utils.formatEther(value));

export const getAddress = (addr: string) => ethers.utils.getAddress(addr);
