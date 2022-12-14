import SPAAnchor from 'components/SPAAnchor';
import { USD_SIGN } from 'constants/currency';
import { SIDEBAR_NUMBER_OF_TOP_USERS } from 'constants/quiz';
import ROUTES from 'constants/routes';
import useZebroQuery from 'queries/favoriteTeam/useZebroQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { formatCurrencyWithSign } from 'utils/formatters/number';
import { truncateAddress } from 'utils/formatters/string';
import { buildHref } from 'utils/routes';
import {
    CampaignLogo,
    ColumnLabel,
    ColumnWrapper,
    Container,
    DataLabel,
    HeaderRow,
    LeaderboardContainer,
    LeaderboardRow,
    LeaderboardWrapper,
    Link,
    NftImage,
    OverlayContainer,
    Rank,
    Title,
} from './styled-components';
import Tooltip from 'components/Tooltip';
import { FlexDivRowCentered } from 'styles/common';

const SidebarLeaderboard: React.FC = () => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const zebrosQuery = useZebroQuery(networkId);

    const leaderboardZebros = useMemo(() => {
        const zebroData = zebrosQuery.isSuccess ? zebrosQuery.data.leaderboard : [];
        zebroData.sort((a, b) => {
            return b.volume - a.volume;
        });
        return zebroData.slice(0, SIDEBAR_NUMBER_OF_TOP_USERS);
    }, [zebrosQuery.isSuccess, zebrosQuery.data?.leaderboard]);

    return (
        <LeaderboardWrapper>
            <Container>
                <SPAAnchor href={buildHref(ROUTES.MintWorldCupNFT)}>
                    <Title>
                        <FlexDivRowCentered>
                            <CampaignLogo />
                        </FlexDivRowCentered>
                    </Title>
                </SPAAnchor>
                <LeaderboardContainer>
                    <HeaderRow>
                        <ColumnWrapper>
                            <ColumnLabel>{t('mint-world-cup-nft.leaderboard.player')}</ColumnLabel>
                        </ColumnWrapper>
                        <ColumnWrapper>
                            <ColumnLabel>{t('mint-world-cup-nft.leaderboard.volume')}</ColumnLabel>
                        </ColumnWrapper>
                        <ColumnWrapper>
                            <ColumnLabel>{t('mint-world-cup-nft.leaderboard.rewards')}</ColumnLabel>
                        </ColumnWrapper>
                    </HeaderRow>
                    {leaderboardZebros.map((item, index) => {
                        const countryRaw = item.url.split('zebro_')[1].split('.')[0];
                        let country;
                        if (countryRaw.includes('_')) {
                            const countryNameArray = countryRaw.split('_');
                            country = countryNameArray[0] + ' ' + countryNameArray[1];
                        } else {
                            country = countryRaw;
                        }
                        return (
                            <LeaderboardRow key={index} className={index == 0 ? 'first' : ''}>
                                <ColumnWrapper>
                                    <Rank>{index + 1}</Rank>
                                    <Tooltip
                                        overlay={<OverlayContainer>{country}</OverlayContainer>}
                                        component={
                                            <Link href={item.url} target="_blank" rel="noreferrer">
                                                <NftImage alt="Zebro NFT" src={item.url} />
                                            </Link>
                                        }
                                        iconFontSize={23}
                                        marginLeft={2}
                                        top={0}
                                    />

                                    <DataLabel>{truncateAddress(item.address, 3, 3)}</DataLabel>
                                </ColumnWrapper>
                                <ColumnWrapper>
                                    <DataLabel>{formatCurrencyWithSign(USD_SIGN, item.volume, 2)}</DataLabel>
                                </ColumnWrapper>
                                <ColumnWrapper>
                                    <DataLabel>
                                        {`${Number(item.rewards.op).toFixed(2)} OP + ${Number(
                                            item.rewards.thales
                                        ).toFixed(2)} THALES`}
                                    </DataLabel>
                                </ColumnWrapper>
                            </LeaderboardRow>
                        );
                    })}
                </LeaderboardContainer>
            </Container>
        </LeaderboardWrapper>
    );
};

export default SidebarLeaderboard;
