import React from 'react';
import styled from 'styled-components';
import Match from '../Match';

const Brackets: React.FC = () => {
    return (
        <Container>
            <RowHalf>
                <LeftQuarter>
                    <FirstRound>
                        <Match id={1} height={MATCH_HEIGHT} margin="0"></Match>
                        <Match id={2} height={MATCH_HEIGHT} margin={`${FIRST_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={3} height={MATCH_HEIGHT} margin={`${FIRST_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={4} height={MATCH_HEIGHT} margin={`${FIRST_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={5} height={MATCH_HEIGHT} margin={`${FIRST_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={6} height={MATCH_HEIGHT} margin={`${FIRST_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={7} height={MATCH_HEIGHT} margin={`${FIRST_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={8} height={MATCH_HEIGHT} margin={`${FIRST_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                    </FirstRound>
                    <SecondRound sideLeft={true}>
                        <Match id={33} height={MATCH_HEIGHT} margin={`${FIRST_ROUND_MATCH_GAP + 1}px 0 0 0`}></Match>
                        <Match id={34} height={MATCH_HEIGHT} margin={`${SECOND_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={35} height={MATCH_HEIGHT} margin={`${SECOND_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={36} height={MATCH_HEIGHT} margin={`${SECOND_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                    </SecondRound>
                    <Sweet16 sideLeft={true}>
                        <Match id={49} height={MATCH_HEIGHT} margin={`${SECOND_ROUND_MATCH_GAP + 1}px 0 0 0`}></Match>
                        <Match id={50} height={MATCH_HEIGHT} margin={`${SWEET16_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                    </Sweet16>
                    <Elite8 sideLeft={true}>
                        <Match id={57} height={MATCH_HEIGHT} margin={`${SWEET16_ROUND_MATCH_GAP + 1}px 0 0 0`}></Match>
                    </Elite8>
                </LeftQuarter>
                <RightQuarter>
                    <Elite8 sideLeft={false}>
                        <Match id={59} height={MATCH_HEIGHT} margin={`${SWEET16_ROUND_MATCH_GAP + 1}px 0 0 0`}></Match>
                    </Elite8>
                    <Sweet16 sideLeft={false}>
                        <Match id={53} height={MATCH_HEIGHT} margin={`${SECOND_ROUND_MATCH_GAP + 1}px 0 0 0`}></Match>
                        <Match id={54} height={MATCH_HEIGHT} margin={`${SWEET16_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                    </Sweet16>
                    <SecondRound sideLeft={false}>
                        <Match id={41} height={MATCH_HEIGHT} margin={`${FIRST_ROUND_MATCH_GAP + 1}px 0 0 0`}></Match>
                        <Match id={42} height={MATCH_HEIGHT} margin={`${SECOND_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={43} height={MATCH_HEIGHT} margin={`${SECOND_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={44} height={MATCH_HEIGHT} margin={`${SECOND_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                    </SecondRound>
                    <FirstRound>
                        <Match id={17} height={MATCH_HEIGHT} margin="0"></Match>
                        <Match id={18} height={MATCH_HEIGHT} margin={`${FIRST_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={19} height={MATCH_HEIGHT} margin={`${FIRST_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={20} height={MATCH_HEIGHT} margin={`${FIRST_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={21} height={MATCH_HEIGHT} margin={`${FIRST_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={22} height={MATCH_HEIGHT} margin={`${FIRST_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={23} height={MATCH_HEIGHT} margin={`${FIRST_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={24} height={MATCH_HEIGHT} margin={`${FIRST_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                    </FirstRound>
                </RightQuarter>
            </RowHalf>
            <SemiFinals>
                <Match id={61} height={MATCH_HEIGHT} margin="-7px 25px 0 0"></Match>
                <Match id={62} height={MATCH_HEIGHT} margin="-7px 0 0 25px"></Match>
            </SemiFinals>
            <Final>
                <Match id={63} height={MATCH_HEIGHT} margin="24px 0 0 0"></Match>
            </Final>
            <RowHalf>
                <LeftQuarter>
                    <FirstRound>
                        <Match id={9} height={MATCH_HEIGHT} margin="0"></Match>
                        <Match id={10} height={MATCH_HEIGHT} margin={`${FIRST_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={11} height={MATCH_HEIGHT} margin={`${FIRST_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={12} height={MATCH_HEIGHT} margin={`${FIRST_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={13} height={MATCH_HEIGHT} margin={`${FIRST_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={14} height={MATCH_HEIGHT} margin={`${FIRST_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={15} height={MATCH_HEIGHT} margin={`${FIRST_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={16} height={MATCH_HEIGHT} margin={`${FIRST_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                    </FirstRound>
                    <SecondRound sideLeft={true}>
                        <Match id={37} height={MATCH_HEIGHT} margin="51px 0 0 0"></Match>
                        <Match id={38} height={MATCH_HEIGHT} margin={`${SECOND_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={39} height={MATCH_HEIGHT} margin={`${SECOND_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={40} height={MATCH_HEIGHT} margin={`${SECOND_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                    </SecondRound>
                    <Sweet16 sideLeft={true}>
                        <Match id={51} height={MATCH_HEIGHT} margin="111px 0 0 0"></Match>
                        <Match id={52} height={MATCH_HEIGHT} margin={`${SWEET16_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                    </Sweet16>
                    <Elite8 sideLeft={true}>
                        <Match id={58} height={MATCH_HEIGHT} margin="231px 0 0 0"></Match>
                    </Elite8>
                </LeftQuarter>
                <RightQuarter>
                    <Elite8 sideLeft={false}>
                        <Match id={60} height={MATCH_HEIGHT} margin="231px 0 0 0"></Match>
                    </Elite8>
                    <Sweet16 sideLeft={false}>
                        <Match id={55} height={MATCH_HEIGHT} margin="111px 0 0 0"></Match>
                        <Match id={56} height={MATCH_HEIGHT} margin={`${SWEET16_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                    </Sweet16>
                    <SecondRound sideLeft={false}>
                        <Match id={45} height={MATCH_HEIGHT} margin="51px 0 0 0"></Match>
                        <Match id={46} height={MATCH_HEIGHT} margin={`${SECOND_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={47} height={MATCH_HEIGHT} margin={`${SECOND_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={48} height={MATCH_HEIGHT} margin={`${SECOND_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                    </SecondRound>
                    <FirstRound>
                        <Match id={25} height={MATCH_HEIGHT} margin="0"></Match>
                        <Match id={26} height={MATCH_HEIGHT} margin={`${FIRST_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={27} height={MATCH_HEIGHT} margin={`${FIRST_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={28} height={MATCH_HEIGHT} margin={`${FIRST_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={29} height={MATCH_HEIGHT} margin={`${FIRST_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={30} height={MATCH_HEIGHT} margin={`${FIRST_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={31} height={MATCH_HEIGHT} margin={`${FIRST_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                        <Match id={32} height={MATCH_HEIGHT} margin={`${FIRST_ROUND_MATCH_GAP}px 0 0 0`}></Match>
                    </FirstRound>
                </RightQuarter>
            </RowHalf>
        </Container>
    );
};

const MATCH_HEIGHT = 52;
const FIRST_ROUND_MATCH_GAP = 8;
const SECOND_ROUND_MATCH_GAP = 1 * (MATCH_HEIGHT + FIRST_ROUND_MATCH_GAP) + FIRST_ROUND_MATCH_GAP;
const SWEET16_ROUND_MATCH_GAP = 3 * (MATCH_HEIGHT + FIRST_ROUND_MATCH_GAP) + FIRST_ROUND_MATCH_GAP;

const Container = styled.div``;

const RowHalf = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
`;

const LeftQuarter = styled.div`
    display: flex;
`;

const RightQuarter = styled.div`
    display: flex;
    margin-left: 208px;
`;

const FirstRound = styled.div`
    display: flex;
    flex-direction: column;
    z-index: 40;
`;

const SecondRound = styled.div<{ sideLeft: boolean }>`
    display: flex;
    flex-direction: column;
    ${(props) => `${props.sideLeft ? 'margin-left: ' : 'margin-right: '}15px;`}
    z-index: 30;
`;

const Sweet16 = styled.div<{ sideLeft: boolean }>`
    display: flex;
    flex-direction: column;
    ${(props) => `${props.sideLeft ? 'margin-left: ' : 'margin-right: '}-24px;`}
    z-index: 20;
`;

const Elite8 = styled.div<{ sideLeft: boolean }>`
    display: flex;
    flex-direction: column;
    ${(props) => `${props.sideLeft ? 'margin-left: ' : 'margin-right: '}-37px;`}
    z-index: 10;
`;

const SemiFinals = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    height: 38px;
`;

const Final = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    height: 0;
`;

export default Brackets;
