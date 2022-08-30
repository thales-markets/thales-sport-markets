import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ROUTES from 'constants/routes';
import { buildHref } from 'utils/routes';
import useQuizLeaderboardQuery from 'queries/quiz/useQuizLeaderboardQuery';
import { LeaderboardItem, LeaderboardList } from 'types/quiz';
import { TwitterImage } from '../styled-components';
import {
    LeaderboardContainer,
    LeaderboardIcon,
    Container,
    Title,
    LeaderboardRow,
    Rank,
    MainInfo,
    Twitter,
    Rewards,
    PointsLabel,
    PointsInfo,
    Points,
    LeaderboardWrapper,
    Link,
} from './styled-components';
import { formatCurrencyWithKey } from 'utils/formatters/number';
import { CURRENCY_MAP } from 'constants/currency';
import SPAAnchor from 'components/SPAAnchor';
import { DEFAULT_TWITTER_PROFILE_IMAGE } from 'constants/quiz';
import { getTwitterProfileLink } from 'utils/quiz';

const SidebarLeaderboard: React.FC = () => {
    const { t } = useTranslation();

    const quizLeaderboardQuery = useQuizLeaderboardQuery();

    const leaderboard: LeaderboardList = useMemo(() => {
        if (quizLeaderboardQuery.isSuccess && quizLeaderboardQuery.data) {
            const leaderboard = quizLeaderboardQuery.data[quizLeaderboardQuery.data.length - 1].leaderboard;
            const numberOfRewards = leaderboard.filter((item: LeaderboardItem) => item.price > 0).length;

            return leaderboard.slice(0, numberOfRewards);
        }

        return [];
    }, [quizLeaderboardQuery.data, quizLeaderboardQuery.isSuccess]);

    return (
        <LeaderboardWrapper>
            <Container>
                <SPAAnchor href={buildHref(ROUTES.QuizLeaderboard)}>
                    <Title>
                        <LeaderboardIcon />
                        {t('quiz.leaderboard.title')}
                    </Title>
                </SPAAnchor>
                <LeaderboardContainer>
                    {leaderboard.map((item: LeaderboardItem) => (
                        <Link
                            href={getTwitterProfileLink(item.name)}
                            target="_blank"
                            rel="noreferrer"
                            key={item.ranking}
                        >
                            <LeaderboardRow>
                                <Rank>{item.ranking}</Rank>
                                <TwitterImage
                                    alt="tw"
                                    src={item.avatar != '' ? item.avatar : DEFAULT_TWITTER_PROFILE_IMAGE}
                                />
                                <MainInfo>
                                    <Twitter className="twitter">{item.name}</Twitter>
                                    <Rewards>{formatCurrencyWithKey(CURRENCY_MAP.sUSD, item.price, 0, true)}</Rewards>
                                </MainInfo>
                                <PointsInfo>
                                    <Points>{item.points}</Points>
                                    <PointsLabel>
                                        {item.points === 1 ? t('quiz.point-label') : t('quiz.points-label')}
                                    </PointsLabel>
                                </PointsInfo>
                            </LeaderboardRow>
                        </Link>
                    ))}
                </LeaderboardContainer>
            </Container>
        </LeaderboardWrapper>
    );
};

export default SidebarLeaderboard;
