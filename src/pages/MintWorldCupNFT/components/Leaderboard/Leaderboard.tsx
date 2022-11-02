import React from 'react';
import styled from 'styled-components';
// import { useTranslation } from 'react-i18next';
// import { ReactComponent as Rectangle } from 'assets/images/favorite-team/group-rectangle.svg';
import { ReactComponent as ArrowRight } from 'assets/images/favorite-team/arrow-right.svg';
import { countries } from 'pages/MintWorldCupNFT/countries';
import { InfoContainer, InfoText } from 'pages/MintWorldCupNFT/styled-components';
import { t } from 'i18next';

type LeaderboardProps = {
    favoriteTeamNumber: number | undefined;
};

const Leaderboard: React.FC<LeaderboardProps> = ({ favoriteTeamNumber }) => {
    // const { t } = useTranslation();
    const favoriteTeam = favoriteTeamNumber ? countries[favoriteTeamNumber - 1] : null;
    console.log(favoriteTeam);
    return (
        <>
            <InfoContainer>
                <InfoContent>
                    <InfoText>{t('mint-world-cup-nft.leaderboard.reward-calculations')}</InfoText>
                    <ListItemContainer>
                        <ArrowRight />
                        <ListItem>
                            <span>{t('mint-world-cup-nft.leaderboard.home-country-multiplier')}</span>{' '}
                            {t('mint-world-cup-nft.leaderboard.home-country-multiplier-text')}
                        </ListItem>
                    </ListItemContainer>
                    <ListItemContainer>
                        <ArrowRight />
                        <ListItem>
                            <span>{t('mint-world-cup-nft.leaderboard.parlay-boost')}</span>{' '}
                            {t('mint-world-cup-nft.leaderboard.parlay-boost-text')}
                        </ListItem>
                    </ListItemContainer>
                    <ListItemContainer style={{ marginTop: '5px' }}>
                        <ListItem>
                            <ListItemContainer>
                                <ArrowRight />
                                <ListItem>{t('mint-world-cup-nft.leaderboard.two-game-parlay')}</ListItem>
                            </ListItemContainer>
                            <ListItemContainer>
                                <ArrowRight />
                                <ListItem>{t('mint-world-cup-nft.leaderboard.three-game-parlay')}</ListItem>
                            </ListItemContainer>
                            <ListItemContainer>
                                <ArrowRight />
                                <ListItem>{t('mint-world-cup-nft.leaderboard.four-game-parlay')}</ListItem>
                            </ListItemContainer>
                        </ListItem>
                    </ListItemContainer>
                    <ListItemContainer>
                        <ArrowRight />
                        <ListItem>
                            <span>{t('mint-world-cup-nft.leaderboard.underdog-multiplier')}</span>{' '}
                            {t('mint-world-cup-nft.leaderboard.underdog-multiplier-text')}
                        </ListItem>
                    </ListItemContainer>
                </InfoContent>
                {/* {favoriteTeam && (
                    <TeamContainer>
                        <TeamImage
                            src={`https://thales-protocol.s3.eu-north-1.amazonaws.com/zebro_${favoriteTeam
                                .toLocaleLowerCase()
                                .split(' ')
                                .join('_')}.png`}
                        />
                        <TeamNameWrapper>
                            <TeamName>{favoriteTeam}</TeamName>
                        </TeamNameWrapper>
                    </TeamContainer>
                )} */}
            </InfoContainer>
        </>
    );
};

const InfoContent = styled.div`
    display: flex;
    flex-direction: column;
    padding: 0 40px;
    justify-content: space-around;
`;

const ListItemContainer = styled.div`
    display: flex;
    margin-top: 15px;
    align-items: center;
    line-height: 20px;
`;

const ListItem = styled.span`
    margin-left: 10px;
    width: 90%;
    & > div {
        margin-left: 6%;
        margin-top: 2px;
    }
    & > span {
        font-weight: bold;
    }
`;
// const TeamContainer = styled.div`
//     position: absolute;
//     top: 50%;
//     transform: translateY(-55%);
//     left: 8%;
//     width: 18%;
//     border-radius: 50%;
//     display: flex;
//     flex-direction: column;
//     border: 4px solid #6d152e;
// `;

// const TeamImage = styled.img`
//     width: 100%;
//     border-radius: 50%;
// `;

// const TeamNameWrapper = styled.div`
//     position: relative;
// `;

// const TeamName = styled.span`
//     position: absolute;
//     left: 50%;
//     transform: translateX(-50%);
//     bottom: -22px;
//     text-align: center;
//     width: 100%;
//     color: white;
//     font-weight: bold;
//     font-size: 18px;
// `;

export default Leaderboard;
