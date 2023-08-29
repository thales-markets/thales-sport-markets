import { PrimeSdk } from '@etherspot/prime-sdk';

type EtherspotConnector = {
    primeSdk: PrimeSdk | null;
    setPrimeSdk: (primeSdk: PrimeSdk | null) => void;
};

// @ts-ignore
const etherspotConnector: EtherspotConnector = {
    setPrimeSdk: function (primeSdk: PrimeSdk | null) {
        this.primeSdk = primeSdk;
    },
};

export default etherspotConnector;
