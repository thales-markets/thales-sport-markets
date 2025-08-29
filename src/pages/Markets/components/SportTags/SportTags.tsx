import { SportFilter } from 'enums/markets';
import { League } from 'overtime-utils';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getSportFilter, getTagFilter, setTagFilter } from 'redux/modules/market';
import { CountPerTag, Tags } from 'types/markets';
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
    countPerTag: CountPerTag | undefined;
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
    countPerTag,
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
                showActive={showActive}
                showLive={sport == SportFilter.Live}
                sport={sport}
                countPerTag={countPerTag}
            ></TagsDropdown>
        </React.Fragment>
    );
};

export default SportTags;
