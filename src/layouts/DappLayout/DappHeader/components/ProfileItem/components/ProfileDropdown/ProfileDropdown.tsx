import SPAAnchor from 'components/SPAAnchor';
import ToggleWallet from 'components/ToggleWallet';
import { getErrorToastOptions, getInfoToastOptions } from 'config/toast';
import { USD_SIGN } from 'constants/currency';
import ROUTES from 'constants/routes';
import { ProfileTab, ScreenSizeBreakpoint } from 'enums/ui';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsBiconomy, setWalletConnectModalVisibility } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumnStart } from 'styles/common';
import { formatCurrencyWithSign, truncateAddress } from 'thales-utils';
import { Rates } from 'types/collateral';
import { RootState } from 'types/redux';
import { getCollaterals } from 'utils/collaterals';
import { buildHref } from 'utils/routes';
import smartAccountConnector from 'utils/smartAccount/smartAccountConnector';
import { useAccount, useChainId, useClient, useDisconnect } from 'wagmi';

type ProfileDropdownProps = {
    setShowDropdown: React.Dispatch<React.SetStateAction<boolean>>;
    setShowDepositModal: React.Dispatch<React.SetStateAction<boolean>>;
    setShowWithdrawModal: React.Dispatch<React.SetStateAction<boolean>>;
};

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
    setShowDropdown,
    setShowDepositModal,
    setShowWithdrawModal,
}) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const smartAddress = smartAccountConnector.biconomyAddress;
    const walletAddress = (isBiconomy ? smartAddress : address) || '';

    const { disconnect } = useDisconnect();

    const handleCopy = (address: string) => {
        const id = toast.loading(t('deposit.copying-address'), { autoClose: 1000 });
        try {
            navigator.clipboard.writeText(address);
            toast.update(id, {
                ...getInfoToastOptions(t('deposit.copied') + ': ' + truncateAddress(address, 6, 4)),
                autoClose: 2000,
            });
        } catch (e) {
            toast.update(id, getErrorToastOptions('Error'));
        }
    };

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

    const totalBalanceValue = useMemo(() => {
        let total = 0;
        try {
            if (exchangeRates && multipleCollateralBalances.data) {
                getCollaterals(networkId).forEach((token) => {
                    total += multipleCollateralBalances.data[token] * (exchangeRates[token] ? exchangeRates[token] : 1);
                });
            }

            return total ? formatCurrencyWithSign(USD_SIGN, total, 2) : '$0';
        } catch (e) {
            return '$0';
        }
    }, [exchangeRates, multipleCollateralBalances.data, networkId]);

    return (
        <Dropdown>
            <ToggleWallet />
            <Separator />
            <BalanceWrapper>
                <FlexDivColumnStart gap={6}>
                    <Label>Balance</Label>
                    <BalanceValue>{totalBalanceValue}</BalanceValue>
                </FlexDivColumnStart>
                <FlexDivCentered gap={14}>
                    <Button onClick={() => setShowWithdrawModal(true)}>withdraw</Button>
                    <Button onClick={() => setShowDepositModal(true)}>deposit</Button>
                </FlexDivCentered>
            </BalanceWrapper>
            <Wrapper>
                <Container>
                    <WalletIcon active={isBiconomy} className="icon icon--wallet-connected" />
                    <Text active={isBiconomy}>{t('profile.dropdown.account')}</Text>
                </Container>
                <Container
                    onClick={() => {
                        handleCopy(smartAddress);
                    }}
                >
                    <Address active={isBiconomy}>{truncateAddress(smartAddress, 6, 4)}</Address>
                    <CopyIcon active={isBiconomy} className="icon icon--copy" />
                </Container>
            </Wrapper>

            <Wrapper>
                <Container>
                    <WalletIcon active={!isBiconomy} className="icon icon--wallet-connected" />
                    <Text active={!isBiconomy}>{t('profile.dropdown.eoa')}</Text>
                </Container>
                <Container
                    onClick={() => {
                        handleCopy(address as any);
                    }}
                >
                    <Address active={!isBiconomy}>{truncateAddress(address as any, 6, 4)}</Address>
                    <CopyIcon active={!isBiconomy} className="icon icon--copy" />
                </Container>
            </Wrapper>

            <Separator />

            <SPAAnchor
                style={{ display: 'flex' }}
                href={buildHref(`${ROUTES.Profile}?selected-tab=${ProfileTab.ACCOUNT}`)}
            >
                <Container clickable onClick={() => setShowDropdown(false)}>
                    <CopyIcon className="icon icon--logo" /> <Text>{t('profile.dropdown.profile')}</Text>
                </Container>
            </SPAAnchor>
            <Container
                clickable
                onClick={() => {
                    disconnect();
                    setShowDropdown(false);
                    dispatch(setWalletConnectModalVisibility({ visibility: true }));
                }}
            >
                <LogoutIcon className="icon icon--wallet-disconnected" />
                <LogoutText>{t('profile.dropdown.logout')}</LogoutText>
            </Container>
        </Dropdown>
    );
};

