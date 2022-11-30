import ROUTES from 'constants/routes';
import { createBrowserHistory, createHashHistory } from 'history';

const ifIpfsDeployment = process.env.REACT_APP_IPFS_DEPLOYMENT === 'true';
const history = ifIpfsDeployment ? createHashHistory() : createBrowserHistory();

export const navigateTo = (path: string, replacePath = false, scrollToTop = false, state = '') => {
    if (scrollToTop) {
        window.scrollTo(0, 0);
    }
    replacePath ? history.replace(path, state) : history.push(path, state);
};

export const buildHref = (route: string) => `${ifIpfsDeployment ? '#' : ''}${route}`;

export const buildMarketLink = (marketAddress: string, language: string, excludeSlash = false) =>
    `${ifIpfsDeployment && !excludeSlash ? '#' : ''}${ROUTES.Markets.Home}/${marketAddress}?lang=${language}`;

export const buildVaultLink = (vaultId: string, language: string, excludeSlash = false) =>
    `${ifIpfsDeployment && !excludeSlash ? '#' : ''}${ROUTES.Vaults}/${vaultId}?lang=${language}`;

export const buildRouteWithParams = (route: string, params: { key: string; value: string }[]) => {
    return `${ifIpfsDeployment ? '#' : ''}${route}?${params.map((item) => `&${item.key}=${item.value}`)}`;
};

export const buildReferralLink = (route: string, hash: string, search: string, referralId: string) => {
    const hasSearch = !!search;
    if (ifIpfsDeployment) {
        if (hash.includes('referralId')) {
            const reg = /referralId=\w{1,42}/;
            const replacedReferral = hash.replace(reg, `referralId=${referralId.toLowerCase()}`);
            return `/${replacedReferral}`;
        }
        return `/${hash}${hasSearch ? '&' : '?'}referralId=${referralId.toLowerCase()}`;
    } else {
        if (search.includes('referralId')) {
            const reg = /referralId=\w{1,42}/;
            const replacedReferral = search.replace(reg, `referralId=${referralId.toLowerCase()}`);
            return `${route}${replacedReferral}`;
        }
        return `${route}${search}${hasSearch ? '&' : '?'}referralId=${referralId.toLowerCase()}`;
    }
};

export { history, ifIpfsDeployment };
