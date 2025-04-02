import Button from 'components/Button';
import Modal from 'components/Modal';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import useLocalStorage from 'hooks/useLocalStorage';
import { t } from 'i18next';
import { useCallback } from 'react';
import { Trans } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { getIsBiconomy, setWalletConnectModalVisibility } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { FreeBet } from 'types/freeBet';
import { RootState } from 'types/redux';
import { getCollateralByAddress } from 'utils/collaterals';
import { claimFreeBet } from 'utils/freeBet';
import useBiconomy from 'utils/useBiconomy';
import { useAccount, useChainId } from 'wagmi';

type ClaimFreeBetModalProps = {
    freeBet: FreeBet & { id: string };
    onClose: () => void;
};

const ClaimFreeBetModal: React.FC<ClaimFreeBetModalProps> = ({ freeBet, onClose }) => {
    const theme = useTheme();
    const networkId = useChainId();
    const dispatch = useDispatch();
    const history = useHistory();

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const [, setFreeBet] = useLocalStorage<any | undefined>(LOCAL_STORAGE_KEYS.FREE_BET_ID, undefined);

    const { address } = useAccount();

    const smartAddres = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddres : address) || '';

    const onButtonClick = useCallback(async () => {
        if (freeBet.claimSuccess) {
            onClose();
        } else if (walletAddress) {
            await claimFreeBet(walletAddress, freeBet.id, networkId, setFreeBet, history);
        } else {
            dispatch(
                setWalletConnectModalVisibility({
                    visibility: true,
                })
            );
        }
    }, [walletAddress, dispatch, freeBet.id, freeBet.claimSuccess, networkId, setFreeBet, history, onClose]);

    return (
        <Modal
            customStyle={{
                overlay: {
                    zIndex: 31,
                },
            }}
            containerStyle={{
                background: theme.background.secondary,
                border: 'none',
            }}
            hideHeader
            title=""
            onClose={onClose}
        >
            <Container>
                <FlexDivRow>
                    <Title>
                        <Trans
                            i18nKey="free-bet.claim-modal.title"
                            components={{
                                icon: <OvertimeIcon className="icon icon--overtime" />,
                            }}
                        />
                    </Title>
                    <FlexDivRow>{<CloseIcon onClick={onClose} />}</FlexDivRow>
                </FlexDivRow>
                {!walletAddress ? (
                    <Message>
                        <Trans
                            i18nKey="free-bet.claim-modal.gifted-free-bet"
                            components={{
                                span: <span />,
                            }}
                            values={{
                                amount: `${freeBet.betAmount} ${getCollateralByAddress(freeBet.collateral, networkId)}`,
                            }}
                        />
                    </Message>
                ) : !freeBet.claimSuccess ? (
                    <Message>
                        <Trans
                            i18nKey="free-bet.claim-modal.claim-free-bet"
                            components={{
                                span: <span />,
                            }}
                            values={{
                                amount: `${freeBet.betAmount} $${getCollateralByAddress(
                                    freeBet.collateral,
                                    networkId
                                )}`,
                            }}
                        />
                    </Message>
                ) : freeBet.claimAddress.toLowerCase() === walletAddress.toLowerCase() ? (
                    <Message>
                        <Trans
                            i18nKey="free-bet.claim-modal.claimed-free-bet"
                            components={{
                                span: <span />,
                            }}
                            values={{
                                amount: `${freeBet.betAmount} $${getCollateralByAddress(
                                    freeBet.collateral,
                                    networkId
                                )}`,
                            }}
                        />
                    </Message>
                ) : (
                    <Message>{t('free-bet.claim-modal.already-claimed-free-bet')}</Message>
                )}
                {!walletAddress && <Explainer>{t('free-bet.claim-modal.sign-in')}</Explainer>}
                {!!walletAddress && (
                    <Explainer>
                        <Trans
                            i18nKey="free-bet.claim-modal.explainer"
                            components={{
                                docsLink: (
                                    <DocsLink
                                        href="https://docs.overtime.io/free-bet"
                                        target="_blank"
                                        rel="noreferrer"
                                    />
                                ),
                            }}
                        />
                    </Explainer>
                )}
                <Button
                    onClick={onButtonClick}
                    margin="20px 0 0 0"
                    width="100%"
                    height="44px"
                    fontSize="16px"
                    backgroundColor={theme.background.quaternary}
                    borderRadius="8px"
                    borderColor={theme.borderColor.quaternary}
                    textColor={theme.textColor.tertiary}
                >
                    {!walletAddress ? (
                        t('free-bet.claim-modal.sign-in-button')
                    ) : !freeBet.claimSuccess ? (
                        <>
                            {t('free-bet.claim-modal.claim-button')} <HandsIcon className="icon icon--hands-coins" />
                        </>
                    ) : (
                        t('free-bet.claim-modal.lets-bet-button')
                    )}
                </Button>
            </Container>
        </Modal>
    );
};

const Container = styled(FlexDivColumnCentered)`
    height: 100%;
    align-items: center;
    min-width: 400px;
    @media (max-width: 575px) {
        min-width: 100px;
    }
`;

const Title = styled.h1`
    margin-top: 10px;
    font-size: 25px;
    font-weight: 500;
    color: ${(props) => props.theme.textColor.primary};
    width: 100%;
    text-align: center;
    text-transform: uppercase;
`;

const Message = styled.div`
    font-size: 24px;
    font-weight: 600;
    line-height: 24px;
    margin-top: 50px;
    color: ${({ theme }) => theme.textColor.primary};
    text-align: center;
    span {
        color: ${({ theme }) => theme.textColor.quaternary};
    }
    @media (max-width: 575px) {
        font-size: 18px;
    }
`;

const CloseIcon = styled.i.attrs({ className: 'icon icon--close' })`
    color: ${(props) => props.theme.textColor.secondary};
    font-size: 14px;
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
    text-transform: none;
`;

const HandsIcon = styled.i`
    margin-left: 7px;
    margin-bottom: 5px;
    font-weight: 500;
    font-size: 22px;
    color: ${(props) => props.theme.textColor.tertiary};
`;

const OvertimeIcon = styled.i`
    font-size: 130px;
    font-weight: 400;
    line-height: 28px;
    margin-top: -4px;
`;

const Explainer = styled.div`
    width: 100%;
    border-radius: 12px;
    font-size: 14px;
    line-height: 16px;
    letter-spacing: 0.025em;
    text-align: center;
    margin-top: 10px;
    margin-bottom: 30px;
    color: ${(props) => props.theme.textColor.secondary};
    font-weight: 600;
    a {
        color: ${(props) => props.theme.textColor.quaternary};
    }
`;

const DocsLink = styled.a`
    color: ${(props) => props.theme.link.textColor.primary};
    &:hover {
        text-decoration: underline;
    }
`;

export default ClaimFreeBetModal;
