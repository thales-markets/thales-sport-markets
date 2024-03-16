import SPAAnchor from 'components/SPAAnchor';
import SimpleLoader from 'components/SimpleLoader';
import ROUTES from 'constants/routes';
import useLeaderboardByGuessedCorrectlyQuery from 'queries/marchMadness/useLeaderboardByGuessedCorrectlyQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { formatCurrency } from 'thales-utils';
import { buildHref } from 'utils/routes';
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
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const marchMadnessQuery = useLeaderboardByGuessedCorrectlyQuery(networkId, {
        enabled: isAppReady,
    });

    const dataByPoints = useMemo(() => {
        return marchMadnessQuery.isSuccess && marchMadnessQuery.data ? marchMadnessQuery.data : [];
    }, [marchMadnessQuery.data, marchMadnessQuery.isSuccess]);

    return (
        <LeaderboardWrapper>
            <Container>
                <SPAAnchor href={buildHref(ROUTES.Leaderboard)}>
                    <Title>
                        <TitleLabel>{t('march-madness.side-leaderboard.title')}</TitleLabel>
                        <TitleLabel isBold={true}>{t('march-madness.side-leaderboard.points-leaderboard')}</TitleLabel>
                    </Title>
                </SPAAnchor>
                <LeaderboardContainer>
                    <HeaderRow>
                        <ColumnWrapper padding={'0 0 0 20px'}>
                            <ColumnLabel>{t('march-madness.side-leaderboard.bracket-id')}</ColumnLabel>
                        </ColumnWrapper>
                        <ColumnWrapper>
                            <ColumnLabel>{t('march-madness.side-leaderboard.points')}</ColumnLabel>
                        </ColumnWrapper>
                        <ColumnWrapper>
                            <ColumnLabel>{t('march-madness.side-leaderboard.rewards')}</ColumnLabel>
                        </ColumnWrapper>
                    </HeaderRow>
                    {marchMadnessQuery.isLoading ? (
                        <LoaderContainer>
                            <SimpleLoader />
                        </LoaderContainer>
                    ) : dataByPoints.length === 0 ? (
                        <NoResultContainer>{t('parlay-leaderboard.no-parlays')}</NoResultContainer>
                    ) : (
                        dataByPoints.map((item, index) => {
                            return (
                                <React.Fragment key={index}>
                                    <LeaderboardRow className={index == 0 ? 'first' : ''}>
                                        <ColumnWrapper>
                                            <Rank>{item.rank}</Rank>
                                            <DataLabel
                                                title={`${item.bracketId}`}
                                                textAlign="center"
                                                style={{ width: 55 }}
                                            >
                                                {item.bracketId}
                                            </DataLabel>
                                        </ColumnWrapper>
                                        <ColumnWrapper>
                                            <DataLabel textAlign="center">{formatCurrency(item.totalPoints)}</DataLabel>
                                        </ColumnWrapper>
                                        <ColumnWrapper>
                                            <DataLabel textAlign={'left'}>{item.rewards}</DataLabel>
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
