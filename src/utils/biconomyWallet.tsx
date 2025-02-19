import { NexusClient } from '@biconomy/abstractjs';

type BiconomyConnector = {
    wallet: NexusClient | null;
    address: string;
    setWallet: (wallet: NexusClient | null, address: string) => void;
    resetWallet: () => void;
};

const biconomyConnector: BiconomyConnector = {
    wallet: null,
    address: '',
    setWallet: function (wallet: NexusClient | null, address: string) {
        this.wallet = wallet;
        this.address = address;
    },
    resetWallet: function () {
        this.wallet = null;
        this.address = '';
    },
};

export default biconomyConnector;
