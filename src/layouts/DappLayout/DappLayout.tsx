import SpeedMarketsButtonAnimated from 'assets/images/speed-markets/speed-markets-animated.svg';
import axios from 'axios';
import ClaimFreeBetModal from 'components/ClaimFreeBetModal';
import MetaData from 'components/MetaData';
import { generalConfig } from 'config/general';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { NAV_MENU_WIDTH, SPEED_MARKETS_WIDGET_DEFAULT_RIGHT, SPEED_MARKETS_WIDGET_Z_INDEX } from 'constants/ui';
import { Network } from 'enums/network';
import { ScreenSizeBreakpoint, Theme } from 'enums/ui';
import useLocalStorage from 'hooks/useLocalStorage';
import useWidgetBotScript from 'hooks/useWidgetBotScript';
import SpeedMarketsWidget from 'pages/SpeedMarkets/components/SpeedMarketsWidget';
import useGetFreeBetQuery from 'queries/freeBets/useGetFreeBetQuery';
import queryString from 'query-string';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setTheme } from 'redux/modules/ui';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import { isAndroid, isMetamask } from 'thales-utils';
import { RootState } from 'types/redux';
import { isMobile } from 'utils/device';
import { getFreeBetModalShown, setFreeBetModalShown } from 'utils/freeBet';
import { setReferralId } from 'utils/referral';
import useBiconomy from 'utils/smartAccount/hooks/useBiconomy';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import Banner from '../../components/Banner';
import DappFooter from './DappFooter';
import DappHeader from './DappHeader';

type DappLayoutProps = {
    children: React.ReactNode;
};

const DappLayout: React.FC<DappLayoutProps> = ({ children }) => {
    const dispatch = useDispatch();
    const location = useLocation();
    const networkId = useChainId();
    const { switchChain } = useSwitchChain();

    const queryParams: { referralId?: string; referrerId?: string; freeBet?: string } = queryString.parse(
        location.search
    );

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const history = useHistory();
    const { address } = useAccount();

    const { smartAddress } = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddress : address) || '';

    const [freeBetModalParam, setFreeBetModalParam] = useState(queryParams.freeBet);
    const [speedMarketsWidgetOpen, setSpeedMarketsWidgetOpen] = useState(false);

    const [, setFreeBet] = useLocalStorage<any | undefined>(LOCAL_STORAGE_KEYS.FREE_BET_ID, undefined);

    const [preventDiscordWidgetLoad, setPreventDiscordWidgetLoad] = useState(true);

    const freeBetQuery = useGetFreeBetQuery(freeBetModalParam || '', networkId, { enabled: !!freeBetModalParam });

    const freeBetFromServer = useMemo(
        () =>
            freeBetQuery.isSuccess && freeBetQuery.data && freeBetModalParam
                ? { ...freeBetQuery.data, id: freeBetModalParam }
                : null,
        [freeBetQuery.data, freeBetQuery.isSuccess, freeBetModalParam]
    );

    useEffect(() => {
        if (freeBetFromServer?.claimSuccess) {
            setFreeBet(undefined);
            localStorage.removeItem(LOCAL_STORAGE_KEYS.FREE_BET_ID);
        }
    }, [freeBetFromServer, setFreeBet]);

    useEffect(() => {
        if (freeBetModalParam && switchChain) {
            switchChain(
                { chainId: Network.OptimismMainnet },
                {
                    onSuccess: () => {
                        setFreeBetModalShown(true);
                    },
                }
            );
        }
        setTimeout(async () => {
            if (queryParams.freeBet && freeBetFromServer && freeBetModalParam) {
                setFreeBet({ ...freeBetFromServer, id: freeBetModalParam });
            }
        }, 2000);
    }, [
        walletAddress,
        dispatch,
        queryParams.freeBet,
        history,
        location.search,
        setFreeBet,
        networkId,
        freeBetFromServer,
        freeBetModalParam,
        switchChain,
    ]);

    useEffect(() => {
        if (queryParams.referralId) {
            setReferralId(queryParams.referralId);
        }
        const referrerId = queryParams.referrerId;
        if (referrerId) {
            const fetchIdAddress = async () => {
                const response = await axios.get(
                    // passing an encoded string to encodeURIComponent causes an error in some cases
                    // reffererId is already encoded so we have to decode it
                    `${generalConfig.API_URL}/get-refferer-id-address/${encodeURIComponent(
                        decodeURIComponent(referrerId)
                    )}`
                );
                if (response.data) {
                    setReferralId(response.data);
                }
            };
            fetchIdAddress();
        }
    }, [queryParams.referralId, queryParams.referrerId]);

    useEffect(() => {
        dispatch(setTheme(Theme.DARK));
    }, [dispatch]);

    useEffect(() => {
        const checkMetamaskBrowser = async () => {
            const isMetamaskBrowser = isMobile() && (await isMetamask());
            // Do not load Discord Widget Bot on Android MM browser due to issue with MM wallet connect
            // issue raised on https://github.com/rainbow-me/rainbowkit/issues/1181
            setPreventDiscordWidgetLoad(isMetamaskBrowser && isAndroid());
        };
        checkMetamaskBrowser();
    }, []);

    useWidgetBotScript(preventDiscordWidgetLoad, setSpeedMarketsWidgetOpen);

    return (
        <Background>
            {/* <ModalWrapper /> */}
            <Banner />
            <Wrapper>
                <MetaData />
                <DappHeader />
                {children}
                <DappFooter />
                <SpeedMarketsButton
                    className="speed-markets"
                    isOpen={speedMarketsWidgetOpen}
                    onClick={() => setSpeedMarketsWidgetOpen(!speedMarketsWidgetOpen)}
                />
                {speedMarketsWidgetOpen && <SpeedMarketsWidget onClose={() => setSpeedMarketsWidgetOpen(false)} />}
            </Wrapper>
            <ToastContainer stacked theme={'colored'} />
            {freeBetFromServer && getFreeBetModalShown() && (
                <ClaimFreeBetModal
                    onClose={() => {
                        setFreeBetModalParam(undefined);
                        setFreeBetModalShown(false);
                    }}
                    freeBet={freeBetFromServer}
                />
            )}
        </Background>
    );
};

