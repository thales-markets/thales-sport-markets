import { Coins, COLLATERAL_DECIMALS, floorNumberToDecimals, getDefaultDecimalsForNetwork } from 'thales-utils';
import { formatUnits, getAddress as getAddressViem, hexToString, parseUnits, stringToHex } from 'viem';

export const bytesFormatter = (input: string) => stringToHex(input, { size: 32 });

export const parseBytes32String = (input: string) => hexToString(input as any, { size: 32 });

export const bigNumberFormatter = (value: bigint, decimals?: number) =>
    Number(formatUnits(value, decimals !== undefined ? decimals : 18));

export const coinFormatter = (value: bigint, networkId: number, currency?: Coins) => {
    const decimals = currency ? COLLATERAL_DECIMALS[currency] : getDefaultDecimalsForNetwork(networkId);

    return Number(formatUnits(value, decimals));
};

export const coinParser = (value: string, networkId: number, currency?: Coins) => {
    const decimals = currency ? COLLATERAL_DECIMALS[currency] : getDefaultDecimalsForNetwork(networkId);

    return parseUnits(floorNumberToDecimals(Number(value), decimals).toString(), decimals);
};

export const getAddress = (addr: string) => getAddressViem(addr);
