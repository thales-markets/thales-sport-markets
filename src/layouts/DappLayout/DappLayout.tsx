import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { FlexDivColumn } from 'styles/common';
import DappHeader from './DappHeader';
import Loader from 'components/Loader';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DappFooter from './DappFooter';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import queryString from 'query-string';
import { getReferralId, setReferralId } from 'utils/referral';
import { useLocation } from 'react-router-dom';
import i18n from 'i18n';
import { setTheme } from 'redux/modules/ui';
import { Theme } from 'constants/ui';
import ROUTES from 'constants/routes';
import { generalConfig } from 'config/general';
import axios from 'axios';
import useWidgetBotScript from 'hooks/useWidgetBotScript';
import { isAndroid, isMetamask, isMobile } from 'utils/device';

const DappLayout: React.FC = ({ children }) => {
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state));
    const { trackPageView } = useMatomo();
    const dispatch = useDispatch();
    const location = useLocation();
    const queryParams: { referralId?: string; referrerId?: string } = queryString.parse(location.search);

    const [preventDiscordWidgetLoad, setPreventDiscordWidgetLoad] = useState(true);

    useEffect(() => {
        if (queryParams.referralId) {
            setReferralId(queryParams.referralId);
        }
        const referrerId = queryParams.referrerId;
        if (referrerId) {
            const fetchIdAddress = async () => {
                const response = await axios.get(
                    `${generalConfig.API_URL}/get-refferer-id-address/${encodeURIComponent(referrerId)}`
                );
                if (response.data) {
                    setReferralId(response.data);
                }
            };
            fetchIdAddress();
        }
    }, [queryParams.referralId, queryParams.referrerId]);

    useEffect(() => {
        const customDimensions = [
            {
                id: 1,
                value: networkId ? networkId?.toString() : '',
            },
        ];

        const referralId = getReferralId();
        if (referralId) {
            customDimensions.push({
                id: 2,
                value: referralId,
            });
        }

        const language = i18n.language;

        if (language) {
            customDimensions.push({
                id: 3,
                value: language,
            });
        }

        if (walletAddress) {
            customDimensions.push({
                id: 4,
                value: walletAddress,
            });
        }

        trackPageView({ customDimensions });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [networkId, i18n.language, walletAddress]);

    useEffect(() => {
        if (![ROUTES.MintWorldCupNFT, ROUTES.MarchMadness].includes(location.pathname)) {
            dispatch(setTheme(Theme.DARK));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    useEffect(() => {
        const checkMetamaskBrowser = async () => {
            const isMetamaskBrowser = isMobile() && (await isMetamask());
            // Do not load Discord Widget Bot on Android MM browser due to issue with MM wallet connect
            // issue raised on https://github.com/rainbow-me/rainbowkit/issues/1181
            setPreventDiscordWidgetLoad(isMetamaskBrowser && isAndroid());
        };
        checkMetamaskBrowser();
    }, []);

    useWidgetBotScript(preventDiscordWidgetLoad);

    return (
        <>
            {isAppReady ? (
                <Background>
                    <Wrapper>
                        <DappHeader />
                        {children}
                        <DappFooter />
                    </Wrapper>
                    <ToastContainer theme={'colored'} />
                </Background>
            ) : (
                <Loader />
            )}
        </>
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
    padding: 20px 0px;
    max-width: 1350px;
    min-height: 100vh;
    justify-content: space-between;
    @media (max-width: 1260px) {
        padding: 0px 20px;
    }
    @media (max-width: 767px) {
        padding: 0px 10px;
    }
`;

export default DappLayout;
