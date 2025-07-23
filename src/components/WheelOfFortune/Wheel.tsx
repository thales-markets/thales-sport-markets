import pointer from 'assets/images/svgs/pointer.svg';
import axios from 'axios';
import Button from 'components/Button';
import { generalConfig } from 'config/general';
import useDailyQuestOptions from 'queries/overdrop/useDailyQuestOptions';
import useUserDataQuery from 'queries/overdrop/useUserDataQuery';
import React, { useMemo, useState } from 'react';
import { Wheel } from 'react-custom-roulette';
import styled, { useTheme } from 'styled-components';
import { FlexDivSpaceBetween } from 'styles/common';
import { OverdropUserData } from 'types/overdrop';
import { hasUserDoneDailyQuests } from 'utils/overdrop';
import { refetchUserOverdrop } from 'utils/queryConnector';
import { useAccount } from 'wagmi';

const WheelOfFortune: React.FC = () => {
    const [mustSpin, setMustSpin] = useState(false);
    const [prizeNumber, setPrizeNumber] = useState(0);
    const { address, isConnected } = useAccount();
    const theme = useTheme();

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

            // Separate by bonus true/false (default to false if missing)
            const withBonus = spinTheWheelOptions.filter((item) => item.bonus === true);
            const withoutBonus = spinTheWheelOptions.filter((item) => item.bonus !== true);

            const result = [];

            while (withBonus.length || withoutBonus.length) {
                if (withBonus.length) result.push(withBonus.shift());
                if (withoutBonus.length) result.push(withoutBonus.shift());
            }

            return result.map((item: any) => {
                if (!isDailyQuestDone && item.bonus) {
                    return {
                        ...item,
                        option: `${item.amount} ${item.type} 🔒`,
                        style: {
                            backgroundColor: '#7a683a',
                            fontFamily: 'Arial',
                            fontSize: 16,
                            fontWeight: 500,
                        },
                    };
                }
                return {
                    ...item,
                    option: `${item.amount} ${item.type}`,
                    style: {
                        backgroundColor: item.bonus ? '#DBA111' : '#03DAE5',
                        fontFamily: 'Arial',
                        fontSize: 16,
                        fontWeight: 500,
                    },
                };
            });
        }
    }, [userData, spinTheWheelOptions]);

    return (
        <Wrapper>
            {data && (
                <Wheel
                    mustStartSpinning={mustSpin}
                    prizeNumber={prizeNumber}
                    data={data}
                    outerBorderColor={theme.textColor.tertiary}
                    outerBorderWidth={4}
                    innerBorderWidth={10}
                    innerBorderColor={theme.textColor.tertiary}
                    radiusLineColor={theme.textColor.tertiary}
                    radiusLineWidth={6}
                    textColors={[theme.textColor.tertiary]}
                    textDistance={55}
                    fontWeight={600}
                    onStopSpinning={() => {
                        setMustSpin(false);
                        refetchUserOverdrop(address as any);
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

            <Footer>
                <FlexDivSpaceBetween>
                    <div>
                        <Text>Daily Spin the Wheel</Text>
                        <Description>Spin once every 24 hours • Guaranteed rewards</Description>
                    </div>
                    <div>
                        <Description>Next spin in:</Description>
                        <Time>00:00:00</Time>
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
                    Spin Now
                </Button>
            </Footer>
        </Wrapper>
    );
};

const Wrapper = styled.div`
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const Footer = styled.div`
    padding: 20px;

    border-radius: 6.709px;
    border: 1px solid #4e5fb1;
    width: 100%;
    background: #151b36;
    margin-top: -60px;
`;

const Text = styled.p`
    color: #fff;
    font-family: Inter;
    font-size: 20px;
    font-style: normal;
    font-weight: 500;
    line-height: 29.742px; /* 148.711% */
`;

const Description = styled.p`
    color: rgba(255, 255, 255, 0.6);
    text-align: center;
    font-family: Inter;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px; /* 142.857% */
`;

const Time = styled.p`
    color: #3fffff;

    text-align: right;
    font-family: Inter;
    font-size: 21px;
    font-style: normal;
    font-weight: 700;
    line-height: 32px;
`;

export default WheelOfFortune;