const Dropdown = styled.div`
    cursor: default;
    z-index: 1000;
    position: absolute;
    top: 36px;
    left: 0;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    background-color: ${(props) => props.theme.background.secondary};
    padding: 16px;
    justify-content: center;
    align-items: flex-start;
    gap: 10px;
    font-weight: 400;
    min-width: 302px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        border: 1px solid;
        width: 100%;
    }
`;

const CopyIcon = styled.i<{ active?: boolean }>`
    cursor: pointer;
    text-transform: lowercase;
    color: ${(props) => (props.active ? props.theme.textColor.quaternary : props.theme.textColor.primary)};
`;

const WalletIcon = styled.i<{ active?: boolean }>`
    font-size: 18px;
    width: 20px;
    color: ${(props) => (props.active ? props.theme.textColor.quaternary : props.theme.textColor.primary)};
`;

const LogoutIcon = styled(WalletIcon)`
    color: ${(props) => props.theme.error.textColor.primary} !important;
`;

const Text = styled.span<{ active?: boolean }>`
    position: relative;
    font-weight: 600;
    font-size: 12px;
    line-height: 13px;
    white-space: pre;
    text-align: left;
    color: ${(props) => (props.active ? props.theme.textColor.quaternary : props.theme.textColor.primary)};
`;

const LogoutText = styled(Text)`
    color: ${(props) => props.theme.error.textColor.primary} !important;
`;

const Wrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    width: 100%;
`;

const Label = styled(Text)`
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.secondary};
`;

const BalanceWrapper = styled.div`
    border-radius: 12px;
    background: linear-gradient(90deg, #2a3466 0%, #131b3a 100%);
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
`;

const BalanceValue = styled.span`
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
    font-size: 20px;
`;

const Container = styled.div<{ clickable?: boolean }>`
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};
    &:hover {
        i,
        span {
            color: ${(props) => (props.clickable ? props.theme.textColor.quaternary : '')};
        }
    }
`;

const Separator = styled.p`
    position: relative;
    height: 2px;
    width: 100%;
    background: ${(props) => props.theme.background.senary};
`;

const Address = styled(Text)<{ active: boolean }>`
    cursor: pointer;
    color: ${(props) => (props.active ? props.theme.textColor.quaternary : props.theme.textColor.primary)};
`;

const Button = styled(FlexDivCentered)<{ active?: boolean }>`
    border-radius: 8px;
    width: 112px;
    height: 31px;
    border: 2px ${(props) => props.theme.borderColor.primary} solid;
    color: ${(props) => props.theme.textColor.primary};

    font-size: 12px;
    font-weight: 600;

    text-transform: uppercase;
    cursor: pointer;
    &:hover {
        background-color: ${(props) => props.theme.connectWalletModal.hover};
        color: ${(props) => props.theme.button.textColor.primary};
        border: none;
    }
    white-space: pre;
    padding: 3px 24px;
    @media (max-width: 575px) {
        padding: 3px 12px;
    }
`;
export default ProfileDropdown;
