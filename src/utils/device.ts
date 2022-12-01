export const isMobile = () => window.innerWidth < 950;

export const isFirefox = () => navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

export const isMetamask = async () => {
    if (!window.ethereum) {
        return false;
    }
    const clientVersion = await window.ethereum.request({
        method: 'web3_clientVersion',
    });
    const isMetamaskClientVersion = clientVersion.split('/')[0] === 'MetaMask';

    return window && window.ethereum.isMetaMask && isMetamaskClientVersion;
};

export const isIos = () => {
    return (
        ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(
            navigator.platform
        ) ||
        // iPad on iOS 13 detection
        (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
    );
};