const Background = styled.section`
    min-height: 100vh;
    background: ${(props) => props.theme.background.primary};
    color: ${(props) => props.theme.textColor.primary};
    position: relative;
`;

const Wrapper = styled(FlexDivColumn)`
    align-items: center;
    width: 99%;
    margin-left: auto;
    margin-right: auto;
    padding: 10px 15px;
    max-width: 1512px;
    min-height: 100vh;
    justify-content: space-between;
    @media (max-width: 1499px) {
        padding: 10px 10px;
    }
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        padding: 0px 3px;
    }
`;

const SpeedMarketsButton = styled.div<{ isOpen: boolean }>`
    position: fixed;
    width: 76px;
    height: 76px;
    bottom: 10px;
    right: ${SPEED_MARKETS_WIDGET_DEFAULT_RIGHT}px;
    background-image: ${(props) => (props.isOpen ? 'none' : `url("${SpeedMarketsButtonAnimated}")`)};
    background-position: center;
    border-radius: 50%;
    cursor: pointer;
    z-index: ${SPEED_MARKETS_WIDGET_Z_INDEX};

    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: 55px;
        height: 55px;
        right: -3px;
        bottom: 117px;
        background-size: 65px;
    }

    animation: 0.3s ease 0s 1 normal none running load-animation;
    @keyframes load-animation {
        0% {
            transform: scale(0.1);
            opacity: 0;
        }
        100% {
            transform: initial;
            opacity: 1;
        }
    }

    // for Navigation menu
    @keyframes move-left {
        0% {
            visibility: none;
            right: ${SPEED_MARKETS_WIDGET_DEFAULT_RIGHT}px;
        }
        100% {
            visibility: visible;
            right: ${SPEED_MARKETS_WIDGET_DEFAULT_RIGHT + NAV_MENU_WIDTH}px;
        }
    }
    @keyframes move-right {
        0% {
            visibility: visible;
            right: ${SPEED_MARKETS_WIDGET_DEFAULT_RIGHT + NAV_MENU_WIDTH}px;
        }
        100% {
            visibility: none;
            right: ${SPEED_MARKETS_WIDGET_DEFAULT_RIGHT}px;
        }
    }
`;

export default DappLayout;
