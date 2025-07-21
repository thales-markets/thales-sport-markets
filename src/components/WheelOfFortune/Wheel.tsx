import pointer from 'assets/images/svgs/pointer.svg';
import Button from 'components/Button';
import React, { useState } from 'react';
import { Wheel } from 'react-custom-roulette';
import styled, { useTheme } from 'styled-components';
import { FlexDivSpaceBetween } from 'styles/common';

const OPTIONS = [
    {
        option: '20% XP boost for 24h',
    },

    {
        option: '30% XP boost for 24h',
    },

    {
        option: '50% XP boost for 24h',
    },
];

const MORE_OPTIONS = [
    {
        option: '100 OVERDROP XP ',
    },

    {
        option: '200 OVERDROP XP ',
    },

    {
        option: '500 OVERDROP XP ',
    },
];

const data = [...OPTIONS, ...MORE_OPTIONS].map((item, index) => ({
    ...item,
    style: {
        backgroundColor: index % 2 === 0 ? '#DBA111' : '#03DAE5',
        fontFamily: 'Arial',
        fontSize: 16,
        fontWeight: 500,
    },
}));

const WheelOfFortune: React.FC = () => {
    const [mustSpin, setMustSpin] = useState(false);
    const [prizeNumber, setPrizeNumber] = useState(0);
    const theme = useTheme();

    const handleSpinClick = () => {
        setMustSpin(true);
        const newPrizeNumber = Math.floor(Math.random() * data.length);
        setPrizeNumber(newPrizeNumber);
    };
    return (
        <Wrapper>
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
                startingOptionIndex={1}
                onStopSpinning={() => {
                    setMustSpin(false);
                    console.log('hi');
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
