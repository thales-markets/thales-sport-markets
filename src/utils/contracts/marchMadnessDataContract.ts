import { Network } from 'enums/network';

export const marchMadnessDataContract = {
    addresses: {
        [Network.OptimismMainnet]: 'TBD',
        [Network.OptimismGoerli]: 'TBD',
        [Network.Arbitrum]: '0x9A978c08e1874b24E391E7772707CcB39bd8fB7C',
        [Network.Base]: 'TBD',
    },
    abi: [
        {
            inputs: [
                {
                    internalType: 'address',
                    name: '_mmv2',
                    type: 'address',
                },
            ],
            stateMutability: 'nonpayable',
            type: 'constructor',
        },
        {
            inputs: [
                {
                    internalType: 'uint256',
                    name: 'itemId',
                    type: 'uint256',
                },
            ],
            name: 'getBracketsByItemId',
            outputs: [
                {
                    internalType: 'uint256[63]',
                    name: 'brackets',
                    type: 'uint256[63]',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'mmv2',
            outputs: [
                {
                    internalType: 'contract MarchMadnessV2',
                    name: '',
                    type: 'address',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
    ],
};
