import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FlexDivColumnCentered } from 'styles/common';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import useFavoriteTeamDataQuery from 'queries/favoriteTeam/useFavoriteTeamDataQuery';
import { ReactComponent as SadFace } from 'assets/images/favorite-team/sad-face.svg';
import { ReactComponent as HappyFace } from 'assets/images/favorite-team/happy-face.svg';
import { ReactComponent as SymbolsBackground } from 'assets/images/favorite-team/symbols-background.svg';
import { ReactComponent as ArrowRight } from 'assets/images/favorite-team/arrow-right.svg';
import { ReactComponent as FirstRectangle } from 'assets/images/favorite-team/first-rectangle.svg';
import { ReactComponent as SecondRectangle } from 'assets/images/favorite-team/second-rectangle.svg';
import { setTheme } from 'redux/modules/ui';
import { Theme } from 'constants/ui';
import Loader from 'components/Loader';

const MintWorldCupNFT: React.FC = () => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const dispatch = useDispatch();

    const favoriteTeamDataQuery = useFavoriteTeamDataQuery(walletAddress, networkId);

    const favoriteTeamData =
        favoriteTeamDataQuery.isSuccess && favoriteTeamDataQuery.data ? favoriteTeamDataQuery.data : null;

    useEffect(() => {
        dispatch(setTheme(Theme.WORLDCUP));
    }, []);

    return (
        <>
            {favoriteTeamDataQuery.isLoading ? (
                <Loader />
            ) : (
                <Container>
                    <EligibilityContainer>
                        <FirstRectangle />
                        <EligibilityText>
                            {favoriteTeamData?.isEligible
                                ? t('mint-world-cup-nft.eligible-text')
                                : t('mint-world-cup-nft.not-eligible-text')}
                            {favoriteTeamData?.isEligible ? <HappyFace /> : <SadFace />}
                        </EligibilityText>
                    </EligibilityContainer>
                    {!favoriteTeamData?.isEligible && (
                        <>
                            <InfoContainer>
                                <SecondRectangle />
                                <InfoContent>
                                    <InfoText>{t('mint-world-cup-nft.stake-10-thales')}</InfoText>
                                    <ButtonContainer>
                                        <GetThalesButton
                                            onClick={() =>
                                                window.open(
                                                    'https://app.uniswap.org/#/swap?outputCurrency=0x217d47011b23bb961eb6d93ca9945b7501a5bb11&chain=optimism'
                                                )
                                            }
                                        >
                                            {t('mint-world-cup-nft.get-thales')}
                                        </GetThalesButton>
                                        <StyledButton onClick={() => window.open('https://thalesmarket.io/token')}>
                                            {t('mint-world-cup-nft.stake-thales')}
                                        </StyledButton>
                                    </ButtonContainer>
                                </InfoContent>
                            </InfoContainer>
                        </>
                    )}
                    {!favoriteTeamData?.isEligible && (
                        <>
                            <InfoContainer>
                                <SecondRectangle />
                                <InfoContent>
                                    <InfoText>{t('mint-world-cup-nft.second-option')}</InfoText>
                                    <ListItemContainer>
                                        <ArrowRight />
                                        <ListItem>Follow</ListItem>
                                    </ListItemContainer>
                                    <ListItemContainer>
                                        <ArrowRight />
                                        <ListItem>Retweet</ListItem>
                                    </ListItemContainer>
                                    <ListItemContainer>
                                        <ArrowRight />
                                        <ListItem>
                                            Tag 3 Friends, share your ETH address, and tell us which country you are
                                            cheering for!
                                        </ListItem>
                                    </ListItemContainer>
                                    <GoToTwitterContainer>
                                        <StyledButton
                                            onClick={() => window.open('https://twitter.com/OvertimeMarkets')}
                                        >
                                            {t('mint-world-cup-nft.go-to-twitter')}
                                        </StyledButton>
                                    </GoToTwitterContainer>
                                </InfoContent>
                            </InfoContainer>
                        </>
                    )}
                    {favoriteTeamData?.isEligible && (
                        <>
                            <InfoContainer>
                                <SecondRectangle />
                                <InfoContent>
                                    <InfoText>{t('mint-world-cup-nft.minting-is-free')}</InfoText>
                                    <IncentivesTitle>{t('mint-world-cup-nft.incentives')}:</IncentivesTitle>
                                    <ListItemContainer>
                                        <ArrowRight />
                                        <ListItem>{t('mint-world-cup-nft.free-entry')}</ListItem>
                                    </ListItemContainer>
                                    <GoToTwitterContainer>
                                        <StyledButton
                                            onClick={() => window.open('https://twitter.com/OvertimeMarkets')}
                                        >
                                            {t('mint-world-cup-nft.choose-nft')}
                                        </StyledButton>
                                    </GoToTwitterContainer>
                                </InfoContent>
                            </InfoContainer>
                        </>
                    )}
                    <SymbolsContainer>
                        <SymbolsBackground />
                    </SymbolsContainer>
                </Container>
            )}
        </>
    );
};

const Container = styled.div`
    margin: 80px 0;
    width: 700px;
`;

const EligibilityContainer = styled(FlexDivColumnCentered)`
    align-items: center;
    height: 150px;
    width: 700px;
    border-radius: 4px;
    position: relative;
`;

const EligibilityText = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    font-style: normal;
    font-weight: 700;
    font-size: 22px;
    line-height: 150%;
    letter-spacing: 0.025em;
    color: #04cfb6;
    position: absolute;
`;

const InfoContainer = styled.div`
    position: relative;
    width: 700px;
    height: 300px;
    border-radius: 4px;
`;

const InfoContent = styled.div`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    padding: 50px;
    justify-content: space-around;
`;

const InfoText = styled.div`
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 150%;
    letter-spacing: 0.025em;
    color: #ffffff;
    margin-bottom: 10px;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 50px;
`;

const GoToTwitterContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: 30px;
`;

const GetThalesButton = styled.button`
    background: ${(props) => props.theme.button.background.secondary};
    border: 2px solid ${(props) => props.theme.button.borderColor.secondary};
    color: ${(props) => props.theme.button.textColor.quaternary};
    border-radius: 3.5px;
    padding: 8px 40px;
    font-weight: 600;
    font-size: 16px;
    line-height: 14px;
    cursor: pointer;
`;

const StyledButton = styled.button`
    padding: 8px 40px;
    font-weight: 600;
    font-size: 16px;
    line-height: 14px;
    background: #04cfb6;
    border-radius: 3.5px;
    color: #8e2443;
    border: transparent;
    cursor: pointer;
`;

const SymbolsContainer = styled.div`
    position: absolute;
    right: 0;
    top: 0;
    transform: translateY(30%);
`;

const ListItemContainer = styled.div`
    display: flex;
    margin-top: 10px;
    align-items: center;
`;

const ListItem = styled.span`
    margin-left: 10px;
`;

const IncentivesTitle = styled.span`
    font-weight: 700;
    font-size: 17px;
    line-height: 150%;
    letter-spacing: 0.025em;
    color: #04cfb6;
`;

export default MintWorldCupNFT;
