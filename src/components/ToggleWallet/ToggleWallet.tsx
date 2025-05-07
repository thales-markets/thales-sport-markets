import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { t } from 'i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsBiconomy, setIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { localStore } from 'thales-utils';
import { RootState } from 'types/redux';

const ToggleWallet = () => {
    const dispatch = useDispatch();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    return (
        <ToggleContainer>
            <ToggleWrapper
                active={isBiconomy}
                onClick={() => {
                    dispatch(setIsBiconomy(true));
                    localStore.set(LOCAL_STORAGE_KEYS.USE_BICONOMY, true);
                }}
            >
                <Text>{t('profile.dropdown.account')}</Text>
            </ToggleWrapper>
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
    color: ${(props) => (props.active ? props.theme.textColor.senary : props.theme.textColor.secondary)};
    line-height: 14px;
    white-space: pre;
    text-align: left;
`;

const ToggleContainer = styled(Wrapper)`
    padding: 8px;
    background: ${(props) => props.theme.background.primary};
    border-radius: 8px;
`;
const ToggleWrapper = styled.div<{ active?: boolean }>`
    display: flex;
    align-items: center;
    flex: 1;
    justify-content: center;

    background: ${(props) => (!props.active ? '' : props.theme.background.quaternary)};
    ${Text} {
    }
    border-radius: 8px;
    padding: 8px 12px;

    cursor: pointer;
`;

export default ToggleWallet;
