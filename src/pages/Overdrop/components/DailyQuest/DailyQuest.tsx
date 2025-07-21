import Button from 'components/Button';
import WheelOfFortune from 'components/WheelOfFortune';
import { ScreenSizeBreakpoint } from 'enums/ui';
import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered, FlexDivSpaceBetween } from 'styles/common';

const DAILY_QUESTS = [
    {
        icon: 'icon icon--logo',
        title: 'Place Overtime Bet',
        description: 'Make any bet on Overtime platform',
        buttonText: 'Start',
        onClick: () => console.log('Overtime Bet Started'),
    },
    {
        icon: 'sidebar-icon sidebar-icon--speed-markets',
        title: 'Speed Market Trade',
        description: 'Complete 1 speed market position',
        buttonText: 'Start',
        onClick: () => console.log('Speed Market Bet Started'),
    },
    {
        icon: 'icon icon--social',
        title: 'Share on Social',
        description: 'Post with your affiliate link',
        buttonText: 'Send',
        onClick: () => console.log('Social link Bet Started'),
    },
];

const DailyQuest: React.FC = () => {
    const theme = useTheme();

    const [showSpinTheWheel, setShowSpinTheWheel] = useState(false);
    return (
        <Container>
            {DAILY_QUESTS.map((quest, index) => (
                <DailyQuestItem key={index}>
                    <FlexDivCentered>
                        <Icon className={quest.icon} />
                        <HeaderWrapper>
                            <Title>{quest.title}</Title>
                            <Description>{quest.description}</Description>
                        </HeaderWrapper>
                    </FlexDivCentered>

                    <Button
                        borderRadius="8px"
                        textColor={theme.textColor.quaternary}
                        borderColor={theme.borderColor.quaternary}
                        backgroundColor="transparent"
                        width="62px"
                        height="30px"
                        fontSize="12px"
                        lineHeight="12px"
                        additionalStyles={{ textTransform: 'capitalize' }}
                        onClick={quest.onClick}
                    >
                        {quest.buttonText}
                    </Button>
                </DailyQuestItem>
            ))}
            <DailyQuestItem completed>
                <FlexDivCentered>
                    <Icon className={'icon icon--wheel'} />
                    <HeaderWrapper>
                        <Title>Daily Spin the Wheel</Title>
                        <BadgeWrapper>
                            <Badge1>XP BOOST</Badge1> <Badge2>OVERDROP XP</Badge2>
                        </BadgeWrapper>
                    </HeaderWrapper>
                </FlexDivCentered>
                <SpinTheWheelText>Complete daily quests to unlock bonus rewards</SpinTheWheelText>
                <Button
                    borderRadius="8px"
                    textColor={theme.textColor.quaternary}
                    borderColor={theme.borderColor.quaternary}
                    backgroundColor="transparent"
                    width="62px"
                    height="30px"
                    fontSize="12px"
                    lineHeight="12px"
                    additionalStyles={{ textTransform: 'capitalize' }}
                    onClick={() => setShowSpinTheWheel(!showSpinTheWheel)}
                >
                    Spin
                </Button>
            </DailyQuestItem>
            {showSpinTheWheel && <WheelOfFortune />}
        </Container>
    );
};

export default DailyQuest;

const Container = styled.div`
    border-radius: 8px;
    background: ${(props) => props.theme.background.quinary};
    padding: 20px 24px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        padding: 10px 12px;
    }
    margin-bottom: 20px;
`;

const DailyQuestItem = styled(FlexDivSpaceBetween)<{ completed?: boolean }>`
    height: 76px;
    border-radius: 8px;
    padding: 18px 22px;
    width: 100%;
    background: ${(props) => props.theme.overdrop.background.octonary};
    border: ${(props) =>
        props.completed ? ' 2px solid #8AF6A8' : `2px solid ${props.theme.overdrop.background.octonary}`};
`;

const Icon = styled.i`
    font-size: ${(props) => (props.className?.includes('logo') ? '30px' : '28px')};
    color: ${(props) => props.theme.textColor.primary};
    margin-right: 10px;
`;

const HeaderWrapper = styled(FlexDivColumnCentered)`
    gap: 2px;
`;

const Title = styled.h3`
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
    color: ${(props) => props.theme.textColor.primary};
`;

const Description = styled.p`
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px; /* 133.333% */
    color: ${(props) => props.theme.textColor.secondary};
`;

const SpinTheWheelText = styled.p`
    color: #3c498a;
    color: ${(props) => props.theme.textColor.septenary};
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
`;

const Badge1 = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;

    height: 20px;
    font-size: 10px;
    white-space: pre;
    font-weight: 400;
    line-height: 10px;

    padding: 4px 11px;

    border-radius: 8494.157px;
    border: 0.85px solid rgba(63, 255, 255, 0.3);
    background: rgba(63, 255, 255, 0.1);
    color: ${(props) => props.theme.textColor.quaternary};
`;

const Badge2 = styled(Badge1)`
    border-radius: 8494.157px;
    border: 0.85px solid rgba(219, 161, 17, 0.3);
    background: rgba(219, 161, 17, 0.1);
    color: ${(props) => props.theme.overdrop.textColor.octonary};
`;

const BadgeWrapper = styled(FlexDivCentered)`
    gap: 4px;
`;
