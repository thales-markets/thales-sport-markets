import Tooltip from 'components/Tooltip';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { t } from 'i18next';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    getIsBiconomy,
    getIsSmartAccountDisabled,
    setIsBiconomy,
    setIsSmartAccountDisabled,
} from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { localStore } from 'thales-utils';
import useBiconomy from 'utils/smartAccount/hooks/useBiconomy';

const ToggleWallet = () => {
    const dispatch = useDispatch();
    const isBiconomy = useSelector(getIsBiconomy);
    const isSmartAccountDisabled = useSelector(getIsSmartAccountDisabled);
    const theme = useTheme();
    const { smartAddress } = useBiconomy();

    useEffect(() => {
        const verifiedOvertimeAccounts = new Set(
            JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.VERIFIED_OVERTIME_ACCOUNTS) || '[]')
        );
        const invalidOvertimeAccounts = new Set(
            JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.INVALID_OVERTIME_ACCOUNTS) || '[]')
        );
        if (invalidOvertimeAccounts.has(smartAddress)) {
            dispatch(setIsSmartAccountDisabled(true));
            dispatch(setIsBiconomy(false));
            localStore.set(LOCAL_STORAGE_KEYS.USE_BICONOMY, false);
            return;
        }
        if (verifiedOvertimeAccounts.has(smartAddress)) {
            dispatch(setIsSmartAccountDisabled(false));
            return;
        }
    }, [dispatch, smartAddress]);

    return (
        <ToggleContainer>
            {isSmartAccountDisabled ? (
                <ToggleWrapper disabled={true} active={isBiconomy}>
                    <Text>{t('profile.dropdown.account')}</Text>
                    <Tooltip
                        iconColor={theme.error.textColor.primary}
                        overlay={t('profile.dropdown.smart-account-disabled')}
                        iconFontSize={14}
                        marginLeft={3}
                    />
                </ToggleWrapper>
            ) : (
                <ToggleWrapper
                    active={isBiconomy}
                    onClick={() => {
                        dispatch(setIsBiconomy(true));
                        localStore.set(LOCAL_STORAGE_KEYS.USE_BICONOMY, true);
                    }}
                >
                    <Text>{t('profile.dropdown.account')}</Text>
                </ToggleWrapper>
            )}

            <ToggleWrapper
                active={!isBiconomy}
                onClick={() => {
                    dispatch(setIsBiconomy(false));
                    localStore.set(LOCAL_STORAGE_KEYS.USE_BICONOMY, false);
                }}
            >
                <Text>{t('profile.dropdown.eoa')}</Text>
            </ToggleWrapper>
        </ToggleContainer>
    );
};

const Wrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    width: 100%;
`;

const Text = styled.span<{ active?: boolean }>`
    position: relative;
    font-weight: 600;
    font-size: 12px;

    line-height: 14px;
    white-space: pre;
    text-align: left;
`;

const ToggleContainer = styled(Wrapper)`
    padding: 8px;
    background: ${(props) => props.theme.background.primary};
    border-radius: 8px;
`;
const ToggleWrapper = styled.div<{ active?: boolean; disabled?: boolean }>`
    display: flex;
    align-items: center;
    flex: 1;
    justify-content: center;

    background: ${(props) => (!props.active ? '' : props.theme.background.quaternary)};
    ${Text} {
        color: ${(props) => (props.active ? props.theme.textColor.tertiary : props.theme.textColor.secondary)};
    }
    border-radius: 8px;
    padding: 8px 12px;
    opacity: ${(props) => (props.disabled ? 0.5 : 1)};

    cursor: pointer;
`;

export default ToggleWallet;
