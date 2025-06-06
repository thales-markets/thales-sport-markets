import useGetReffererIdQuery from 'queries/referral/useGetReffererIdQuery';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsBiconomy } from 'redux/modules/wallet';
import { RootState } from 'types/redux';
import { buildReffererLink } from 'utils/routes';
import useBiconomy from 'utils/smartAccount/hooks/useBiconomy';
import { useAccount } from 'wagmi';
import {
    AffiliateContainer,
    AffiliateInput,
    CopyButton,
    CopyIcon,
    CreateButton,
    CreateIcon,
    DropdownIcon,
    FAQAnswer,
    FAQIcon,
    FAQItem,
    FAQQuestion,
    FAQSection,
    FAQSubtitle,
    FAQTitle,
    FAQToggleIcon,
    GrowthArrow,
    GrowthIndicator,
    HeaderSection,
    HowItWorksSection,
    InputRow,
    LeaderboardHeader,
    LeaderboardSection,
    MainSection,
    MainSubtitle,
    MainTitle,
    PageWrapper,
    ProgressContainer,
    ProgressToNext,
    RankNumber,
    SectionLabel,
    SectionTitle,
    StatLabel,
    StatRow,
    StatsContent,
    StatsHeader,
    StatsSection,
    StatsTitle,
    StatValue,
    Step,
    StepDescription,
    StepNumber,
    StepsContainer,
    StepTitle,
    Tab,
    TableCell,
    TableContainer,
    TableHeader,
    TableHeaders,
    TableRow,
    TabsContainer,
    TimeFilter,
    TrophyIcon,
    UpdatedTime,
    UserName,
    UserPosition,
    UserPositionLabel,
    UserProgressBar,
    UserProgressFill,
    UserProgressPercent,
    UserRankBadge,
    UserStats,
    UserXP,
    UserXPContainer,
} from './styled-components';

