export const isMobile = () => window.innerWidth < 950;

export const isFirefox = () => navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

export const isMetamask = () => window && window.ethereum?.isMetaMask;
