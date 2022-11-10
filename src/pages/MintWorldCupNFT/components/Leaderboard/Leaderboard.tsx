import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { truncateAddress } from 'utils/formatters/string';
import { ReactComponent as ArrowRight } from 'assets/images/favorite-team/arrow-right.svg';
import { ReactComponent as LeaderboardRectangle } from 'assets/images/favorite-team/rewards-rectangle.svg';
import { countries } from 'pages/MintWorldCupNFT/countries';
import { InfoContainer, InfoText, InfoContent } from 'pages/MintWorldCupNFT/styled-components';
import { FlexDivCentered } from 'styles/common';
import Table from 'components/Table';
import useZebroQuery from 'queries/favoriteTeam/useZebroQuery';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getNetworkId } from 'redux/modules/wallet';
import { getIsMobile } from 'redux/modules/app';

type LeaderboardProps = {
    favoriteTeamNumber: number | undefined;
};

const Leaderboard: React.FC<LeaderboardProps> = ({ favoriteTeamNumber }) => {
    const { t } = useTranslation();
    const favoriteTeam = favoriteTeamNumber ? countries[favoriteTeamNumber - 1] : null;
    const isMobile = useSelector(getIsMobile);
    console.log(favoriteTeam);

    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const zebrosQuery = useZebroQuery('', networkId);
    const zebros = zebrosQuery.isSuccess ? zebrosQuery.data : [];

    const zebrosMemo = useMemo(
        () =>
            zebros.map((zebro) => {
                return { ...zebro, url: zebro.url.replace('.json', '.png') };
            }),
        [zebros]
    );

    return (
        <>
            <InfoContainer>
                {!isMobile && <LeaderboardRectangle />}
                <InfoContent isMobile={isMobile}>
                    <InfoText isMobile={isMobile}>{t('mint-world-cup-nft.leaderboard.reward-calculations')}</InfoText>
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
                tableHeadCellStyles={{ justifyContent: 'center' }}
                tableRowHeadStyles={{
                    borderBottom: '2px solid rgba(238, 238, 228, 0.8)',
                    color: 'rgba(238, 238, 228, 0.8)',
                }}
                tableRowStyles={{
                    borderBottom: '1px dashed rgba(238, 238, 228, 0.8)',
                    paddingTop: 6,
                    paddingBottom: 6,
                }}
                tableRowCellStyles={{
                    justifyContent: 'center',
                }}
                columns={[
                    {
                        Header: <>NFT</>,
                        accessor: 'url',
                        Cell: (cellProps: any) => <ZebroNft src={cellProps.cell.value} />,
                    },
                    {
                        Header: <>Country</>,
                        accessor: 'countryName',
                        Cell: (cellProps: any) => <TableText>{cellProps.cell.value}</TableText>,
                    },
                    {
                        Header: <>Owner</>,
                        accessor: 'owner',
                        Cell: (cellProps: any) => <TableText>{truncateAddress(cellProps.cell.value)}</TableText>,
                    },
                    {
                        Header: <>TokenId</>,
                        accessor: 'tokenId',
                        Cell: (cellProps: any) => <TableText>{cellProps.cell.value}</TableText>,
                    },
                ]}
                data={zebrosMemo}
            />
        </>
    );
};

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

const ZebroNft = styled.img`
    width: 40px;
    height: 40px;
    object-fit: contain;
    border-radius: 20px;
`;

const TableText = styled.p`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 600;
    font-size: 13px;
    line-height: 150%;
    text-align: center;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: #eeeee4;
`;

const SearchAddress = styled.input`
    width: 90%;
    padding: 5px;
    margin: 20px 0;
    background: rgba(4, 207, 182, 0.4);
    border: 1px solid rgba(4, 207, 182, 0.8);
    text-align: center;
    color: white;
    z-index: 1;
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
