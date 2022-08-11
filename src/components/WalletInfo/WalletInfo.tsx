import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { FlexDivCentered, FlexDivColumn, FlexDivRowCentered } from 'styles/common';
import { useTranslation } from 'react-i18next';
import { truncateAddress } from 'utils/formatters/string';
import onboardConnector from 'utils/onboardConnector';
import { getIsAppReady } from 'redux/modules/app';
import { PAYMENT_CURRENCY } from 'constants/currency';
import { formatCurrency } from 'utils/formatters/number';
import OutsideClickHandler from 'react-outside-click-handler';
import useSUSDWalletBalance from 'queries/wallet/usesUSDWalletBalance';

const WalletInfo: React.FC = () => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const [showWalletOptions, setShowWalletOptions] = useState<boolean>(false);

    const sUSDBalanceQuery = useSUSDWalletBalance(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });
    const sUSDBalance = useMemo(() => {
        if (sUSDBalanceQuery.data) {
            return formatCurrency(sUSDBalanceQuery?.data, 2);
        }
        return 0;
    }, [sUSDBalanceQuery.isSuccess, sUSDBalanceQuery?.data]);

    return (
        <Container>
            <WalletContainer
                onClick={() => {
                    if (!isWalletConnected) {
                        onboardConnector.connectWallet();
                    } else {
                        setShowWalletOptions(true);
                    }
                }}
            >
                {isWalletConnected ? (
                    <>
                        <Wallet className="wallet-info">
                            <Info>{truncateAddress(walletAddress)}</Info>
                        </Wallet>
                        <Wallet className="wallet-info-hover">
                            <Info>{t('common.wallet.wallet-options')}</Info>
                        </Wallet>
                        <Balance>
                            <Info>{sUSDBalance}</Info>
                            <Currency>{PAYMENT_CURRENCY}</Currency>
                        </Balance>
                    </>
                ) : (
                    <Info>{t('common.wallet.connect-your-wallet')}</Info>
                )}
            </WalletContainer>
            {showWalletOptions && (
                <OutsideClickHandler onOutsideClick={() => setShowWalletOptions(false)}>
                    <WalletOptions>
                        <WalletOptionsHeader>
                            {t('common.wallet.wallet-options')}
                            <CloseIcon onClick={() => setShowWalletOptions(false)} />
                        </WalletOptionsHeader>
                        <WalletOptionsContent>
                            <WalletOption
                                onClick={() => {
                                    onboardConnector.onboard.walletSelect();
                                    setShowWalletOptions(false);
                                }}
                            >
                                {t('common.wallet.switch-wallet')}
                            </WalletOption>
                            <WalletOption
                                onClick={() => {
                                    onboardConnector.disconnectWallet();
                                    setShowWalletOptions(false);
                                }}
                            >
                                {t('common.wallet.disconnect-wallet')}
                            </WalletOption>
                        </WalletOptionsContent>
                    </WalletOptions>
                </OutsideClickHandler>
            )}
        </Container>
    );
};

const Container = styled(FlexDivCentered)`
    position: relative;
    height: 34px;
    justify-content: end;
    min-width: fit-content;
    @media (max-width: 767px) {
        min-width: auto;
    }
`;

const WalletContainer = styled(FlexDivRowCentered)`
    border: 1px solid ${(props) => props.theme.borderColor.tertiary};
    border-radius: 5px;
    height: 28px;
    padding: 0 20px;
    cursor: pointer;
    color: ${(props) => props.theme.textColor.primary};
    background: ${(props) => props.theme.background.secondary};
    .wallet-info-hover {
        display: none;
    }
    :hover {
        background: ${(props) => props.theme.background.tertiary};
        color: ${(props) => props.theme.textColor.primary};
        div {
            border-color: ${(props) => props.theme.borderColor.secondary};
        }
        i {
            :before {
                color: ${(props) => props.theme.button.textColor.primary};
            }
        }
        .wallet-info {
            display: none;
        }
        .wallet-info-hover {
            display: inline;
        }
    }
`;

const Wallet = styled(FlexDivRowCentered)`
    padding-right: 10px;
    width: 95px;
    text-align: center;
`;

const Balance = styled(FlexDivRowCentered)`
    border-left: 1px solid ${(props) => props.theme.borderColor.secondary};
    padding-left: 10px;
`;

const Info = styled.span`
    font-style: normal;
    font-weight: 400;
    font-size: 12.5px;
    line-height: 17px;
`;

const Currency = styled(Info)`
    font-weight: bold;
    margin-left: 4px;
`;

const WalletOptions = styled(FlexDivColumn)`
    position: absolute;
    top: 0;
    right: 0;
    width: 254px;
    height: 84px;
    border-radius: 5px;
    z-index: 100;
    background: ${(props) => props.theme.background.secondary};
    color: ${(props) => props.theme.button.textColor.primary};
    @media (max-width: 767px) {
        right: -127px;
    }
`;

const WalletOptionsHeader = styled(FlexDivCentered)`
    position: relative;
    font-style: normal;
    font-weight: 600;
    font-size: 15px;
    line-height: 17px;
    text-align: center;
    padding: 6px;
    border-bottom: 1px solid ${(props) => props.theme.button.borderColor.primary};
    /* text-transform: ; */
`;

const WalletOptionsContent = styled(FlexDivColumn)``;

const WalletOption = styled(FlexDivCentered)`
    font-style: normal;
    font-weight: 600;
    font-size: 15px;
    line-height: 17px;
    padding: 5px;
    text-align: center;
    cursor: pointer;
    color: ${(props) => props.theme.textColor.primary};
    :hover {
        background: ${(props) => props.theme.background.tertiary};
        :last-child {
            border-radius: 0px 0px 5px 5px;
        }
    }
`;

const CloseIcon = styled.i`
    font-size: 10px;
    cursor: pointer;
    position: absolute;
    top: 6px;
    right: 10px;
    &:before {
        font-family: ExoticIcons !important;
        content: '\\004F';
        color: ${(props) => props.theme.textColor.primary};
    }
`;

export default WalletInfo;
