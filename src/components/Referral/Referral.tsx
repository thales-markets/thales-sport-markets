import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import ROUTES from 'constants/routes';
// import React, { useEffect, useState } from 'react';
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

const Referral: React.FC = () => {
    const { t } = useTranslation();
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state));
    const location = useLocation();

    const referralClickHandler = () => {
        if (!walletAddress) {
            return;
        }

        const referralPath = matchPath(location.pathname, ROUTES.Markets.Market)
            ? location.pathname
            : ROUTES.Markets.Home;
        const referralLink = `${window.location.origin}${buildReferralLink(referralPath, walletAddress)}`;

        navigator.clipboard.writeText(referralLink);
        toast(t('common.referral.link-copied'), { type: 'success' });
    };

    const getButtonComponent = () => (
        <TooltipButton
            type="primary"
            onClick={referralClickHandler}
            fontSize={12.5}
            customDisabled={!isWalletConnected}
        >
            {t('common.referral.button.label')}
        </TooltipButton>
    );

    return (
        <Container>
            <Tooltip
                overlay={
                    <>
                        {isWalletConnected
                            ? t('common.referral.button.enabled-tooltip')
                            : t('common.referral.button.disbled-tooltip')}
                    </>
                }
                component={getButtonComponent()}
                iconFontSize={23}
                marginLeft={2}
                top={0}
            />
        </Container>
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

export const TooltipButton = styled(Button)<{ customDisabled?: boolean }>`
    opacity: ${(props) => (props.customDisabled ? '0.4' : '1')};
    &:hover {
        cursor: ${(props) => (props.customDisabled ? 'default' : 'pointer')};
        opacity: ${(props) => (props.customDisabled ? '0.4' : '0.8')};
    }
`;

export default Referral;
