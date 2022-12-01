import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { ReactComponent as ConfirmationRectangle } from 'assets/images/favorite-team/confirmation-rectangle.svg';
import styled from 'styled-components';
import OutsideClickHandler from 'react-outside-click-handler';
import { Team } from 'pages/MintWorldCupNFT/groups';
import { StyledButton } from 'pages/MintWorldCupNFT/styled-components';
import networkConnector from 'utils/networkConnector';
import { useSelector } from 'react-redux';
import { MAX_GAS_LIMIT } from 'constants/network';

type ConfirmationDialogProps = {
    closeDialog: VoidFunction;
    selectedTeam: Team | null;
    setSelectedTab: (tabNumber: number) => void;
};

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ closeDialog, selectedTeam, setSelectedTab }) => {
    const { t } = useTranslation();

    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const [minted, setMinted] = useState(false);
    const [isMinting, setIsMinting] = useState(false);

    const handleMintNFT = async () => {
        const { favoriteTeamContract, signer } = networkConnector;
        setIsMinting(true);
        if (favoriteTeamContract && signer) {
            const favoriteTeamContractWithSigner = favoriteTeamContract.connect(signer);
            const id = toast.loading(t('market.toast-message.transaction-pending'));
            try {
                const tx = await favoriteTeamContractWithSigner.mint(walletAddress, selectedTeam?.number, {
                    gasLimit: MAX_GAS_LIMIT,
                });
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    toast.update(id, getSuccessToastOptions(t('mint-world-cup-nft.success-mint')));
                    setMinted(true);
                    setIsMinting(false);
                }
            } catch (e) {
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                setIsMinting(false);
            }
        }
    };

    return (
        <Background>
            <OutsideClickHandler
                onOutsideClick={
                    minted
                        ? () => {
                              setSelectedTab(0);
                              closeDialog();
                          }
                        : closeDialog
                }
            >
                <DialogContainer>
                    <ConfirmationRectangle />
                    <ContentContainer>
                        <AreYouSure>
                            {minted ? t('mint-world-cup-nft.congrats') : t('mint-world-cup-nft.are-you-sure')}
                        </AreYouSure>
                        <TeamWrapper>
                            <TeamContainer>
                                <TeamImage
                                    src={`https://thales-protocol.s3.eu-north-1.amazonaws.com/zebro_${selectedTeam?.name
                                        .toLocaleLowerCase()
                                        .split(' ')
                                        .join('_')}.png`}
                                />
                                <TeamNameWrapper>
                                    <TeamName>{selectedTeam?.name}</TeamName>
                                </TeamNameWrapper>
                            </TeamContainer>
                        </TeamWrapper>
                        <ButtonsContainer>
                            {!minted && <NoButton onClick={closeDialog}>{t('mint-world-cup-nft.no')}</NoButton>}
                            {!minted && (
                                <YesButton disabled={isMinting} onClick={handleMintNFT}>
                                    {t('mint-world-cup-nft.yes-mint')}
                                </YesButton>
                            )}
                            {minted && (
                                <YesButton
                                    onClick={() => {
                                        setSelectedTab(0);
                                        closeDialog();
                                    }}
                                >
                                    {t('mint-world-cup-nft.go-to-leaderboard')}
                                </YesButton>
                            )}
                        </ButtonsContainer>
                    </ContentContainer>
                </DialogContainer>
            </OutsideClickHandler>
        </Background>
    );
};

const DialogContainer = styled.div`
    position: absolute;
    left: 50%;
    top: 50%;
    width: 400px;
    z-index: 2;
    transform: translate(-50%, -50%);
`;

const ContentContainer = styled.div`
    position: absolute;
    left: 50%;
    top: 17%;
    width: 350px;
    z-index: 2;
    transform: translateX(-50%);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Background = styled.div`
    position: absolute;
    width: 140%;
    top: 0;
    bottom: 0;
    left: -20%;
    backdrop-filter: blur(8px);
    z-index: 1001;
`;

const AreYouSure = styled.div`
    font-style: normal;
    font-weight: 800;
    font-size: 15px;
    line-height: 20px;
    color: #8a1538;
`;

const TeamWrapper = styled.div`
    height: 170px;
`;

const TeamContainer = styled.div`
    margin: auto;
    margin-top: 35px;
    width: 22%;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    border: 4px solid #6d152e;
`;

const TeamImage = styled.img`
    width: 100%;
    border-radius: 50%;
`;

const TeamNameWrapper = styled.div`
    position: relative;
`;

const TeamName = styled.span`
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: -22px;
    text-align: center;
    width: 100%;
    color: #8a1538;
    font-weight: bold;
    font-size: 18px;
`;

const ButtonsContainer = styled.div`
    display: flex;
    justify-content: space-around;
    width: 80%;
`;

const NoButton = styled.button`
    width: 48%;
    border: 2px solid #8a1538;
    color: #8a1538;
    border-radius: 3.6px;
    cursor: pointer;
`;

const YesButton = styled(StyledButton)`
    width: 48%;
    padding: 5px 10px;
    font-size: 14px;
    font-weight: normal;
`;

export default ConfirmationDialog;
