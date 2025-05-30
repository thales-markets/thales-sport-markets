import { BiconomySmartAccountV2 } from '@biconomy/account';
import { UniversalAccount } from '@particle-network/universal-account-sdk';

type SmartAccountConnector = {
    biconomyAccount: BiconomySmartAccountV2 | null;
    biconomyAddress: string;
    universalAccount: UniversalAccount | null;
    setBiconomyAccount: (biconomyAccount: BiconomySmartAccountV2 | null, address: string) => void;
    setUniversalAccount: (universalAccount: UniversalAccount | null) => void;
    resetWallet: () => void;
};

const smartAccountConnector: SmartAccountConnector = {
    biconomyAccount: null,
    biconomyAddress: '',
    universalAccount: null,

    setBiconomyAccount: function (biconomyAccount: BiconomySmartAccountV2 | null, address: string) {
        this.biconomyAccount = biconomyAccount;
        this.biconomyAddress = address;
    },
    setUniversalAccount: function (universalAccount: UniversalAccount | null) {
        this.universalAccount = universalAccount;
    },
    resetWallet: function () {
        this.biconomyAccount = null;
        this.biconomyAddress = '';
        this.universalAccount = null;
    },
};

export default smartAccountConnector;
