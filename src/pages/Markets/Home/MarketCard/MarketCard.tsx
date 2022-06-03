import {
    MatchDate,
    MatchInfo,
    MatchInfoColumn,
    MatchParticipantImageContainer,
    MatchParticipantImage,
    MatchParticipantName,
    OddsLabel,
    MatchVSLabel,
} from 'components/common';
import { TAGS_LIST } from 'constants/tags';
import Tags from 'pages/Markets/components/Tags';
import useNormalizedOddsQuery from 'queries/markets/useNormalizedOddsQuery';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
// import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { AccountPosition, SportMarketInfo } from 'types/markets';
import { formatDateWithTime } from 'utils/formatters/date';
import { isClaimAvailable } from 'utils/markets';

type MarketCardProps = {
    market: SportMarketInfo;
    accountPosition?: AccountPosition;
};

const MarketCard: React.FC<MarketCardProps> = ({ market, accountPosition }) => {
    // const { t } = useTranslation();
    const claimAvailable = isClaimAvailable(market, accountPosition);
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const [sportMarketWithNormalizedOdds, setSportMarketWithNormalizedOdds] = useState<SportMarketInfo>(market);
    const normalizedOddsQuery = useNormalizedOddsQuery(market, networkId, { enabled: isAppReady });

    useEffect(() => {
        if (normalizedOddsQuery.isSuccess && normalizedOddsQuery.data) {
            setSportMarketWithNormalizedOdds(normalizedOddsQuery.data);
        }
    }, [normalizedOddsQuery.isSuccess, normalizedOddsQuery.data]);

    return (
        <Container isClaimAvailable={claimAvailable}>
            <MatchDate>{formatDateWithTime(sportMarketWithNormalizedOdds.maturityDate)}</MatchDate>
            <MatchInfo>
                <MatchInfoColumn>
                    <MatchParticipantImageContainer>
                        <MatchParticipantImage
                            src={`/logos/${
                                TAGS_LIST.find((t) => t.id == sportMarketWithNormalizedOdds.tags[0])?.label
                            }/${sportMarketWithNormalizedOdds.homeTeam.trim().replaceAll(' ', '-').toLowerCase()}.png`}
                        ></MatchParticipantImage>
                    </MatchParticipantImageContainer>
                    <MatchParticipantName>{sportMarketWithNormalizedOdds.homeTeam}</MatchParticipantName>
                    <OddsLabel isUP={sportMarketWithNormalizedOdds.homeOdds >= 0.5}>
                        {sportMarketWithNormalizedOdds.homeOdds.toFixed(2)}
                    </OddsLabel>
                </MatchInfoColumn>
                <MatchInfoColumn>
                    <MatchVSLabel>VS</MatchVSLabel>
                    <MatchParticipantName>{'DRAW'}</MatchParticipantName>
                    <OddsLabel isDraw={true}>{sportMarketWithNormalizedOdds.drawOdds.toFixed(2)}</OddsLabel>
                </MatchInfoColumn>
                <MatchInfoColumn>
                    <MatchParticipantImageContainer>
                        <MatchParticipantImage
                            src={`/logos/${
                                TAGS_LIST.find((t) => t.id == sportMarketWithNormalizedOdds.tags[0])?.label
                            }/${sportMarketWithNormalizedOdds.awayTeam.replaceAll(' ', '-').toLowerCase()}.png`}
                        ></MatchParticipantImage>
                    </MatchParticipantImageContainer>
                    <MatchParticipantName>{sportMarketWithNormalizedOdds.awayTeam}</MatchParticipantName>
                    <OddsLabel isUP={sportMarketWithNormalizedOdds.awayOdds <= 0.5}>
                        {sportMarketWithNormalizedOdds.awayOdds.toFixed(2)}
                    </OddsLabel>
                </MatchInfoColumn>
            </MatchInfo>
            <CardFooter>
                <Tags tags={sportMarketWithNormalizedOdds.tags} />
            </CardFooter>
        </Container>
    );
};

const Container = styled(FlexDivColumnCentered)<{ isClaimAvailable: boolean }>`
    // border: ${(props) => (props.isClaimAvailable ? 2 : 1)}px solid
    //     ${(props) => (props.isClaimAvailable ? props.theme.borderColor.secondary : props.theme.borderColor.primary)};
    box-sizing: border-box;
    border-radius: 14px;
    padding: 16px 19px;
    margin: 20px 10px;
    max-height: 275px;
    background: ${(props) => props.theme.background.secondary};
    &:hover {
        border-color: transparent;
        background-origin: border-box;
    }
`;

// const Checkmark = styled.span`
//     :after {
//         content: '';
//         position: absolute;
//         left: -17px;
//         top: -1px;
//         width: 5px;
//         height: 14px;
//         border: solid ${(props) => props.theme.borderColor.primary};
//         border-width: 0 3px 3px 0;
//         -webkit-transform: rotate(45deg);
//         -ms-transform: rotate(45deg);
//         transform: rotate(45deg);
//     }
// `;

const CardFooter = styled(FlexDivRow)`
    align-items: center;
    justify-content: center;
`;

export default MarketCard;
