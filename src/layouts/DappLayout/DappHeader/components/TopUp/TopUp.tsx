import Button from 'components/Button';
import SPAAnchor from 'components/SPAAnchor';
import ROUTES from 'constants/routes';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { Rates } from 'types/collateral';
import { RootState } from 'types/redux';
import { ThemeInterface } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { buildHref } from 'utils/routes';
import { useAccount, useChainId, useClient } from 'wagmi';

const TopUp: React.FC = () => {
    const { t } = useTranslation();

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const walletAddress = (isBiconomy ? biconomyConnector.address : address) || '';

    const [showLowBalanceAlert, setShowLowBalanceAlert] = useState<boolean>(false);
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const theme: ThemeInterface = useTheme();

    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(
        walletAddress,
        { networkId, client },
        {
            enabled: isConnected,
        }
    );

    const exchangeRatesQuery = useExchangeRatesQuery({ networkId, client });

    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    const ethBalanceValue = useMemo(() => {
        let total = undefined;
        try {
            if (exchangeRates && multipleCollateralBalances.data) {
                total = multipleCollateralBalances.data['ETH'] * (exchangeRates['ETH'] ? exchangeRates['ETH'] : 1);
            }

            return total;
        } catch (e) {
            return undefined;
        }
    }, [exchangeRates, multipleCollateralBalances.data]);

    useEffect(() => {
        if (isBiconomy && ethBalanceValue !== undefined && Number(ethBalanceValue) < 2) {
            setShowLowBalanceAlert(true);
        } else {
            setShowLowBalanceAlert(false);
        }
    }, [ethBalanceValue, isBiconomy]);

    return (
        <>
            {isBiconomy &&
                ethBalanceValue !== undefined &&
                (!isMobile ? (
                    <>
                        {showLowBalanceAlert && (
                            <TopUpButtonContainer>
                                <SPAAnchor
                                    style={{ marginRight: '5px', display: 'flex', alignItems: 'center' }}
                                    href={buildHref(ROUTES.Deposit)}
                                >
                                    <TopUpButton>{t('my-portfolio.top-up-eth')}</TopUpButton>
                                </SPAAnchor>
                            </TopUpButtonContainer>
                        )}
                        {!showLowBalanceAlert && (
                            <SPAAnchor
                                style={{ marginRight: '5px', display: 'flex', alignItems: 'center' }}
                                href={buildHref(ROUTES.Deposit)}
                            >
                                <Button
                                    backgroundColor={theme.button.background.quaternary}
                                    textColor={theme.button.textColor.primary}
                                    borderColor={theme.button.borderColor.secondary}
                                    width="120px"
                                    fontWeight="400"
                                    additionalStyles={{ borderRadius: '15.5px', fontWeight: '600', fontSize: '14px' }}
                                    height="28px"
                                >
                                    {t('my-portfolio.deposit')}
                                </Button>
                            </SPAAnchor>
                        )}
                    </>
                ) : (
                    <>
                        {showLowBalanceAlert && (
                            <SPAAnchor style={{ width: '100%' }} href={buildHref(ROUTES.Deposit)}>
                                <TopUpButton>{t('my-portfolio.top-up-eth')}</TopUpButton>
                            </SPAAnchor>
                        )}
                        {!showLowBalanceAlert && (
                            <SPAAnchor
                                style={{ width: '100%', display: 'flex', alignItems: 'center' }}
                                href={buildHref(ROUTES.Deposit)}
                            >
                                <Button
                                    backgroundColor={theme.button.background.quaternary}
                                    textColor={theme.button.textColor.primary}
                                    borderColor={theme.button.borderColor.secondary}
                                    width="100%"
                                    fontWeight="400"
                                    additionalStyles={{
                                        maxWidth: 400,
                                        borderRadius: '15.5px',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                    }}
                                    height="28px"
                                >
                                    {t('my-portfolio.deposit')}
                                </Button>
                            </SPAAnchor>
                        )}
                    </>
                ))}
        </>
    );
};

const TopUpButtonContainer = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const TopUpButton = styled.button`
    background-color: ${(props) => props.theme.button.background.secondary};
    color: ${(props) => props.theme.error.textColor.primary};
    border: 1px solid ${(props) => props.theme.error.borderColor.primary};
    border-radius: 15px;
    min-width: 120px;
    width: 100%;
    max-width: 400px;
    font-size: 14px;
    font-weight: 600;
    line-height: 14px;
    height: 28px;
    filter: drop-shadow(0px 0px 14px rgba(191, 73, 81, 0.7));
    animation: pulse 2s infinite;
    cursor: pointer;

    @keyframes pulse {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(1.05);
            opacity: 1;
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
`;

export default TopUp;
