import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { truncateAddress } from 'utils/formatters/string';
import { ReactComponent as ArrowRight } from 'assets/images/favorite-team/arrow-right.svg';
import { countries } from 'pages/MintWorldCupNFT/countries';
import { InfoContainer, InfoText } from 'pages/MintWorldCupNFT/styled-components';
import { FlexDivCentered } from 'styles/common';
import Table from 'components/Table';

type LeaderboardProps = {
    favoriteTeamNumber: number | undefined;
};

const Leaderboard: React.FC<LeaderboardProps> = ({ favoriteTeamNumber }) => {
    const { t } = useTranslation();
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
            </InfoContainer>
            <FlexDivCentered>
                <SearchAddress placeholder="SEARCH WALLET ADDRESS" />
            </FlexDivCentered>
            <Table
                tableRowHeadStyles={{
                    borderBottom: '2px solid rgba(238, 238, 228, 0.8)',
                    color: 'rgba(238, 238, 228, 0.8)',
                }}
                columns={[
                    {
                        Header: <>NFT</>,
                        accessor: 'nft',
                        Cell: (cellProps: any) => <p>{cellProps.cell.value}</p>,
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>Address</>,
                        accessor: 'address',
                        Cell: (cellProps: any) => <p>{truncateAddress(cellProps.cell.value)}</p>,
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>Volume</>,
                        accessor: 'volume',
                        Cell: (cellProps: any) => <p>{cellProps.cell.value}</p>,
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>Rewards</>,
                        accessor: 'rewards',
                        Cell: (cellProps: any) => <p>{cellProps.cell.value}</p>,
                        width: 150,
                        sortable: true,
                    },
                ]}
                data={[
                    {
                        nft: 'test',
                        address: '0xaf5FAc02Af62BcF245285386456e4340dE2188b8',
                        volume: 50000,
                        rewards: 3440,
                    },
                    {
                        nft: 'test',
                        address: '0xaf5FAc02Af62BcF245285386456e4340dE2188b8',
                        volume: 50000,
                        rewards: 3440,
                    },
                ]}
            />
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

const SearchAddress = styled.input`
    width: 90%;
    padding: 5px;
    margin: 20px 0;
    background: rgba(4, 207, 182, 0.4);
    border: 1px solid rgba(4, 207, 182, 0.8);
    text-align: center;
    color: white;
    ::placeholder {
        text-align: center;
    }
    ::-webkit-input-placeholder {
        text-align: center;
    }
    :-moz-placeholder {
        /* Firefox 18- */
        text-align: center;
    }
    ::-moz-placeholder {
        /* Firefox 19+ */
        text-align: center;
    }
    :-ms-input-placeholder {
        text-align: center;
    }
`;

export default Leaderboard;
