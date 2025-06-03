import FundModal from 'components/FundOvertimeAccountModal';
import NetworkSwitcher from 'components/NetworkSwitcher';
import OutsideClickHandler from 'components/OutsideClick';
import { getErrorToastOptions, getInfoToastOptions } from 'config/toast';
import { ScreenSizeBreakpoint } from 'enums/ui';
import ProfileItem from 'layouts/DappLayout/DappHeader/components/ProfileItem';
import ProfileDropdown from 'layouts/DappLayout/DappHeader/components/ProfileItem/components/ProfileDropdown';
import WithdrawModal from 'pages/Profile/components/WithdrawModal';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { setPaymentSelectedCollateralIndex } from 'redux/modules/ticket';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { truncateAddress } from 'thales-utils';
import { RootState } from 'types/redux';
import { getDefaultCollateralIndexForNetworkId } from 'utils/network';
import useBiconomy from 'utils/smartAccount/hooks/useBiconomy';
import { useAccount, useChainId } from 'wagmi';

const WalletInfo: React.FC = ({}) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const theme = useTheme();
    const networkId = useChainId();
    const { address, isConnected } = useAccount();
    const { smartAddress } = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddress : address) || '';

    const [isFreeBetInitialized, setIsFreeBetInitialized] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const [showFundModal, setShowFundModal] = useState<boolean>(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);

    // Refresh free bet on wallet and network change
    useEffect(() => {
        setIsFreeBetInitialized(false);
    }, [walletAddress, networkId]);

    // Initialize default collateral from LS
    useEffect(() => {
        if (!isFreeBetInitialized) {
            dispatch(
                setPaymentSelectedCollateralIndex({
                    selectedCollateralIndex: getDefaultCollateralIndexForNetworkId(networkId),
                    networkId,
                })
            );
        }
    }, [dispatch, networkId, isFreeBetInitialized]);

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

    return isConnected ? (
        <Container walletConnected={isConnected}>
            {isConnected && (
                <OutsideClickHandler onOutsideClick={() => setShowDropdown(false)}>
                    <WalletWrapper>
                        <Icon onClick={() => setShowDropdown(!showDropdown)} className="icon icon--arrow-down" />
                        <Divider />
                        <WalletAddressInfo onClick={() => setShowDropdown(!showDropdown)}>
                            <Text>{isBiconomy ? t('profile.dropdown.account') : t('profile.dropdown.eoa')}</Text>
                        </WalletAddressInfo>
                        <Divider />
                        <WalletAddressInfo onClick={() => handleCopy(walletAddress)}>
                            <ProfileItem color={theme.textColor.secondary} />
                        </WalletAddressInfo>

                        <NetworkSwitcher
                            containerStyle={{ minWidth: 52, gap: 3 }}
                            onClick={() => setShowDropdown(false)}
                        />

                        {showDropdown && (
                            <ProfileDropdown
                                setShowDepositModal={setShowFundModal}
                                setShowWithdrawModal={setShowWithdrawModal}
                                setShowDropdown={setShowDropdown}
                            />
                        )}
                    </WalletWrapper>
                </OutsideClickHandler>
            )}
            {showFundModal && <FundModal onClose={() => setShowFundModal(false)} />}
            {showWithdrawModal && <WithdrawModal onClose={() => setShowWithdrawModal(false)} />}
        </Container>
    ) : (
        <>
            <NetworkSwitcher
                containerStyle={{ margin: '0px 0px 0px 5px', minWidth: 52, gap: 3 }}
                onClick={() => setShowDropdown(false)}
            />
        </>
    );
};

const Container = styled(FlexDivCentered)<{ walletConnected?: boolean }>`
    width: 100%;
    width: 302px;
    z-index: 10;
    color: ${(props) => props.theme.textColor.secondary};
    border-radius: 5px;
    position: relative;
    justify-content: space-between;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: 330px;
    }

    @media (max-width: ${ScreenSizeBreakpoint.XXS}px) {
        width: 100%;
    }
`;

const WalletAddressInfo = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;

    @media (max-width: 950px) {
        border-right: none;
        padding-right: 7px;
    }
`;

const WalletWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding-left: 6px;
    border: 1px ${(props) => props.theme.borderColor.primary} solid;
    border-radius: 8px;
    gap: 6px;
`;

const Divider = styled.div`
    height: 22px;
    width: 2px;
    background-color: ${(props) => props.theme.background.secondary};
`;

const Text = styled.span`
    cursor: pointer;
    font-weight: 600;
    font-size: 12px;
    white-space: pre;
    line-height: 12px;
    color: ${(props) => props.theme.textColor.secondary};
`;

const Icon = styled.i`
    cursor: pointer;
    font-weight: 600;
    font-size: 16px;
    padding: 0 2px;
    color: ${(props) => props.theme.textColor.secondary};
`;

export default WalletInfo;
