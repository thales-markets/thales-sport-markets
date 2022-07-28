import Button from 'components/Button';
import ROUTES from 'constants/routes';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { matchPath, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getIsWalletConnected, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { buildReferralLink } from 'utils/routes';

const GetUsd: React.FC = () => {
    const { t } = useTranslation();
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state));
    const location = useLocation();

    const referralClickHandler = () => {
        if (!walletAddress) {
            // this should never happen as button is hidden when wallet is not connected
            toast(t('common.referral.link-failed'), { type: 'error' });
            return;
        }

        const referralPath = matchPath(location.pathname, ROUTES.Markets.Market)
            ? location.pathname
            : ROUTES.Markets.Home;
        const referralLink = `${window.location.origin}${buildReferralLink(referralPath, walletAddress)}`;

        navigator.clipboard.writeText(referralLink);
        toast(t('common.referral.link-copied'), { type: 'success' });
    };

    return (
        <>
            {isWalletConnected && (
                <Container>
                    <Button type="primary" onClick={referralClickHandler} fontSize={12.5}>
                        {t('common.referral.button.label')}
                    </Button>
                </Container>
            )}
        </>
    );
};

const Container = styled(FlexDivCentered)`
    position: relative;
    height: 28px;
    button {
        padding: 0 20px;
    }
    @media (max-width: 500px) {
        width: 100%;
        button {
            width: 100%;
        }
    }
`;

export default GetUsd;
