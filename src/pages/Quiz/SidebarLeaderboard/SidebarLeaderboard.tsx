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
import { DEFAULT_TWITTER_PROFILE_IMAGE, NUMBER_OF_REWARDS } from 'constants/quiz';
import { getTwitterProfileLink } from 'utils/quiz';

const SidebarLeaderboard: React.FC = () => {
    const { t } = useTranslation();

    const quizLeaderboardQuery = useQuizLeaderboardQuery();

    const leaderboard: LeaderboardList = useMemo(() => {
        if (quizLeaderboardQuery.isSuccess && quizLeaderboardQuery.data) {
            return quizLeaderboardQuery.data.slice(0, NUMBER_OF_REWARDS);
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
                        <Link href={getTwitterProfileLink(item.name)} target="_blank" rel="noreferrer" key={item.rank}>
                            <LeaderboardRow>
                                <Rank>{item.rank}</Rank>
                                <TwitterImage
                                    alt="twiiter"
                                    src={item.avatar != '' ? item.avatar : DEFAULT_TWITTER_PROFILE_IMAGE}
                                />
                                <MainInfo>
                                    <Twitter className="twitter">{item.name}</Twitter>
                                    <Rewards>
                                        {formatCurrencyWithKey(CURRENCY_MAP.THALES, item.rewards, 0, true)}
                                    </Rewards>
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