const Referral: React.FC = () => {
    const { t } = useTranslation();

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const { address } = useAccount();
    const { smartAddress } = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddress : address) || '';

    const reffererIDQuery = useGetReffererIdQuery(walletAddress || '');
    const reffererID = reffererIDQuery.isSuccess && reffererIDQuery.data ? reffererIDQuery.data : '';

    const [affiliateId, setAffiliateId] = useState('');
    const [selectedTab, setSelectedTab] = useState(0);
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(2);

    useEffect(() => {
        setAffiliateId(reffererID);
    }, [reffererID]);

    const mockUserStats = {
        referrals: 12,
        xpEarned: 920,
        rank: '#42',
        nextReward: '80 XP away',
        nextLevelProgress: 73,
    };

    const mockLeaderboardData = [
        {
            rank: 1,
            user: 'user378291',
            totalBets: 752,
            referrals: 2415,
            betVolume: '$ 1,511,250',
            xp: '6,855 XP',
            level: 'Rookie',
        },
        {
            rank: 2,
            user: 'cryptomaster',
            totalBets: 474,
            referrals: 2827,
            betVolume: '$ 1,467,282',
            xp: '6,220 XP',
            level: 'GOAT',
        },
        {
            rank: 3,
            user: 'winstreak42',
            totalBets: 9693,
            referrals: 85,
            betVolume: '$ 1,355,358',
            xp: '5,755 XP',
            level: 'Rookie',
        },
        {
            rank: 4,
            user: 'dave.eth',
            totalBets: 8585,
            referrals: 7413,
            betVolume: '$ 1,125,654',
            xp: '4,766 XP',
            level: 'Rookie',
        },
        {
            rank: 5,
            user: 'user512',
            totalBets: 744,
            referrals: 2,
            betVolume: '$ 599,250',
            xp: '2,822 XP',
            level: 'Rookie',
        },
    ];

    const mockUserPosition = {
        rank: 48,
        user: 'Your_momAlso@gmail.com',
        stats: '16 referrals • 9 active • 56% conversion rate',
        xp: '1,640 XP',
        growth: '+65% growth',
        progressPercent: 73,
    };

    const mockFAQs = [
        { question: 'How does the Overtime Affiliate Program work?', answer: '' },
        { question: 'How do I earn XP rewards and what are they worth?', answer: '' },
        {
            question: 'Is there a limit to how many users I can refer?',
            answer:
                'There is no limit to the number of users you can refer to Overtime. You can refer as many users as you want and earn rewards from all of their activity.\nHowever, we do monitor affiliate accounts for suspicious activity or violations of our terms of service. All referrals must be genuine users who are independently interested in using our platform.\nThe most successful affiliates typically have:\nA strong online presence or community\nAuthentic engagement with their audience\nValuable content related to crypto, betting, or trading\nA clear and honest communication style about the platform\nFocus on quality referrals who are likely to be active on the platform, as this will maximize your long-term rewards.',
        },
        { question: 'How can I track my referrals and earnings?', answer: '' },
        { question: 'Are there any restrictions on how I can promote my affiliate link?', answer: '' },
        { question: 'How is the affiliate leaderboard ranking determined?', answer: '' },
        { question: 'What are Affiliate Missions and how do they work?', answer: '' },
        { question: 'Can I have multiple affiliate accounts?', answer: '' },
    ];

    const handleCreate = () => {
        console.log('Creating affiliate link');
    };

    const handleCopy = () => {
        if (!walletAddress) {
            return;
        }

        const referralLink = buildReffererLink(String(reffererID));

        navigator.clipboard.writeText(referralLink);
        toast(t('common.referral.link-copied'), { type: 'success' });
    };

    return (
        <PageWrapper>
            {/* Main Header Section */}
            <HeaderSection>
                <MainSection>
                    <MainTitle>{t('referral.header.title')}</MainTitle>
                    <MainSubtitle>{t('referral.header.subtitle')}</MainSubtitle>

                    <AffiliateContainer>
                        <SectionLabel>{t('referral.header.affiliate-id-label')}</SectionLabel>
                        <InputRow>
                            <AffiliateInput
                                value={affiliateId}
                                onChange={(e) => setAffiliateId(e.target.value)}
                                placeholder={t('referral.header.affiliate-id-placeholder')}
                            />
                            <CreateButton
                                hoverColor={'#ffb600'}
                                onClick={handleCreate}
                                disabled={reffererID === affiliateId}
                            >
                                {t(reffererID ? 'referral.header.update' : 'referral.header.create')}
                                <CreateIcon />
                            </CreateButton>
                            <CopyButton hoverColor={'#3fffff'} onClick={handleCopy}>
                                {t('referral.header.copy')}
                                <CopyIcon />
                            </CopyButton>
                        </InputRow>
                        {/* <ShareSection>
                            <SocialIcons>
                                <XIcon onClick={() => handleShare('twitter')} />
                                <FacebookIcon onClick={() => handleShare('facebook')} />
                                <TelegramIcon onClick={() => handleShare('telegram')} />
                                <WhatsAppIcon onClick={() => handleShare('whatsapp')} />
                            </SocialIcons>
                        </ShareSection> */}
                    </AffiliateContainer>
                </MainSection>

                <StatsSection>
                    <StatsHeader>
                        <TrophyIcon />
                        <StatsTitle>{t('referral.header.stats-title')}</StatsTitle>
                    </StatsHeader>

                    <StatsContent>
                        <StatRow>
                            <StatLabel>{t('referral.header.stats.referrals')}</StatLabel>
                            <StatValue>{mockUserStats.referrals}</StatValue>
                        </StatRow>
                        <StatRow>
                            <StatLabel>{t('referral.header.stats.xp-earned')}</StatLabel>
                            <StatValue>{mockUserStats.xpEarned}</StatValue>
                        </StatRow>
                        <StatRow>
                            <StatLabel>{t('referral.header.stats.rank')}</StatLabel>
                            <StatValue>{mockUserStats.rank}</StatValue>
                        </StatRow>
                        {/* <StatRow>
                            <StatLabel>{t('referral.header.stats.next-reward')}</StatLabel>
                            <NextRewardValue>{mockUserStats.nextReward}</NextRewardValue>
                        </StatRow> */}

                        {/* <ProgressSection>
                            <ProgressRow>
                                <ProgressLabel>{t('referral.header.stats.next-level-progress')}</ProgressLabel>
                                <ProgressPercent>{mockUserStats.nextLevelProgress}%</ProgressPercent>
                            </ProgressRow>
                            <ProgressBar>
                                <ProgressFill style={{ width: `${mockUserStats.nextLevelProgress}%` }} />
                            </ProgressBar>
                        </ProgressSection> */}
                    </StatsContent>
                </StatsSection>
            </HeaderSection>

            {/* How it Works Section */}
            <HowItWorksSection>
                <SectionTitle>{t('referral.how-it-works.title')}</SectionTitle>
                <StepsContainer>
                    <Step>
                        <StepNumber>1</StepNumber>
                        <StepTitle>{t('referral.how-it-works.step1.title')}</StepTitle>
                        <StepDescription>{t('referral.how-it-works.step1.description')}</StepDescription>
                    </Step>
                    <Step>
                        <StepNumber>2</StepNumber>
                        <StepTitle>{t('referral.how-it-works.step2.title')}</StepTitle>
                        <StepDescription>{t('referral.how-it-works.step2.description')}</StepDescription>
                    </Step>
                    <Step>
                        <StepNumber>3</StepNumber>
                        <StepTitle>{t('referral.how-it-works.step3.title')}</StepTitle>
                        <StepDescription>{t('referral.how-it-works.step3.description')}</StepDescription>
                    </Step>
                </StepsContainer>
            </HowItWorksSection>

            {/* Leaderboard Section */}
            <LeaderboardSection>
                <LeaderboardHeader>
                    <TabsContainer>
                        <Tab active={selectedTab === 0} onClick={() => setSelectedTab(0)}>
                            {t('referral.leaderboard.tabs.affiliate')}
                        </Tab>
                        <Tab active={selectedTab === 1} onClick={() => setSelectedTab(1)}>
                            {t('referral.leaderboard.tabs.bets')}
                        </Tab>
                        <Tab active={selectedTab === 2} onClick={() => setSelectedTab(2)}>
                            {t('referral.leaderboard.tabs.activity')}
                        </Tab>
                    </TabsContainer>
                    <TimeFilter>
                        {t('referral.leaderboard.time-filter')}
                        <DropdownIcon />
                    </TimeFilter>
                </LeaderboardHeader>

                {/* User Position */}
                <UserPosition>
                    <UserPositionLabel>{t('referral.leaderboard.your-position')}</UserPositionLabel>
                    <UserRankBadge>{mockUserPosition.rank}</UserRankBadge>
                    <UserName>{mockUserPosition.user}</UserName>
                    <UserStats>{mockUserPosition.stats}</UserStats>
                    <UserXPContainer>
                        <UserXP>{mockUserPosition.xp}</UserXP>
                        <GrowthIndicator>
                            <GrowthArrow />
                            {mockUserPosition.growth}
                        </GrowthIndicator>
                    </UserXPContainer>
                    <ProgressContainer>
                        <ProgressToNext>{t('referral.leaderboard.progress-to-next')}</ProgressToNext>
                        <UserProgressBar>
                            <UserProgressFill style={{ width: `${mockUserPosition.progressPercent}%` }} />
                        </UserProgressBar>
                        <UserProgressPercent>{mockUserPosition.progressPercent}%</UserProgressPercent>
                    </ProgressContainer>
                </UserPosition>

                {/* Table Headers */}
                <TableHeaders>
                    <TableHeader style={{ width: '60px' }}>{t('referral.leaderboard.table-headers.rank')}</TableHeader>
                    <TableHeader style={{ width: '120px' }}>{t('referral.leaderboard.table-headers.user')}</TableHeader>
                    <TableHeader style={{ width: '100px' }}>
                        {t('referral.leaderboard.table-headers.total-bets')}
                    </TableHeader>
                    <TableHeader style={{ width: '100px' }}>
                        {t('referral.leaderboard.table-headers.referrals')}
                    </TableHeader>
                    <TableHeader style={{ width: '120px' }}>
                        {t('referral.leaderboard.table-headers.betVolume')}
                    </TableHeader>
                    <TableHeader style={{ width: '80px' }}>{t('referral.leaderboard.table-headers.xp')}</TableHeader>
                    <TableHeader style={{ width: '180px' }}>
                        {t('referral.leaderboard.table-headers.level')}
                    </TableHeader>
                </TableHeaders>

                {/* Table Data */}
                <TableContainer>
                    {mockLeaderboardData.map((row) => (
                        <TableRow key={row.rank}>
                            <RankNumber key={row.rank} isFirst={row.rank === 1}>
                                {row.rank}
                            </RankNumber>
                            <TableCell style={{ width: '120px' }}>{row.user}</TableCell>
                            <TableCell style={{ width: '100px' }}>{row.totalBets.toLocaleString()}</TableCell>
                            <TableCell style={{ width: '100px' }}>{row.referrals.toLocaleString()}</TableCell>
                            <TableCell style={{ width: '120px' }}>{row.betVolume}</TableCell>
                            <TableCell style={{ width: '80px', color: '#FFB600' }}>{row.xp}</TableCell>
                            <TableCell style={{ width: '180px', color: '#3FFFFF' }}>{row.level}</TableCell>
                        </TableRow>
                    ))}
                </TableContainer>

                <UpdatedTime>{t('referral.leaderboard.updated')}</UpdatedTime>
            </LeaderboardSection>

            {/* Rewards and Missions */}
            {/* <RewardsAndMissionsSection>
                <ReferralRewards>
                    <RewardsTitle>{t('referral.rewards.title')}</RewardsTitle>

                    <RewardItem>
                        <RewardIconContainer>
                            <SilverBadgeIcon />
                        </RewardIconContainer>
                        <RewardInfo>
                            <RewardName>{t('referral.rewards.silver.name')}</RewardName>
                            <RewardRequirement>{t('referral.rewards.silver.requirement')}</RewardRequirement>
                            <RewardProgress>
                                <RewardProgressBar>
                                    <RewardProgressFill style={{ width: '80%', background: '#3FFFFF' }} />
                                </RewardProgressBar>
                                <RewardProgressText style={{ color: '#3FFFFF' }}>
                                    {t('referral.rewards.silver.progress')}
                                </RewardProgressText>
                            </RewardProgress>
                        </RewardInfo>
                    </RewardItem>

                    <RewardItem>
                        <RewardIconContainer>
                            <GoldBadgeIcon />
                        </RewardIconContainer>
                        <RewardInfo>
                            <RewardName>{t('referral.rewards.gold.name')}</RewardName>
                            <RewardRequirement>{t('referral.rewards.gold.requirement')}</RewardRequirement>
                            <RewardProgress>
                                <RewardProgressBar>
                                    <RewardProgressFill style={{ width: '18%', background: '#FFB600' }} />
                                </RewardProgressBar>
                                <RewardProgressText style={{ color: '#FFB600' }}>
                                    {t('referral.rewards.gold.progress')}
                                </RewardProgressText>
                            </RewardProgress>
                        </RewardInfo>
                    </RewardItem>
                </ReferralRewards>

                <AffiliateMissions>
                    <MissionsTitle>{t('referral.missions.title')}</MissionsTitle>

                    <MissionItem>
                        <MissionInfo>
                            <FlexDivRow>
                                <MissionName>{t('referral.missions.weekend-warrior.name')}</MissionName>
                                <MissionReward>{t('referral.missions.weekend-warrior.reward')}</MissionReward>
                            </FlexDivRow>
                            <MissionRequirement>
                                {t('referral.missions.weekend-warrior.requirement')}
                            </MissionRequirement>
                            <MissionProgress>
                                <MissionProgressBar>
                                    <MissionProgressFill style={{ width: '33%' }} />
                                </MissionProgressBar>
                                <MissionProgressText>
                                    {t('referral.missions.weekend-warrior.progress')}
                                </MissionProgressText>
                            </MissionProgress>
                        </MissionInfo>
                    </MissionItem>

                    <MissionItem>
                        <MissionInfo>
                            <FlexDivRow>
                                <MissionName>{t('referral.missions.big-spender.name')}</MissionName>
                                <MissionReward>{t('referral.missions.big-spender.reward')}</MissionReward>
                            </FlexDivRow>
                            <MissionRequirement>{t('referral.missions.big-spender.requirement')}</MissionRequirement>
                        </MissionInfo>
                    </MissionItem>
                </AffiliateMissions>
            </RewardsAndMissionsSection> */}

            {/* FAQ Section */}
            <FAQSection>
                <FAQTitle>{t('referral.faq.title')}</FAQTitle>
                <FAQSubtitle>{t('referral.faq.subtitle')}</FAQSubtitle>

                {mockFAQs.map((faq, index) => (
                    <FAQItem key={index} expanded={expandedFAQ === index}>
                        <FAQQuestion onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}>
                            {t(`referral.faq.questions.${index}`)}
                            <FAQIcon expanded={expandedFAQ === index}>
                                <FAQToggleIcon expanded={expandedFAQ === index} />
                            </FAQIcon>
                        </FAQQuestion>
                        {expandedFAQ === index && faq.answer && (
                            <FAQAnswer>
                                {t(`referral.faq.answers.${index}`)
                                    .split('\n')
                                    .map((line, lineIndex) => {
                                        if (line.includes('no limit')) {
                                            const parts = line.split('no limit');
                                            return (
                                                <div key={lineIndex}>
                                                    {parts[0]}
                                                    <strong style={{ color: '#3FFFFF' }}>no limit</strong>
                                                    {parts[1]}
                                                </div>
                                            );
                                        }
                                        return <div key={lineIndex}>{line}</div>;
                                    })}
                            </FAQAnswer>
                        )}
                    </FAQItem>
                ))}
            </FAQSection>
        </PageWrapper>
    );
};

export default Referral;
