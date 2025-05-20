import { BiconomySmartAccountV2 } from '@biconomy/account';
import { UniversalAccount } from '@particle-network/universal-account-sdk';

type BiconomyConnector = {
    wallet: BiconomySmartAccountV2 | null;
    address: string;
    universalAccount: UniversalAccount | null;
    setWallet: (wallet: BiconomySmartAccountV2 | null, address: string) => void;
    setUniversalAccount: (universalAccount: UniversalAccount | null) => void;
    resetWallet: () => void;
};

const biconomyConnector: BiconomyConnector = {
    wallet: null,
    address: '',
    universalAccount: null,

    setWallet: function (wallet: BiconomySmartAccountV2 | null, address: string) {
        this.wallet = wallet;
        this.address = address;
    },
    setUniversalAccount: function (universalAccount: UniversalAccount | null) {
        this.universalAccount = universalAccount;
    },
    resetWallet: function () {
        this.wallet = null;
        this.address = '';
        this.universalAccount = null;
    },
};

export default biconomyConnector;
