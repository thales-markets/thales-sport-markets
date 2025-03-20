import SPAAnchor from 'components/SPAAnchor';
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

const ProfileDropdown: React.FC = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const { address } = useAccount();
    const smartAddres = useBiconomy();
    const { disconnect } = useDisconnect();

    const handleCopy = (address: string) => {
        const id = toast.loading(t('deposit.copying-address'), { autoClose: 1000 });
        try {
            navigator.clipboard.writeText(address);
            toast.update(id, { ...getInfoToastOptions(t('deposit.copied')), autoClose: 2000 });
        } catch (e) {
            toast.update(id, getErrorToastOptions('Error'));
        }
    };

    return (
        <Dropdown>
            <SPAAnchor style={{ display: 'flex' }} href={buildHref(ROUTES.Profile)}>
                <Wrapper>
                    <i className="icon icon--logo" /> <Text>Account</Text>
                </Wrapper>
            </SPAAnchor>

            <Container>
                <Wrapper>
                    <WalletIcon className="icon icon--wallet-connected" />{' '}
                    <Text>{isBiconomy ? 'Overtime Account' : 'EOA Address'}</Text>
                </Wrapper>

                <Wrapper onClick={handleCopy.bind(this, isBiconomy ? smartAddres : (address as any))}>
                    <Text>{truncateAddress(isBiconomy ? smartAddres : (address as any), 6, 4)}</Text>{' '}
                    <CopyIcon className="icon icon--copy" />
                </Wrapper>
            </Container>

            <Separator>
                <SwitchIcon
                    onClick={() => {
                        if (isBiconomy) {
                            dispatch(setIsBiconomy(false));
                            localStore.set(LOCAL_STORAGE_KEYS.USE_BICONOMY, false);
                        } else {
                            dispatch(setIsBiconomy(true));
                            localStore.set(LOCAL_STORAGE_KEYS.USE_BICONOMY, true);
                        }
                    }}
                    className="icon icon--exchange"
                />
            </Separator>
            <Container disabled>
                <Wrapper>
                    <WalletIcon className="icon icon--wallet-connected" />{' '}
                    <Text>{!isBiconomy ? 'Overtime Account' : 'EOA Address'}</Text>
                </Wrapper>

                <Wrapper onClick={handleCopy.bind(this, isBiconomy ? (address as any) : smartAddres)}>
                    <Text>{truncateAddress(isBiconomy ? (address as any) : smartAddres, 6, 4)}</Text>{' '}
                    <CopyIcon className="icon icon--copy" />
                </Wrapper>
            </Container>

            <Separator />
            <LogOutWrapper
                onClick={() => {
                    disconnect();
                }}
            >
                <WalletIcon className="icon icon--wallet-disconnected" />
                <Text>Log out</Text>
            </LogOutWrapper>
        </Dropdown>
    );
};

const Dropdown = styled.div`
    cursor: default;
    z-index: 1000;
    position: absolute;
    top: 32px;
    left: -10px;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    background: ${(props) => props.theme.background.tertiary};
    width: 215px;
    padding: 10px;
    justify-content: center;
    align-items: flex-start;
    gap: 10px;
    font-weight: 400;
`;

const CopyIcon = styled.i`
    cursor: pointer;
    text-transform: lowercase;
`;

const WalletIcon = styled.i`
    font-size: 18px;
    width: 20px;
`;

const Text = styled.span`
    position: relative;
    font-weight: 600;
    font-size: 12px;
    line-height: 13px;

    color: ${(props) => props.theme.button.textColor.primary};
    text-align: left;
`;

const Wrapper = styled.div`
    display: flex;
    justify-content: start;
    align-items: center;
    gap: 2px;
    width: 100%;
`;

const Container = styled.div<{ disabled?: boolean }>`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    opacity: ${(props) => (props.disabled ? 0.3 : 1)};
`;

const Separator = styled.p`
    position: relative;
    height: 2px;
    width: 100%;
    margin: 4px 0;
    background: ${(props) => props.theme.background.secondary};
    &:last-of-type {
        margin: 0;
    }
`;

const SwitchIcon = styled.i`
    position: absolute;
    top: -11px;
    left: calc(50% - 12px);
    font-size: 24px;
    font-weight: 600;
    cursor: pointer;
    transform: rotate(90deg);
    background: ${(props) => props.theme.background.tertiary};
`;

const LogOutWrapper = styled(Wrapper)`
    cursor: pointer;
`;

export default ProfileDropdown;
