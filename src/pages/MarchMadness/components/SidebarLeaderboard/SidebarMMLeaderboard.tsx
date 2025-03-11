import marchMadnessLeftIcon from 'assets/images/march-madness/mm-button-icon-1.svg';
import marchMadnessRightIcon from 'assets/images/march-madness/mm-button-icon-2.svg';
import SPAAnchor from 'components/SPAAnchor';
import SimpleLoader from 'components/SimpleLoader';
import ROUTES from 'constants/routes';
import useLeaderboardByGuessedCorrectlyQuery from 'queries/marchMadness/useLeaderboardByGuessedCorrectlyQuery';
import queryString from 'query-string';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from 'thales-utils';
import { getFormattedRewardsAmount } from 'utils/marchMadness';
import { buildHref } from 'utils/routes';
import { useChainId } from 'wagmi';
import { MarchMadTabs } from '../Tabs/Tabs';
import {
    ColumnLabel,
    ColumnWrapper,
    Container,
    DataLabel,
    HeaderRow,
    LeaderboardContainer,
    LeaderboardRow,
    LeaderboardWrapper,
    LoaderContainer,
    NoResultContainer,
    Rank,
    Title,
    TitleLabel,
} from './styled-components';

const SidebarMMLeaderboard: React.FC = () => {
    const { t } = useTranslation();

    const networkId = useChainId();

    const marchMadnessQuery = useLeaderboardByGuessedCorrectlyQuery(networkId);

    const dataByPoints = useMemo(() => {
        return marchMadnessQuery.isSuccess && marchMadnessQuery.data ? marchMadnessQuery.data.slice(0, 20) : [];
    }, [marchMadnessQuery.data, marchMadnessQuery.isSuccess]);

    return (
        <LeaderboardWrapper>
            <Container>
                <SPAAnchor
                    href={buildHref(
                        `${ROUTES.MarchMadness}?${queryString.stringify({
                            tab: MarchMadTabs.LEADERBOARD,
                        })}`
                    )}
                >
                    <Title>
                        <TitleLabel>
                            <img src={marchMadnessLeftIcon} />
                            <span>{t('march-madness.side-leaderboard.title')}</span>
                            <img src={marchMadnessRightIcon} />
                        </TitleLabel>
                        <TitleLabel isBold={true}>{t('march-madness.side-leaderboard.points-leaderboard')}</TitleLabel>
                    </Title>
                </SPAAnchor>
                <LeaderboardContainer>
                    <HeaderRow>
                        <ColumnWrapper style={{ margin: '0 0 0 25px' }} width={'15%'}>
                            <ColumnLabel>{t('march-madness.side-leaderboard.bracket-id')}</ColumnLabel>
                        </ColumnWrapper>
                        <ColumnWrapper width={'25%'}>
                            <ColumnLabel>{t('march-madness.side-leaderboard.points')}</ColumnLabel>
                        </ColumnWrapper>
                        <ColumnWrapper width={'40%'}>
                            <ColumnLabel>{t('march-madness.side-leaderboard.rewards')}</ColumnLabel>
                        </ColumnWrapper>
                    </HeaderRow>
                    {marchMadnessQuery.isLoading ? (
                        <LoaderContainer>
                            <SimpleLoader />
                        </LoaderContainer>
                    ) : dataByPoints.length === 0 ? (
                        <NoResultContainer>{t('march-madness.side-leaderboard.no-parlays')}</NoResultContainer>
                    ) : (
                        dataByPoints.map((item, index) => {
                            return (
                                <React.Fragment key={index}>
                                    <LeaderboardRow className={index == 0 ? 'first' : ''}>
                                        <Rank>{item.rank}</Rank>
                                        <ColumnWrapper width={'15%'}>
                                            <DataLabel title={`${item.bracketId}`} textAlign="center">
                                                {`#${item.bracketId}`}
                                            </DataLabel>
                                        </ColumnWrapper>
                                        <ColumnWrapper width={'20%'}>
                                            <DataLabel textAlign="center">{formatCurrency(item.totalPoints)}</DataLabel>
                                        </ColumnWrapper>
                                        <ColumnWrapper width={'45%'}>
                                            <DataLabel textAlign={'left'}>
                                                {getFormattedRewardsAmount(item.stableRewards, item.tokenRewards)}
                                            </DataLabel>
                                        </ColumnWrapper>
                                    </LeaderboardRow>
                                </React.Fragment>
                            );
                        })
                    )}
                </LeaderboardContainer>
            </Container>
        </LeaderboardWrapper>
    );
};

export default React.memo(SidebarMMLeaderboard);
