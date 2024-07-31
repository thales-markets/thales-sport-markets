import { SportFilter } from 'enums/markets';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getSportFilter, getTagFilter, setTagFilter } from 'redux/modules/market';
import { Tags } from 'types/markets';
import SportFilterDetails from '../SportFilter';
import TagsDropdown from '../TagsDropdown';

type SportTagsProps = {
    onSportClick: () => void;
    sport: SportFilter;
    sportCount: number;
    showActive: boolean;
    tags: Tags;
    setTagParam: any;
    openMarketsCountPerTag: any;
    liveMarketsCountPerTag: any;
};

const SportTags: React.FC<SportTagsProps> = ({
    sport,
    onSportClick,
    sportCount,
    showActive,
    tags,
    setTagParam,
    openMarketsCountPerTag,
    liveMarketsCountPerTag,
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const sportFilter = useSelector(getSportFilter);
    const tagFilter = useSelector(getTagFilter);

    const [isOpen, setIsOpen] = useState(sport == sportFilter && sport !== SportFilter.All);

    const open = useMemo(() => sport == sportFilter && sport !== SportFilter.All && isOpen, [
        isOpen,
        sport,
        sportFilter,
    ]);

    return (
        <React.Fragment>
            <SportFilterDetails
                selected={sportFilter === sport}
                sport={sport}
                onClick={() => {
                    if (tagFilter.length == 0) {
                        setIsOpen(!open);
                    }
                    onSportClick();
                }}
                key={sport}
                count={sportCount}
                open={open}
            >
                {t(`market.filter-label.sport.${sport.toLowerCase()}`)}
            </SportFilterDetails>
            <TagsDropdown
                open={open}
                key={sport + '1'}
                tags={tags}
                tagFilter={tagFilter}
                setTagFilter={(tagFilter: Tags) => dispatch(setTagFilter(tagFilter))}
                setTagParam={setTagParam}
                openMarketsCountPerTag={openMarketsCountPerTag}
                liveMarketsCountPerTag={liveMarketsCountPerTag}
                showActive={showActive}
                showLive={sportFilter == SportFilter.Live}
            ></TagsDropdown>
        </React.Fragment>
    );
};

export default SportTags;
