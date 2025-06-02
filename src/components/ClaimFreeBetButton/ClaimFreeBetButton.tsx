import Button from 'components/Button';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import useLocalStorage from 'hooks/useLocalStorage';
import { t } from 'i18next';
import useGetFreeBetQuery from 'queries/freeBets/useGetFreeBetQuery';
import queryString from 'query-string';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { FreeBet } from 'types/freeBet';
import { RootState } from 'types/redux';
import { getCollateralByAddress } from 'utils/collaterals';
import { claimFreeBet } from 'utils/freeBet';
import useBiconomy from 'utils/smartAccount/hooks/useBiconomy';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

type ClaimFreeBetButtonProps = {
    styles?: React.CSSProperties;
    pulsate?: boolean;
    onClaim?: () => void;
};

const ClaimFreeBetButton: React.FC<ClaimFreeBetButtonProps> = ({ pulsate, onClaim, styles }) => {
    const queryParams: { freeBet?: string } = queryString.parse(location.search);

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const { switchChain } = useSwitchChain();

    const networkId = useChainId();
    const { address } = useAccount();
    const { smartAddress } = useBiconomy();
    const history = useHistory();
    const theme = useTheme();
    const walletAddress = (isBiconomy ? smartAddress : address) || '';

    const [freeBet, setFreeBet] = useLocalStorage<FreeBet | undefined>(LOCAL_STORAGE_KEYS.FREE_BET_ID, undefined);

    const [freeBetId, setFreeBetId] = useState(freeBet?.id || queryParams.freeBet || '');

    const freeBetQuery = useGetFreeBetQuery(freeBetId || queryParams.freeBet || '', networkId, {
        enabled: !!(freeBetId || queryParams.freeBet),
    });

    const freeBetFromServer = useMemo(
        () =>
            freeBetQuery.isSuccess && freeBetQuery.data && freeBetId ? { ...freeBetQuery.data, id: freeBetId } : null,
        [freeBetQuery.data, freeBetQuery.isSuccess, freeBetId]
    );

    const onClaimFreeBet = useCallback(async () => {
        await claimFreeBet(walletAddress, freeBetId, networkId, setFreeBet, history, switchChain);
        onClaim?.();
    }, [walletAddress, freeBetId, networkId, setFreeBet, history, switchChain, onClaim]);

    useEffect(() => {
        if (queryParams.freeBet) {
            setFreeBetId(queryParams.freeBet as string);
        }
    }, [freeBet, queryParams.freeBet]);

    const claimFreeBetButtonVisible =
        !!freeBetFromServer &&
        !freeBetFromServer?.claimSuccess &&
        (!freeBetFromServer.claimAddress ||
            freeBetFromServer.claimAddress.toLowerCase() === walletAddress.toLowerCase());

    return (
        <>
            {claimFreeBetButtonVisible && (
                <ClaimBetButton
                    onClick={onClaimFreeBet}
                    backgroundColor={theme.overdrop.borderColor.tertiary}
                    borderColor={theme.overdrop.borderColor.tertiary}
                    textColor={theme.button.textColor.primary}
                    height="42px"
                    fontSize="16px"
                    fontWeight="700"
                    borderRadius="8px"
                    className={pulsate ? 'pulse' : ''}
                    margin="10px 0 0 0 "
                    additionalStyles={{ ...styles }}
                >
                    {t('profile.account-summary.claim-free-bet', {
                        amount: `${freeBetFromServer?.betAmount} $${getCollateralByAddress(
                            freeBetFromServer.collateral,
                            networkId
                        )}`,
                    })}
                    <HandsIcon className="icon icon--hands-coins" />
                </ClaimBetButton>
            )}
        </>
    );
};

const ClaimBetButton = styled(Button)`
    width: 100%;
    font-size: 15px;
    padding: 3px 15px;
    &.pulse {
        animation: pulsing 1.5s ease-in;
        animation-iteration-count: infinite;
        @keyframes pulsing {
            0% {
                box-shadow: 0 0 0 0px rgba(237, 185, 41, 0.6);
            }
            50% {
                box-shadow: 0 0 0 0px rgba(237, 185, 41, 0.4);
            }
            100% {
                box-shadow: 0 0 0 20px rgba(237, 185, 41, 0);
            }
        }
    }
`;

const HandsIcon = styled.i`
    font-weight: 500;
    margin-left: 5px;
    font-size: 22px;
    color: ${(props) => props.theme.textColor.tertiary};
`;

export default ClaimFreeBetButton;
