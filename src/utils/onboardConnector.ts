import { API as OnboardAPI } from 'bnc-onboard/dist/src/interfaces';

type OnboardConnector = {
    onboard: OnboardAPI;
    setOnBoard: (onboard: OnboardAPI) => void;
    connectWallet: () => void;
    disconnectWallet: () => void;
};

// @ts-ignore
const onboardConnector: OnboardConnector = {
    setOnBoard: function (onboard: OnboardAPI) {
        this.onboard = onboard;
        this.connectWallet = async () => {
            try {
                if (this.onboard) {
                    this.onboard.walletReset();
                    const success = await this.onboard.walletSelect();
                    if (success) {
                        await this.onboard.walletCheck();
                    }
                }
            } catch (e) {
                console.log(e);
            }
        };
        this.disconnectWallet = async () => {
            try {
                if (this.onboard) {
                    this.onboard.walletReset();
                }
            } catch (e) {
                console.log(e);
            }
        };
    },
};

export default onboardConnector;
