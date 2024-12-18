import { BiconomySmartAccountV2 } from '@biconomy/account';

type BiconomyConnector = {
    wallet: BiconomySmartAccountV2 | null;
    address: string;
    setWallet: (wallet: BiconomySmartAccountV2 | null, address: string) => void;
    resetWallet: () => void;
};

const biconomyConnector: BiconomyConnector = {
    wallet: null,
    address: '',
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
