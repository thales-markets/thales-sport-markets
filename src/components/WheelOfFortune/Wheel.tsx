import pointer from 'assets/images/svgs/pointer.svg';
import axios from 'axios';
import Button from 'components/Button';
import { generalConfig } from 'config/general';
import { ScreenSizeBreakpoint } from 'enums/ui';
import useDailyQuestOptions from 'queries/overdrop/useDailyQuestOptions';
import useUserDataQuery from 'queries/overdrop/useUserDataQuery';
import React, { useMemo, useState } from 'react';
import { Wheel } from 'react-custom-roulette';
import styled, { useTheme } from 'styled-components';
import { FlexDivSpaceBetween } from 'styles/common';
import { OverdropUserData, SpinThewheelOption } from 'types/overdrop';
import { hasUserDoneDailyQuests } from 'utils/overdrop';
import { refetchUserOverdrop } from 'utils/queryConnector';
import { useAccount } from 'wagmi';

const IMG_FOLDER = 'src/assets/images/overdrop/wheel/';

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

            const moreOptions: SpinThewheelOption[] = [];

            spinTheWheelOptions.map((item) => {
                const numberOfOptions = Math.round((item.max - item.min) * 10);
                for (let index = 0; index < numberOfOptions; index++) {
                    moreOptions.push(item);
                }
            });

            return moreOptions.map((item: any, index: number) => {
                const uri = `${IMG_FOLDER}${isDailyQuestDone ? Number(item.id) + 3 : item.id}.png`;
                console.log(uri);
                return {
                    ...item,
                    style: {
                        backgroundColor: index % 2 ? '#DBA111' : '#03DAE5',
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

    return (
        <Wrapper>
            <WheelWrapper>
                {data && (
                    <Wheel
                        mustStartSpinning={mustSpin}
                        prizeNumber={prizeNumber}
                        data={data}
                        outerBorderColor={theme.textColor.tertiary}
                        outerBorderWidth={2}
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
                        <Text>Daily Spin the Wheel</Text>
                        <Description>Spin once every 24 hours • Guaranteed rewards</Description>
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
    margin-top: -60px;
    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        margin-top: 0;
    }
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

// const Time = styled.p`
//     color: #3fffff;

//     text-align: right;
//     font-family: Inter;
//     font-size: 21px;
//     font-style: normal;
//     font-weight: 700;
//     line-height: 32px;
// `;

export default WheelOfFortune;
