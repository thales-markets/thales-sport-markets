import {
    MatchDate,
    MatchInfoColumn,
    MatchParticipantImage,
    MatchParticipantImageContainer,
    MatchVSLabel,
} from 'components/common';
import MarketTitle from 'pages/Markets/components/MarketTitle';
import React, { useState } from 'react';
import { MarketData } from 'types/markets';
import { formatDateWithTime } from 'utils/formatters/date';
import { getTeamImageSource } from 'utils/images';
import { formatPercentage } from '../../../../utils/formatters/number';
import {
    InfoRow,
    InfoTitle,
    InfoValue,
    MarketContainer,
    MatchInfo,
    OddsContainer,
    Option,
    OptionTeamName,
    Pick,
    Slider,
    SliderContainer,
    SliderInfo,
    StatusSourceContainer,
    StatusSourceInfo,
    SliderInfoTitle,
    SliderInfoValue,
    AmountToBuyInput,
    SubmitButton,
} from './styled-components/MarketDetails';
import { FlexDivCentered } from '../../../../styles/common';

type MarketDetailsProps = {
    market: MarketData;
};

const MarketDetails: React.FC<MarketDetailsProps> = ({ market }) => {
    const [selectedSide, setSelectedSide] = useState<number | null>(null);

    return (
        <MarketContainer>
            <MarketTitle fontSize={25} marginBottom={40}></MarketTitle>
            <MatchInfo>
                <MatchInfoColumn>
                    <MatchParticipantImageContainer>
                        <MatchParticipantImage src={getTeamImageSource(market.homeTeam, market.tags[0])} />
                    </MatchParticipantImageContainer>
                </MatchInfoColumn>
                <MatchInfoColumn>
                    <MatchVSLabel>VS</MatchVSLabel>
                </MatchInfoColumn>
                <MatchInfoColumn>
                    <MatchParticipantImageContainer>
                        <MatchParticipantImage src={getTeamImageSource(market.awayTeam, market.tags[0])} />
                    </MatchParticipantImageContainer>
                </MatchInfoColumn>
            </MatchInfo>
            <MatchDate>{formatDateWithTime(market.maturityDate)}</MatchDate>
            <OddsContainer>
                <Pick selected={selectedSide === 1} onClick={() => setSelectedSide(selectedSide === 1 ? null : 1)}>
                    <Option color="#50CE99">1</Option>
                    <OptionTeamName>{market.homeTeam.toUpperCase()}</OptionTeamName>
                    <InfoRow>
                        <InfoTitle>ODDS:</InfoTitle>
                        <InfoValue>{market.homeOdds.toFixed(2)}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                        <InfoTitle>ROI:</InfoTitle>
                        <InfoValue>{formatPercentage(1 / market.homeOdds)}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                        <InfoTitle>POOL SIZE:</InfoTitle>
                        <InfoValue>$20,000</InfoValue>
                    </InfoRow>
                </Pick>
                {!!market.drawOdds && (
                    <Pick selected={selectedSide === 0} onClick={() => setSelectedSide(selectedSide === 0 ? null : 0)}>
                        <Option color="#40A1D8">X</Option>
                        <OptionTeamName>DRAW</OptionTeamName>
                        <InfoRow>
                            <InfoTitle>ODDS:</InfoTitle>
                            <InfoValue>{market.drawOdds.toFixed(2)}</InfoValue>
                        </InfoRow>
                        <InfoRow>
                            <InfoTitle>ROI:</InfoTitle>
                            <InfoValue>{formatPercentage(market.drawOdds ? 1 / market.drawOdds : 0)}</InfoValue>
                        </InfoRow>
                        <InfoRow>
                            <InfoTitle>POOL SIZE:</InfoTitle>
                            <InfoValue>$20,000</InfoValue>
                        </InfoRow>
                    </Pick>
                )}
                <Pick selected={selectedSide === 2} onClick={() => setSelectedSide(selectedSide === 2 ? null : 2)}>
                    <Option color="#E26A78">2</Option>
                    <OptionTeamName>{market.awayTeam.toUpperCase()}</OptionTeamName>
                    <InfoRow>
                        <InfoTitle>ODDS:</InfoTitle>
                        <InfoValue>{market.awayOdds.toFixed(2)}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                        <InfoTitle>ROI:</InfoTitle>
                        <InfoValue>{formatPercentage(1 / market.awayOdds)}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                        <InfoTitle>POOL SIZE:</InfoTitle>
                        <InfoValue>$20,000</InfoValue>
                    </InfoRow>
                </Pick>
            </OddsContainer>
            <SliderContainer>
                <Slider
                    type="range"
                    min={100}
                    max={0}
                    value={1}
                    step={'0.1'}
                    // onChange={(event) => onChangeHandler(event)}
                    // disabled={disabled}
                    // onFocus={onFocus}
                    // onBlur={onBlur}
                />
                <SliderInfo>
                    <SliderInfoTitle>Available to buy:</SliderInfoTitle>
                    <SliderInfoValue>$ 270,745</SliderInfoValue>
                </SliderInfo>
                <SliderInfo>
                    <SliderInfoTitle>Skew:</SliderInfoTitle>
                    <SliderInfoValue>1%</SliderInfoValue>
                </SliderInfo>
            </SliderContainer>
            <FlexDivCentered>AMOUNT TO BUY:</FlexDivCentered>
            <FlexDivCentered>
                <AmountToBuyInput type="number" />
            </FlexDivCentered>
            <FlexDivCentered>
                <SliderInfo>
                    <SliderInfoTitle>Potential profit:</SliderInfoTitle>
                    <SliderInfoValue>$ 204,400.00 + 137.25%</SliderInfoValue>
                </SliderInfo>
            </FlexDivCentered>
            <FlexDivCentered>
                <SubmitButton>BUY</SubmitButton>
            </FlexDivCentered>
            <StatusSourceContainer>
                <StatusSourceInfo />
                <StatusSourceInfo />
            </StatusSourceContainer>
        </MarketContainer>
    );
};

export default MarketDetails;
