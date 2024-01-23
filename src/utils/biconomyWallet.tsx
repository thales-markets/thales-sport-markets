import { BiconomySmartAccountV2 } from '@biconomy/account';
import { UserInfo } from '@particle-network/auth';

type BiconomyConnector = {
    wallet: BiconomySmartAccountV2 | null;
    userInfo: UserInfo | null;
    setWallet: (wallet: BiconomySmartAccountV2 | null) => void;
    setUserInfo: (userInfo: UserInfo | null) => void;
};

// @ts-ignore
const biconomyConnector: BiconomyConnector = {
    setWallet: function (wallet: BiconomySmartAccountV2 | null) {
        this.wallet = wallet;
    },
    setUserInfo: function (userInfo: UserInfo | null) {
        this.userInfo = userInfo;
    },
};

export default biconomyConnector;
