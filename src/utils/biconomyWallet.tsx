import { BiconomySmartAccountV2 } from '@biconomy/account';
import { UniversalAccount } from '@GDdark/universal-account';

type BiconomyConnector = {
    wallet: BiconomySmartAccountV2 | null;
    address: string;
    universalAccount: UniversalAccount | null;
    setWallet: (
        wallet: BiconomySmartAccountV2 | null,
        address: string,
        universalAccount: UniversalAccount | null
    ) => void;
    resetWallet: () => void;
};

const biconomyConnector: BiconomyConnector = {
    wallet: null,
    address: '',
    universalAccount: null,

    setWallet: function (
        wallet: BiconomySmartAccountV2 | null,
        address: string,
        universalAccount: UniversalAccount | null
    ) {
        this.wallet = wallet;
        this.address = address;
        this.universalAccount = universalAccount;
    },
    resetWallet: function () {
        this.wallet = null;
        this.address = '';
    },
};

export default biconomyConnector;
