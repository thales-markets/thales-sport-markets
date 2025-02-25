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
    setSportParam: (param: SportFilter) => void;
    setTagParam: any;
    openMarketsCountPerTag: any;
    liveMarketsCountPerTag: any;
    playerPropsMarketsCountPerTag: any;
};

const SportTags: React.FC<SportTagsProps> = ({
    sport,
    onSportClick,
    sportCount,
    showActive,
    tags,
    setSportParam,
    setTagParam,
    openMarketsCountPerTag,
    liveMarketsCountPerTag,
    playerPropsMarketsCountPerTag,
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const sportFilter = useSelector(getSportFilter);
    const tagFilter = useSelector(getTagFilter);

    const [isOpen, setIsOpen] = useState(sport == sportFilter && sport !== SportFilter.All);
    const open = useMemo(() => sport !== SportFilter.All && isOpen, [isOpen, sport]);

    return (
        <React.Fragment>
            <SportFilterDetails
                selected={sportFilter === sport}
                sport={sport}
                onClick={() => {
                    if (tagFilter.length == 0 || sportFilter === SportFilter.PlayerProps) {
                        setIsOpen(!open);
                    }
                    onSportClick();
                }}
                onArrowClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!open);
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
                setSportParam={setSportParam}
                setTagFilter={(tagFilter: Tags) => dispatch(setTagFilter(tagFilter))}
                setTagParam={setTagParam}
                openMarketsCountPerTag={openMarketsCountPerTag}
                liveMarketsCountPerTag={liveMarketsCountPerTag}
                playerPropsMarketsCountPerTag={playerPropsMarketsCountPerTag}
                showActive={showActive}
                showLive={sport == SportFilter.Live}
                sport={sport}
            ></TagsDropdown>
        </React.Fragment>
    );
};

export default SportTags;
