import axios from 'axios';
import Loader from 'components/Loader';
import MetaData from 'components/MetaData';
import { generalConfig } from 'config/general';
import { Theme } from 'enums/ui';
import useWidgetBotScript from 'hooks/useWidgetBotScript';
import queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getIsAppReady } from 'redux/modules/app';
import { setTheme } from 'redux/modules/ui';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import { isAndroid, isMetamask } from 'thales-utils';
import { isMobile } from 'utils/device';
import { setReferralId } from 'utils/referral';
import BannerV2 from '../../components/BannerV2';
import V2Modal from '../../components/V2Modal';
import DappFooter from './DappFooter';
import DappHeader from './DappHeader';

const DappLayout: React.FC = ({ children }) => {
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
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

    useWidgetBotScript(preventDiscordWidgetLoad);

    return (
        <>
            {isAppReady ? (
                <Background>
                    <BannerV2 />
                    {/* <Banner /> */}
                    <Wrapper>
                        <MetaData />
                        <DappHeader />
                        {children}
                        <DappFooter />
                    </Wrapper>
                    <ToastContainer theme={'colored'} />
                    <V2Modal />
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
    padding: 7px 0 20px 0;
    max-width: 1350px;
    min-height: 100vh;
    justify-content: space-between;
    @media (max-width: 1260px) {
        padding: 10px 20px;
    }
    @media (max-width: 767px) {
        padding: 0px 10px;
    }
`;

export default DappLayout;
