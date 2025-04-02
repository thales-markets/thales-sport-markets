import SPAAnchor from 'components/SPAAnchor';
import Toggle from 'components/Toggle';
import { getErrorToastOptions, getInfoToastOptions } from 'config/toast';
import ROUTES from 'constants/routes';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsBiconomy, setIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { localStore, truncateAddress } from 'thales-utils';
import { RootState } from 'types/redux';
import { buildHref } from 'utils/routes';
import useBiconomy from 'utils/useBiconomy';
import { useAccount, useDisconnect } from 'wagmi';

type ProfileDropdownProps = {
    setShowDropdown: React.Dispatch<React.SetStateAction<boolean>>;
};

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ setShowDropdown }) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const { address } = useAccount();
    const smartAddress = useBiconomy();
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

    return (
        <Dropdown>
            <Wrapper>
                <Text>{t('profile.dropdown.account')}</Text>

                <Toggle
                    height="24px"
                    active={!isBiconomy}
                    handleClick={() => {
                        if (isBiconomy) {
                            dispatch(setIsBiconomy(false));
                            localStore.set(LOCAL_STORAGE_KEYS.USE_BICONOMY, false);
                        } else {
                            dispatch(setIsBiconomy(true));
                            localStore.set(LOCAL_STORAGE_KEYS.USE_BICONOMY, true);
                        }
                    }}
                />
                <Text>{t('profile.dropdown.eoa')}</Text>
            </Wrapper>
            <Separator />
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

            <SPAAnchor style={{ display: 'flex' }} href={buildHref(ROUTES.Profile)}>
                <Container clickable onClick={setShowDropdown.bind(this, false)}>
                    <CopyIcon className="icon icon--logo" /> <Text>{t('profile.dropdown.profile')}</Text>
                </Container>
            </SPAAnchor>
            <Container
                clickable
                onClick={() => {
                    disconnect();
                    setShowDropdown(false);
                }}
            >
                <WalletIcon className="icon icon--wallet-disconnected" />
                <Text>{t('profile.dropdown.logout')}</Text>
            </Container>
        </Dropdown>
    );
};

const Dropdown = styled.div`
    cursor: default;
    z-index: 1000;
    position: absolute;
    top: 32px;
    left: 0;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    background-color: ${(props) => props.theme.background.secondary};
    padding: 16px 26px;
    justify-content: center;
    align-items: flex-start;
    gap: 10px;
    font-weight: 400;
    @media (max-width: 767px) {
        border: 1px solid;
    }

    @media (max-width: 420px) {
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

const Text = styled.span<{ active?: boolean }>`
    position: relative;
    font-weight: 600;
    font-size: 12px;
    line-height: 13px;
    white-space: pre;
    text-align: left;
    color: ${(props) => (props.active ? props.theme.textColor.quaternary : props.theme.textColor.primary)};
`;

const Wrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    width: 100%;
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

export default ProfileDropdown;
