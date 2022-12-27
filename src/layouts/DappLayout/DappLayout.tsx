import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { getNetworkId } from 'redux/modules/wallet';
import UnsupportedNetwork from 'components/UnsupportedNetwork';
import { isNetworkSupported } from 'utils/network';
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

const DappLayout: React.FC = ({ children }) => {
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const { trackPageView } = useMatomo();
    const dispatch = useDispatch();
    const location = useLocation();
    const queryParams: { referralId?: string } = queryString.parse(location.search);

    useEffect(() => {
        if (queryParams.referralId) {
            setReferralId(queryParams.referralId);
        }
    }, [queryParams.referralId]);

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

        trackPageView({ customDimensions });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [networkId, i18n.language]);

    useEffect(() => {
        if (location.pathname !== ROUTES.MintWorldCupNFT) {
            dispatch(setTheme(Theme.DARK));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    return (
        <>
            {isAppReady ? (
                // Exclude Wizard page because of Bridge functionality
                networkId && !isNetworkSupported(networkId) && location.pathname !== ROUTES.Wizard ? (
                    <UnsupportedNetwork />
                ) : (
                    <Background>
                        <Wrapper>
                            <DappHeader />
                            {children}
                            <DappFooter />
                        </Wrapper>
                        <ToastContainer theme={'colored'} />
                    </Background>
                )
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
    padding: 40px 0px;
    max-width: 1350px;
    min-height: 100vh;
    justify-content: space-between;
    @media (max-width: 1260px) {
        padding: 40px 20px;
    }
    @media (max-width: 767px) {
        padding: 40px 10px;
    }
`;

export default DappLayout;
