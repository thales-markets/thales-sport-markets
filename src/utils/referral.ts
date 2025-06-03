import { isAddress } from 'viem';

export const setReferralId = (referralId: string): void => {
    if (!isAddress(referralId)) {
        return undefined;
    }

    localStorage.setItem('referralId', referralId);
};

export const getReferralId = (): string | null => {
    const referralIdFromLocalStorage = localStorage.getItem('referralId');
    return referralIdFromLocalStorage && isAddress(referralIdFromLocalStorage) ? referralIdFromLocalStorage : null;
};
