import axios from 'axios';
import { generalConfig } from 'config/general';
import useAffiliateLeaderboardQuery from 'queries/overdrop/useAffiliateLeaderboardQuery';
import useGetReffererIdQuery from 'queries/referral/useGetReffererIdQuery';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/app';
import { getIsBiconomy } from 'redux/modules/wallet';
import { FlexDivRowCentered } from 'styles/common';
import { formatCurrency } from 'thales-utils';
import { RootState } from 'types/redux';
import { buildReffererLink } from 'utils/routes';
import useBiconomy from 'utils/smartAccount/hooks/useBiconomy';
import { useAccount, useSignMessage } from 'wagmi';
import Activity from './components/Activity';
import Leaderboard from './components/Leaderboard';
import Summary from './components/Summary';
import {
    AffiliateContainer,
    AffiliateInput,
    AffiliateLinkLabel,
    CopyButton,
    CopyIcon,
    CreateButton,
    CreateIcon,
    FAQAnswer,
    FAQIcon,
    FAQItem,
    FAQQuestion,
    FAQSection,
    FAQSubtitle,
    FAQTitle,
    HeaderSection,
    HowItWorksSection,
    InputRow,
    LeaderboardHeader,
    LeaderboardSection,
    MainSection,
    MainSubtitle,
    MainTitle,
    PageWrapper,
    SectionLabel,
    SectionTitle,
    Step,
    StepDescription,
    StepNumber,
    StepsContainer,
    StepTitle,
    Tab,
    TabsContainer,
    UserPosition,
    UserPositionLabel,
    UserRankBadge,
    UserStats,
    UserXP,
    UserXPContainer,
} from './styled-components';

const Referral: React.FC = () => {
    const { t } = useTranslation();

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const { address } = useAccount();
    const { smartAddress } = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddress : address) || '';
    const { signMessageAsync } = useSignMessage();

    const reffererIDQuery = useGetReffererIdQuery(walletAddress || '');
    const [reffererID, setReffererID] = useState('');
    const [savedReffererID, setSavedReffererID] = useState('');

    const [selectedTab, setSelectedTab] = useState(0);
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(2);

    useEffect(() => {
        if (reffererIDQuery.isSuccess) {
            setReffererID(reffererIDQuery.data);
            setSavedReffererID(reffererIDQuery.data);
        }
    }, [reffererIDQuery.isSuccess, reffererIDQuery.data]);

    const leaderboardQuery = useAffiliateLeaderboardQuery();
    const leaderboard = useMemo(() => leaderboardQuery.data || [], [leaderboardQuery.data]);

    const yourPosition = useMemo(() => {
        if (!walletAddress || !leaderboard || leaderboard.length === 0) {
            return null;
        }

        const position = leaderboard.find((item) => item.owner.toLowerCase() === walletAddress.toLowerCase());
        return position ? position : null;
    }, [leaderboard, walletAddress]);

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

    const onSubmit = useCallback(async () => {
        const signature = await signMessageAsync({ message: reffererID });
        const response = await axios.post(`${generalConfig.API_URL}/update-refferer-id`, {
            walletAddress,
            reffererID,
            signature,
            previousReffererID: savedReffererID,
        });
        if (response.data.error) {
            toast(t('common.referral.id-exists'), { type: 'error' });
        } else {
            setSavedReffererID(reffererID);
            toast(t('common.referral.id-create-success'), { type: 'success' });
        }
    }, [reffererID, walletAddress, savedReffererID, t, signMessageAsync]);

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
                            <AffiliateLinkLabel>{buildReffererLink(String(reffererID))}</AffiliateLinkLabel>
                            <AffiliateInput
                                value={reffererID}
                                onChange={(e) => {
                                    setReffererID(e.target.value);
                                }}
                                placeholder={t('referral.header.affiliate-id-placeholder')}
                            />
                            <CreateButton
                                hoverColor={'#ffb600'}
                                onClick={onSubmit}
                                disabled={reffererID === savedReffererID || !reffererID}
                            >
                                {t(savedReffererID ? 'referral.header.update' : 'referral.header.create')}
                                <CreateIcon />
                            </CreateButton>
                            <CopyButton disabled={!walletAddress} hoverColor={'#3fffff'} onClick={handleCopy}>
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

                {/* <StatsSection>
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
                        <StatRow>
                            <StatLabel>{t('referral.header.stats.next-reward')}</StatLabel>
                            <NextRewardValue>{mockUserStats.nextReward}</NextRewardValue>
                        </StatRow>

                        <ProgressSection>
                            <ProgressRow>
                                <ProgressLabel>{t('referral.header.stats.next-level-progress')}</ProgressLabel>
                                <ProgressPercent>{mockUserStats.nextLevelProgress}%</ProgressPercent>
                            </ProgressRow>
                            <ProgressBar>
                                <ProgressFill style={{ width: `${mockUserStats.nextLevelProgress}%` }} />
                            </ProgressBar>
                        </ProgressSection>
                    </StatsContent>
                </StatsSection> */}
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
                            <span>{t('referral.tabs.affiliate')}</span>
                            {!isMobile && <i className={`icon icon--leaderboard`} />}
                        </Tab>
                        {!!walletAddress && (
                            <Tab active={selectedTab === 1} onClick={() => setSelectedTab(1)}>
                                <span>{t('referral.tabs.summary')}</span>
                                {!isMobile && <i className={`icon icon--your-summary`} />}
                            </Tab>
                        )}
                        {!!walletAddress && (
                            <Tab active={selectedTab === 2} onClick={() => setSelectedTab(2)}>
                                <span>{t('referral.tabs.activity')}</span>
                                {!isMobile && <i className={`icon icon--referral-activity`} />}
                            </Tab>
                        )}
                    </TabsContainer>
                </LeaderboardHeader>

                {/* User Position */}
                {yourPosition && (
                    <UserPosition>
                        <FlexDivRowCentered>
                            <UserRankBadge>{yourPosition.rank}</UserRankBadge>
                            <UserPositionLabel>{t('referral.leaderboard.your-position')}</UserPositionLabel>
                            <UserStats>
                                {'• ' + yourPosition.referrals + ' ' + t('referral.header.stats.referrals')}
                            </UserStats>
                        </FlexDivRowCentered>

                        <UserXPContainer>
                            <UserXP>{formatCurrency(yourPosition.xp) + ' XP'}</UserXP>
                        </UserXPContainer>
                    </UserPosition>
                )}

                {selectedTab === 0 && <Leaderboard />}
                {selectedTab === 1 && <Summary />}
                {selectedTab === 2 && <Activity />}
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
                                <i
                                    className={expandedFAQ === index ? `icon icon--arrow-up` : `icon icon--arrow-down`}
                                />
                            </FAQIcon>
                        </FAQQuestion>
                        {expandedFAQ === index && faq.answer && (
                            <FAQAnswer>{t(`referral.faq.answers.${index}`)}</FAQAnswer>
                        )}
                    </FAQItem>
                ))}
            </FAQSection>
        </PageWrapper>
    );
};

export default Referral;
