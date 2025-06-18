import { SportFilter } from 'enums/markets';
import { League } from 'overtime-utils';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getSportFilter, getTagFilter, setTagFilter } from 'redux/modules/market';
import { Tags, Tournament } from 'types/markets';
import SportFilterDetails from '../SportFilter';
import TagsDropdown from '../TagsDropdown';

type SportTagsProps = {
    onSportClick: () => void;
    sport: SportFilter;
    sportCount: number;
    showActive: boolean;
    tags: Tags;
    openMarketsCountPerTag: any;
    liveMarketsCountPerTag: any;
    liveMarketsCountPerSport: any;
    playerPropsMarketsCountPerTag: any;
    quickSgpMarketsCountPerTag: Partial<Record<League, number>>;
    playerPropsCountPerTournament: any;
    tournamentsByLeague: Record<number, Tournament[]>;
    marketsCountPerTournament: any;
};

const SportTags: React.FC<SportTagsProps> = ({
    sport,
    onSportClick,
    sportCount,
    showActive,
    tags,
    openMarketsCountPerTag,
    liveMarketsCountPerTag,
    playerPropsMarketsCountPerTag,
    quickSgpMarketsCountPerTag,
    liveMarketsCountPerSport,
    tournamentsByLeague,
    marketsCountPerTournament,
    playerPropsCountPerTournament,
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const sportFilter = useSelector(getSportFilter);
    const tagFilter = useSelector(getTagFilter);

    const [isOpen, setIsOpen] = useState(sport == sportFilter);

    return (
        <React.Fragment>
            <SportFilterDetails
                selected={sportFilter === sport}
                sport={sport}
                onClick={() => {
                    onSportClick();
                    if ((tagFilter.length == 0 && sport === sportFilter) || (sport !== sportFilter && !isOpen)) {
                        setIsOpen(!isOpen);
                    }
                }}
                onArrowClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                key={sport}
                count={sportCount}
                open={isOpen}
            >
                {t(`market.filter-label.sport.${sport.toLowerCase()}`)}
            </SportFilterDetails>
            <TagsDropdown
                open={isOpen}
                key={sport + '1'}
                tags={tags}
                setTagFilter={(tagFilter: Tags) => dispatch(setTagFilter(tagFilter))}
                openMarketsCountPerTag={openMarketsCountPerTag}
                liveMarketsCountPerTag={liveMarketsCountPerTag}
                liveMarketsCountPerSport={liveMarketsCountPerSport}
                playerPropsMarketsCountPerTag={playerPropsMarketsCountPerTag}
                quickSgpMarketsCountPerTag={quickSgpMarketsCountPerTag}
                playerPropsCountPerTournament={playerPropsCountPerTournament}
                showActive={showActive}
                showLive={sport == SportFilter.Live}
                sport={sport}
                tournamentsByLeague={tournamentsByLeague}
                marketsCountPerTournament={marketsCountPerTournament}
            ></TagsDropdown>
        </React.Fragment>
    );
};

export default SportTags;
