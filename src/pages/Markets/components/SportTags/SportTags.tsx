import { SportFilterEnum } from 'enums/markets';
import { t } from 'i18next';
import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSportFilter, getTagFilter, setTagFilter } from 'redux/modules/market';
import { Tags } from 'types/markets';
import SportFilter from '../SportFilter/SportFilter';
import TagsDropdown from '../TagsDropdown';

type SportTagsProps = {
    onSportClick: () => void;
    sport: SportFilterEnum;
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
    const dispatch = useDispatch();
    const sportFilter = useSelector(getSportFilter);
    const tagFilter = useSelector(getTagFilter);

    const [isOpen, setIsOpen] = useState(sport == sportFilter && sport !== SportFilterEnum.All);

    const open = useMemo(() => sport == sportFilter && sport !== SportFilterEnum.All && isOpen, [
        isOpen,
        sport,
        sportFilter,
    ]);

    return (
        <React.Fragment>
            <SportFilter
                selected={sportFilter === sport}
                sport={sport}
                onClick={() => {
                    setIsOpen(!open);
                    onSportClick();
                }}
                key={sport}
                count={sportCount}
                open={open}
            >
                {t(`market.filter-label.sport.${sport.toLowerCase()}`)}
            </SportFilter>
            <TagsDropdown
                sport={sport}
                open={open}
                key={sport + '1'}
                tags={tags}
                tagFilter={tagFilter}
                setTagFilter={(tagFilter: Tags) => dispatch(setTagFilter(tagFilter))}
                setTagParam={setTagParam}
                openMarketsCountPerTag={openMarketsCountPerTag}
                liveMarketsCountPerTag={liveMarketsCountPerTag}
                showActive={showActive}
                showLive={sportFilter == SportFilterEnum.Live}
            ></TagsDropdown>
        </React.Fragment>
    );
};

export default SportTags;
