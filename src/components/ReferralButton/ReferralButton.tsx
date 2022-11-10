import Tooltip from 'components/Tooltip';
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
const ReferralButton: React.FC = () => {
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

        const referralLink = `${window.location.origin}${buildReferralLink(
            referralPath,
            window.location.hash,
            window.location.search,
            walletAddress
        )}`;

        navigator.clipboard.writeText(referralLink);
        toast(t('common.referral.link-copied'), { type: 'success' });
    };

    const getButtonComponent = () => (
        <StyledButton onClick={referralClickHandler} customDisabled={!isWalletConnected}>
            {t('common.referral.button.label')}
        </StyledButton>
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
        width: 100%;
    }
`;

const StyledButton = styled.button<{ customDisabled?: boolean }>`
    background: ${(props) => props.theme.button.background.secondary};
    border: 2px solid ${(props) => props.theme.button.borderColor.secondary};
    color: ${(props) => props.theme.button.textColor.quaternary};
    border-radius: 5px;
    padding: 1px 20px 0px 20px;
    font-style: normal;
    font-weight: 400;
    font-size: 12.5px;
    text-align: center;
    outline: none;
    text-transform: none;
    cursor: pointer;
    min-height: 28px;
    width: fit-content;
    white-space: nowrap;
    opacity: ${(props) => (props.customDisabled ? '0.4' : '1')};
    &:hover {
        cursor: ${(props) => (props.customDisabled ? 'default' : 'pointer')};
        opacity: ${(props) => (props.customDisabled ? '0.4' : '0.8')};
    }
`;

export default ReferralButton;
