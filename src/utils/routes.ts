import { LINKS } from 'constants/links';
import ROUTES from 'constants/routes';
import { MetaRoutes } from 'enums/routes';
import { createBrowserHistory, createHashHistory } from 'history';

const ifIpfsDeployment = import.meta.env.VITE_APP_IPFS_DEPLOYMENT === 'true';
const history = ifIpfsDeployment ? createHashHistory() : createBrowserHistory();

export const navigateTo = (path: string, replacePath = false, scrollToTop = false, state = '') => {
    if (scrollToTop) {
        window.scrollTo(0, 0);
    }
    replacePath ? history.replace(path, state) : history.push(path, state);
};

export const buildHref = (route: string) => `${ifIpfsDeployment ? '#' : ''}${route}`;

export const buildMarketLink = (marketAddress: string, language: string, excludeSlash = false, title?: string) =>
    `${ifIpfsDeployment && !excludeSlash ? '#' : ''}${ROUTES.Markets.Home}/${marketAddress}?lang=${language}${
        title ? `&title=${title}` : ''
    }`;

export const buildDepositOrWithdrawLink = (language: string, page: string, coinIndex: number, excludeSlash = false) => {
    return `${ifIpfsDeployment && !excludeSlash ? '#' : ''}${
        page == 'withdraw' ? ROUTES.Withdraw : ROUTES.Deposit
    }?lang=${language}&coin-index=${coinIndex}`;
};

export const buildSpeedMarketsBannerHref = () =>
    `${LINKS.SpeedMarkets}/speed-markets?utm_source=internal&utm_medium=ot_banner&utm_campaign=speed_markets_feb_2025`;

export const getMetaRouteItem = (pathName: string) => {
    if (pathName.includes(ROUTES.Markets.Home + '/')) return MetaRoutes.SingleMarket;
    if (pathName.includes(ROUTES.Markets.Home)) return MetaRoutes.Markets;
    if (pathName.includes(ROUTES.Profile)) return MetaRoutes.Profile;
    if (pathName.includes(ROUTES.LiquidityPool)) return MetaRoutes.LiquidityPool;
    return MetaRoutes.Home;
};

export { history, ifIpfsDeployment };
