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

export const buildLpLink = (language: string, lpType: string, excludeSlash = false) =>
    `${ifIpfsDeployment && !excludeSlash ? '#' : ''}${
        lpType == 'parlay' ? ROUTES.ParlayLiquidityPool : ROUTES.SingleLiquidityPool
    }&lang=${language}`;

export const buildReffererLink = (reffererID: string) => {
    return `${window.location.origin}${ifIpfsDeployment ? '/#' : ''}${ROUTES.Markets.Home}?referrerId=${reffererID}`;
};

export { history, ifIpfsDeployment };
