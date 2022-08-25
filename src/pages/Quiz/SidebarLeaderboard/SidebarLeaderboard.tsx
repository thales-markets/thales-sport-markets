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
} from './styled-components';
import { formatCurrencyWithKey } from 'utils/formatters/number';
import { CURRENCY_MAP } from 'constants/currency';
import SPAAnchor from 'components/SPAAnchor';

const SidebarLeaderboard: React.FC = () => {
    const { t } = useTranslation();

    const quizLeaderboardQuery = useQuizLeaderboardQuery();

    const leaderboard: LeaderboardList = useMemo(() => {
        if (quizLeaderboardQuery.isSuccess && quizLeaderboardQuery.data) {
            return quizLeaderboardQuery.data.slice(0, 10);
        }

        return [];
    }, [quizLeaderboardQuery.data, quizLeaderboardQuery.isSuccess]);

    return (
        <LeaderboardWrapper>
            <SPAAnchor href={buildHref(ROUTES.QuizLeaderboard)}>
                <Container>
                    <Title>
                        <LeaderboardIcon />
                        {t('quiz.leaderboard.title')}
                    </Title>
                    <LeaderboardContainer>
                        {leaderboard.map((item: LeaderboardItem) => (
                            <LeaderboardRow key={item.rank}>
                                <Rank>{item.rank}</Rank>
                                <TwitterImage
                                    alt="twiiter"
                                    src={
                                        item.avatar != ''
                                            ? item.avatar
                                            : 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'
                                    }
                                />
                                <MainInfo>
                                    <Twitter>{item.name}</Twitter>
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
                        ))}
                    </LeaderboardContainer>
                </Container>
            </SPAAnchor>
        </LeaderboardWrapper>
    );
};

export default SidebarLeaderboard;
