import ROUTES from 'constants/routes';
import Web3 from 'web3';
import { buildReferralLink } from './routes';

export const setReferralId = (referralId: string): void => {
    if (!Web3.utils.isAddress(referralId)) {
        return undefined;
    }

    localStorage.setItem('referralId', referralId);
};

export const getReferralId = (): string | null => {
    const referralIdFromLocalStorage = localStorage.getItem('referralId');
    return referralIdFromLocalStorage && Web3.utils.isAddress(referralIdFromLocalStorage)
        ? referralIdFromLocalStorage
        : null;
};

export const generateReferralLink = (walletAddress: string) => {
    return `${window.location.origin}${buildReferralLink(
        ROUTES.Markets.Home,
        window.location.hash,
        '',
        walletAddress
    )}`;
};
