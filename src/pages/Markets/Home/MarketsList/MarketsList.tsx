import { TAGS_FLAGS, TAGS_LIST } from 'constants/tags';
import React, { useState } from 'react';
import Flag from 'react-flagpack';
import styled from 'styled-components';
import { AccountPositionsMap, SportMarkets, TagInfo } from 'types/markets';
import MarketListCard from '../MarketListCard';

type MarketsList = {
    markets: SportMarkets;
    league: number;
    language: string;
    accountPositions: AccountPositionsMap;
};

const MarketsList: React.FC<MarketsList> = ({ markets, league, language, accountPositions }) => {
    const [hideLeague, setHideLeague] = useState<boolean>(false);
    const leagueName = TAGS_LIST.find((t: TagInfo) => t.id == league)?.label;
    return (
        <>
            <LeagueCard>
                <LeagueInfo
                    onClick={() => {
                        if (hideLeague) {
                            setHideLeague(false);
                        } else {
                            setHideLeague(true);
                        }
                    }}
                >
                    {LeagueFlag(Number(league))}
                    <LeagueName>{leagueName}</LeagueName>
                    {hideLeague ? (
                        <ArrowIcon className={`icon-exotic icon-exotic--right`} />
                    ) : (
                        <ArrowIcon down={true} className={`icon-exotic icon-exotic--down`} />
                    )}
                </LeagueInfo>
            </LeagueCard>
            <GamesContainer hidden={hideLeague}>
                {markets.map((market: any, index: number) => {
                    return (
                        <MarketListCard
                            language={language}
                            market={market}
                            key={index + 'list'}
                            accountPositions={accountPositions[market.address]}
                        />
                    );
                })}
            </GamesContainer>
        </>
    );
};

const LeagueFlag = (tagId: number | any) => {
    switch (tagId) {
        case TAGS_FLAGS.NCAA_FOOTBALL:
            return <Flag size="l" code="USA" />;
        case TAGS_FLAGS.NFL:
            return <Flag size="l" code="USA" />;
        case TAGS_FLAGS.MLB:
            return <Flag size="l" code="USA" />;
        case TAGS_FLAGS.NBA:
            return <Flag size="l" code="USA" />;
        case TAGS_FLAGS.NCAA_BASKETBALL:
            return <Flag size="l" code="USA" />;
        case TAGS_FLAGS.NHL:
            return <Flag size="l" code="USA" />;
        case TAGS_FLAGS.WNBA:
            return <Flag size="l" code="USA" />;
        case TAGS_FLAGS.MLS:
            return <Flag size="l" code="USA" />;
        case TAGS_FLAGS.EPL:
            return <Flag size="l" code="GB-ENG" />;
        case TAGS_FLAGS.LIGUE_ONE:
            return <Flag size="l" code="FR" />;
        case TAGS_FLAGS.BUNDESLIGA:
            return <Flag size="l" code="DE" />;
        case TAGS_FLAGS.LA_LIGA:
            return <Flag size="l" code="ES" />;
        case TAGS_FLAGS.SERIE_A:
            return <Flag size="l" code="IT" />;
        default:
            return <FlagWorld alt="World flag" src="/world-flag.png" />;
    }
};

const LeagueCard = styled.div`
    display: flex;
    position: relative;
    flex-direction: row;
    width: 100%;
    padding: 10px 12px;
    border-radius: 5px;
    align-items: center;
    background-color: ${(props) => props.theme.background.primary};
`;

const LeagueInfo = styled.div`
    display: flex;
    position: relative;
    flex-direction: row;
    cursor: pointer;
    align-items: center;
    &:hover {
        cursor: pointer;
        color: ${(props) => props.theme.textColor.quaternary};
    }
`;

const GamesContainer = styled.div<{ hidden?: boolean }>`
    display: ${(props) => (props.hidden ? 'none' : '')};
`;

const FlagWorld = styled.img`
    width: 40px;
    height: 30px;
    border-radius: 1.5px;
    cursor: pointer;
`;

const LeagueName = styled.label`
    font-size: 12px;
    text-transform: uppercase;
    margin-left: 10px;
    &:hover {
        cursor: pointer;
    }
`;

const ArrowIcon = styled.i<{ down?: boolean }>`
    font-size: 16px;
    margin-left: 10px;
    margin-top: ${(props) => (props.down ? '5px' : '')};
    margin-bottom: ${(props) => (props.down ? '' : '2px')};
    &:hover {
        cursor: pointer;
        color: ${(props) => props.theme.textColor.quaternary};
    }
`;

export default MarketsList;
