import pointer from 'assets/images/svgs/pointer.svg';
import axios from 'axios';
import Button from 'components/Button';
import Modal from 'components/Modal';
import { generalConfig } from 'config/general';
import { OVERDROP_WHEEL_IMAGES } from 'constants/overdrop';
import { ScreenSizeBreakpoint } from 'enums/ui';
import useDailyQuestOptions from 'queries/overdrop/useDailyQuestOptions';
import useUserDataQuery from 'queries/overdrop/useUserDataQuery';
import React, { useMemo, useState } from 'react';
import { Wheel } from 'react-custom-roulette';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import { Colors, FlexDivSpaceBetween } from 'styles/common';
import { OverdropUserData, SpinThewheelOption } from 'types/overdrop';
import { hasUserDoneDailyQuests } from 'utils/overdrop';
import { refetchUserOverdrop } from 'utils/queryConnector';
import { useAccount } from 'wagmi';

type WheelProps = {
    onClose: () => void;
};

const WheelOfFortune: React.FC<WheelProps> = ({ onClose }) => {
    const [mustSpin, setMustSpin] = useState(false);
    const [prizeNumber, setPrizeNumber] = useState(0);
    const { address, isConnected } = useAccount();
    const [isInfoModalOpen, setInfoModalOpen] = useState(false);
    const theme = useTheme();

    const { t } = useTranslation();

    const userDataQuery = useUserDataQuery(address as string, {
        enabled: isConnected,
    });

    const spinTheWheelOptionsQuery = useDailyQuestOptions();

    const spinTheWheelOptions = spinTheWheelOptionsQuery?.isSuccess ? spinTheWheelOptionsQuery.data : undefined;

    const userData: OverdropUserData | undefined =
        userDataQuery?.isSuccess && userDataQuery?.data ? userDataQuery.data : undefined;

    const handleSpinClick = async () => {
        try {
            const request = await axios.get(`${generalConfig.OVERDROP_API_URL}/spin-the-wheel/${address}`);
            setMustSpin(true);
            if (request) {
                const response = request.data;
                const result = data?.findIndex((item) => item.id === response.id) ?? 0;
                setPrizeNumber(result);
            }
        } catch (error) {
            console.log('Error spinning the wheel:', error);
        }
    };

    const data = useMemo(() => {
        if (userData && spinTheWheelOptions) {
            const isDailyQuestDone = hasUserDoneDailyQuests(userData);

            const moreOptions: SpinThewheelOption[] = [];

            spinTheWheelOptions.map((item) => {
                const numberOfOptions = Math.round((item.max - item.min) * 10);
                for (let index = 0; index < numberOfOptions; index++) {
                    moreOptions.push(item);
                }
            });

            return moreOptions.map((item: any, index: number) => {
                const uri = OVERDROP_WHEEL_IMAGES[isDailyQuestDone ? Number(item.id) + 3 : item.id];

                return {
                    ...item,
                    style: {
                        backgroundColor: index % 2 ? Colors.REFERALL_YELLOW : '#03DAE5',
                        fontFamily: 'Arial',
                        fontSize: 16,
                        fontWeight: 500,
                    },
                    image: {
                        offsetY: 100,
                        uri,
                    },
                };
            });
        }
    }, [userData, spinTheWheelOptions]);

    const showExtraRewards = userData?.wheel?.reward?.xpAmount !== 0;

    return (
        <Modal
            containerStyle={{ border: 'none', background: 'transparent', overflow: 'hidden' }}
            hideHeader
            title=""
            onClose={onClose}
        >
            {isInfoModalOpen ? (
                <RewardWrapper>
                    <CloseIcon onClick={onClose} />
                    <TrophyIcon className="icon icon--ticket-win" />
                    <RewardTitle>{t('overdrop.wheel.congratulations')}</RewardTitle>
                    <RewardDesc>{t('overdrop.wheel.epic-rewards')}</RewardDesc>
                    <GradientWrapper>
                        <Reward> {userData?.wheel?.reward?.boostAmount}%</Reward>
                        <RewardLabel>{t('overdrop.wheel.xp-boost-activated')}</RewardLabel>
                        {showExtraRewards && <ExtraReward> + {userData?.wheel?.reward?.xpAmount}XP</ExtraReward>}
                    </GradientWrapper>
                    <FooterText>
                        {t('overdrop.wheel.reward-info', {
                            boostAmount: userData?.wheel?.reward?.boostAmount,
                            xpReward: showExtraRewards ? userData?.wheel?.reward?.xpAmount + 'XP' : '',
                        })}
                    </FooterText>
                </RewardWrapper>
            ) : (
                <Wrapper>
                    <WheelWrapper>
                        {data && (
                            <Wheel
                                mustStartSpinning={mustSpin}
                                prizeNumber={prizeNumber}
                                data={data}
                                innerBorderWidth={10}
                                innerBorderColor={theme.textColor.tertiary}
                                radiusLineColor={theme.textColor.tertiary}
                                radiusLineWidth={2}
                                textColors={[theme.textColor.tertiary]}
                                textDistance={55}
                                fontWeight={600}
                                onStopSpinning={() => {
                                    setMustSpin(false);
                                    refetchUserOverdrop(address as any);
                                    setInfoModalOpen(true);
                                }}
                                pointerProps={{
                                    style: {
                                        transform: `rotate(45deg)`,
                                        width: 70,
                                        height: 70,
                                    },
                                    src: pointer,
                                }}
                            />
                        )}
                    </WheelWrapper>

                    <Footer>
                        <FlexDivSpaceBetween>
                            <div>
                                <Text>{t('overdrop.wheel.daily-spin')}</Text>
                                <Description>{t('overdrop.wheel.spin-info')}</Description>
                            </div>
                        </FlexDivSpaceBetween>
                        <Button
                            width="100%"
                            backgroundColor="#FFD607"
                            height="30"
                            borderColor="none"
                            borderRadius="8px"
                            onClick={handleSpinClick}
                            fontSize="18px"
                            textColor={theme.textColor.tertiary}
                            margin="20px 0 0 0"
                        >
                            {t('overdrop.wheel.spin-now')}
                        </Button>
                    </Footer>
                </Wrapper>
            )}
        </Modal>
    );
};

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const WheelWrapper = styled.div`
    height: 445px;
    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        height: auto;
    }
`;

