import { BiconomySmartAccountV2 } from '@biconomy/account';

type BiconomyConnector = {
    wallet: BiconomySmartAccountV2 | null;
    address: string;
    sessionModules?: {
        10: any;
        42161: any;
        8453: any;
        11155420: any;
    };
    setWallet: (wallet: BiconomySmartAccountV2 | null, address: string) => void;
    resetWallet: () => void;
};

const biconomyConnector: BiconomyConnector = {
    wallet: null,
    address: '',
    sessionModules: {
        10: undefined,
        42161: undefined,
        8453: undefined,
        11155420: undefined,
    },
    setWallet: function (wallet: BiconomySmartAccountV2 | null, address: string) {
        this.wallet = wallet;
        this.address = address;
    },
    resetWallet: function () {
        this.wallet = null;
        this.address = '';
    },
};

export default biconomyConnector;
