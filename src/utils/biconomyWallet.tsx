import { BiconomySmartAccountV2 } from '@biconomy/account';

type BiconomyConnector = {
    wallet: BiconomySmartAccountV2 | null;
    setWallet: (wallet: BiconomySmartAccountV2 | null) => void;
};

// @ts-ignore
const biconomyConnector: BiconomyConnector = {
    setWallet: function (wallet: BiconomySmartAccountV2 | null) {
        this.wallet = wallet;
    },
};

export default biconomyConnector;