const Footer = styled.div`
    padding: 20px;

    border-radius: 6.709px;
    border: 1px solid #4e5fb1;
    width: 100%;
    background: #151b36;
`;

const Text = styled.p`
    color: #fff;
    font-size: 20px;
    font-weight: 500;
    line-height: 30px;
`;

const Description = styled.p`
    color: rgba(255, 255, 255, 0.6);
    text-align: center;
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
`;

const RewardWrapper = styled.div`
    border-radius: 16px;
    border: 1px solid ${(props) => props.theme.button.borderColor.senary};
    max-width: 480px;
    width: 100%;
    background: ${(props) => props.theme.background.secondary};
    padding: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    position: relative;
`;

const CloseIcon = styled.i`
    position: absolute;
    right: 12px;
    top: 10px;
    font-size: 12px;
    margin-top: 1px;
    cursor: pointer;
    &:before {
        font-family: OvertimeIconsV2 !important;
        content: '\\0031';
        color: ${(props) => props.theme.textColor.secondary};
    }
`;

const TrophyIcon = styled.i`
    font-size: 48px;
    color: ${(props) => props.theme.overdrop.borderColor.primary};
`;

const RewardTitle = styled.p`
    color: ${(props) => props.theme.textColor.quaternary};
    text-align: center;
    font-size: 24px;
    font-weight: 700;
    line-height: 32px;
`;

const RewardDesc = styled.p`
    color: #eab308;

    text-align: center;
    font-size: 14px;
    font-weight: 600;
    line-height: normal;
    letter-spacing: 0.7px;
`;

const GradientWrapper = styled.div`
    border-radius: 12px;
    border: 1px solid rgba(234, 179, 8, 0.3);
    background: linear-gradient(90deg, rgba(234, 179, 8, 0.1) 0%, rgba(34, 211, 238, 0.1) 100%);
    width: 100%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Reward = styled.p`
    color: #eab308;

    text-align: center;
    font-size: 36px;
    font-weight: 800;
    line-height: normal;
`;

const RewardLabel = styled.p`
    color: ${(props) => props.theme.textColor.quaternary};

    text-align: center;
    font-family: Inter;
    font-size: 14px;
    font-weight: 500;
    line-height: normal;
`;
const ExtraReward = styled(Reward)`
    color: ${(props) => props.theme.textColor.quaternary};
`;
const FooterText = styled.p`
    color: #d1d5db;

    text-align: center;
    font-size: 12px;
    font-weight: 400;
    line-height: normal;
`;

export default WheelOfFortune;
