import React from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { ReactComponent as GroupCollapsedRectangle } from 'assets/images/favorite-team/confirmation-rectangle.svg';
import styled from 'styled-components';
import OutsideClickHandler from 'react-outside-click-handler';
import { Team } from 'pages/MintWorldCupNFT/groups';
import { StyledButton } from 'pages/MintWorldCupNFT/styled-components';
import networkConnector from 'utils/networkConnector';
import { useSelector } from 'react-redux';

type ConfirmationDialogProps = {
    closeDialog: VoidFunction;
    selectedTeam: Team | null;
};

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ closeDialog, selectedTeam }) => {
    const { t } = useTranslation();

    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';

    // const [hasAllowance, setAllowance] = useState<boolean>(false);

    // useEffect(() => {
    //     const { favoriteTeamContract, signer } = networkConnector;
    //     if (favoriteTeamContract && signer) {
    //         const favoriteTeamContractWithSigner = favoriteTeamContract.connect(signer);
    //     }
    // }, [walletAddress]);

    const handleMintNFT = async () => {
        const { favoriteTeamContract, signer } = networkConnector;
        if (favoriteTeamContract && signer) {
            const favoriteTeamContractWithSigner = favoriteTeamContract.connect(signer);
            const id = toast.loading(t('market.toast-messsage.transaction-pending'));
            try {
                const tx = await favoriteTeamContractWithSigner.mint(walletAddress, selectedTeam?.number);
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    toast.update(id, getSuccessToastOptions(t('mint-world-cup-nft.success-mint')));
                    closeDialog();
                }
            } catch (e) {
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
            }
        }
    };

    return (
        <Background>
            <OutsideClickHandler onOutsideClick={closeDialog}>
                <DialogContainer>
                    <GroupCollapsedRectangle />
                    <ContentContainer>
                        <AreYouSure>{t('mint-world-cup-nft.are-you-sure')}</AreYouSure>
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
                            <NoButton onClick={closeDialog}>{t('mint-world-cup-nft.no')}</NoButton>
                            <YesButton onClick={handleMintNFT}>{t('mint-world-cup-nft.yes-mint')}</YesButton>
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
    top: 15%;
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
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
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
    padding: 0;
    font-size: 14px;
    font-weight: normal;
`;

export default ConfirmationDialog;
