import Background from 'assets/images/free-bet-logo-bckg.svg?react';
import FreeBetLogo from 'assets/images/free-bet-logo.svg?react';
import Button from 'components/Button';
import Modal from 'components/Modal';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import useLocalStorage from 'hooks/useLocalStorage';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { getIsBiconomy, setWalletConnectModalVisibility } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
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
                    zIndex: 10,
                },
            }}
            containerStyle={{
                background: theme.background.secondary,
                width: '800px',
                height: '450px',
                border: 'none',
            }}
            title={''}
            onClose={onClose}
            hideHeader
        >
            <Container>
                <BackgroundContainer>
                    <Background />
                </BackgroundContainer>
                <ContentContainer>
                    <CloseContainer>{<CloseIcon onClick={onClose} />}</CloseContainer>
                    <FlexDivCentered>
                        <Title>
                            <WelcomeToText>WELCOME TO</WelcomeToText>
                            <FreeBetLogo />
                        </Title>
                    </FlexDivCentered>
                    <MainContainer>
                        {!walletAddress ? (
                            <Message>
                                You have been gifted a{' '}
                                <span>
                                    {freeBet.betAmount} {getCollateralByAddress(freeBet.collateral, networkId)}
                                </span>{' '}
                                free bet.
                            </Message>
                        ) : !freeBet.claimSuccess ? (
                            <Message>
                                Claim a{' '}
                                <span>
                                    {freeBet.betAmount} {getCollateralByAddress(freeBet.collateral, networkId)} Free
                                    Bet!
                                </span>
                            </Message>
                        ) : freeBet.claimAddress.toLowerCase() === walletAddress.toLowerCase() ? (
                            <Message>
                                You just claimed a{' '}
                                <span>
                                    {freeBet.betAmount} {getCollateralByAddress(freeBet.collateral, networkId)} Free
                                    Bet!
                                </span>
                            </Message>
                        ) : (
                            <Message>Bet already claimed!</Message>
                        )}
                        {!walletAddress && <SubMessage>Sign in to Overtime to claim.</SubMessage>}
                    </MainContainer>
                    <BottomContainer>
                        {!!walletAddress && (
                            <Explainer>
                                <div>Guide on how to use your Free Bet:</div>
                                <div>
                                    Free Bet rules:{' '}
                                    <a rel="noreferrer" target="_blank" href="https://docs.overtime.io/free-bet">
                                        docs.overtime.io/free-bet
                                    </a>
                                </div>
                            </Explainer>
                        )}
                        <FlexDiv>
                            <Button
                                onClick={onButtonClick}
                                padding="8px 0"
                                width="100%"
                                backgroundColor={theme.background.quaternary}
                                borderColor={theme.background.quaternary}
                            >
                                {!walletAddress ? (
                                    'Sign in'
                                ) : !freeBet.claimSuccess ? (
                                    <>
                                        Claim free bet <HandsIcon className="icon icon--hands-coins" />
                                    </>
                                ) : (
                                    `Let's bet!`
                                )}
                            </Button>
                        </FlexDiv>
                    </BottomContainer>
                </ContentContainer>
            </Container>
        </Modal>
    );
};

const Container = styled(FlexDivColumnCentered)`
    height: 100%;
    justify-content: space-between;
`;

const BackgroundContainer = styled(FlexDivCentered)`
    z-index: 0;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
`;

const ContentContainer = styled(FlexDivColumnCentered)`
    z-index: 1;
    height: 100%;
    justify-content: space-between;
`;

const CloseContainer = styled(FlexDivRow)`
    position: absolute;
    top: 5px;
    right: 5px;
    width: 100%;
    justify-content: flex-end;
`;

const Title = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 24px;
    color: ${({ theme }) => theme.textColor.primary};
`;

const MainContainer = styled(FlexDivColumnCentered)`
    flex: none;
    align-items: center;
    gap: 25px;
`;

const Message = styled.div`
    font-size: 24px;
    font-weight: 600;
    color: ${({ theme }) => theme.textColor.primary};
    span {
        color: ${({ theme }) => theme.textColor.quaternary};
    }
`;

const SubMessage = styled.div`
    font-size: 16px;
    color: ${({ theme }) => theme.textColor.primary};
`;

const CloseIcon = styled.i.attrs({ className: 'icon icon--close' })`
    color: white;
    font-size: 14px;
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
`;

const HandsIcon = styled.i`
    margin-left: 7px;
    margin-bottom: 5px;
    font-weight: 500;
    font-size: 22px;
    color: ${(props) => props.theme.textColor.tertiary};
`;

const WelcomeToText = styled.span`
    margin-top: 4px;
`;

const BottomContainer = styled(FlexDiv)`
    flex-direction: column;
    gap: 20px;
`;

const Explainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    border: 1px solid ${(props) => props.theme.button.borderColor.senary};
    border-radius: 12px;
    font-weight: 300;
    padding: 16px;
    color: ${(props) => props.theme.textColor.primary};
    a {
        color: ${(props) => props.theme.textColor.quaternary};
    }
`;

export default ClaimFreeBetModal;
