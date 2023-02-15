import { GlobalFiltersEnum, SportFilterEnum } from 'constants/markets';
import { SPORTS_TAGS_MAP } from 'constants/tags';
import { DIRECTION_HORIZONTAL } from 'hammerjs';
import React, { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { FlexDivRowCentered } from 'styles/common';
import { TagInfo, Tags } from 'types/markets';

type SportFilterMobileProps = {
    sportFilter: string;
    tagsList: Tags;
    setSportFilter: (value: SportFilterEnum) => void;
    setSportParam: (val: string) => void;
    setTagFilter: (value: Tags) => void;
    setTagParam: (val: string) => void;
    setGlobalFilter: (value: GlobalFiltersEnum) => void;
    setGlobalFilterParam: (val: string) => void;
    setDateFilter: (value: number | Date) => void;
    setDateParam: (val: string) => void;
    setAvailableTags: Dispatch<SetStateAction<Tags>>;
};

const SportFilterMobile: React.FC<SportFilterMobileProps> = ({
    sportFilter,
    tagsList,
    setSportFilter,
    setSportParam,
    setTagFilter,
    setTagParam,
    setGlobalFilter,
    setGlobalFilterParam,
    setDateFilter,
    setDateParam,
    setAvailableTags,
}) => {
    const [leftIndex, setLeftIndex] = useState(0);
    const [hammerManager, setHammerManager] = useState<any>();
    const SPORTS_TO_SHOW = 6;

    const moveLeft = useCallback(() => {
        if (leftIndex > 0) setLeftIndex(leftIndex - 1);
    }, [leftIndex]);

    const moveRight = useCallback(() => {
        setLeftIndex(leftIndex + SPORTS_TO_SHOW < Object.values(SportFilterEnum).length ? leftIndex + 1 : leftIndex);
    }, [leftIndex]);

    const slicedSports = useMemo(() => {
        if (Object.values(SportFilterEnum).length) {
            const wrapper = document.getElementById('wrapper-cards');
            if (wrapper) {
                const hammer = new Hammer.Manager(wrapper);
                if (!hammerManager) {
                    setHammerManager(hammer);
                } else {
                    hammerManager.destroy();
                    setHammerManager(hammer);
                }

                if (window.innerWidth <= 1250) {
                    const swipe = new Hammer.Swipe({ direction: DIRECTION_HORIZONTAL });
                    hammer.add(swipe);
                    hammer.on('swipeleft', moveRight);
                    hammer.on('swiperight', moveLeft);
                }
            }
        }

        return Object.values(SportFilterEnum).slice(
            leftIndex,
            leftIndex === 0 ? SPORTS_TO_SHOW : leftIndex + SPORTS_TO_SHOW
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [leftIndex, moveRight, moveLeft]);

    return (
        <Container id="wrapper-cards">
            <LeftIcon onClick={() => (leftIndex !== 0 ? moveLeft() : '')} disabled={leftIndex == 0} />
            {slicedSports.map((filterItem: any, index) => {
                return (
                    <LabelContainer
                        key={index}
                        className={`${filterItem == sportFilter ? 'selected' : ''}`}
                        onClick={() => {
                            if (filterItem !== sportFilter) {
                                setSportFilter(filterItem);
                                setSportParam(filterItem);
                                setTagFilter([]);
                                setTagParam('');
                                setGlobalFilter(GlobalFiltersEnum.OpenMarkets);
                                setGlobalFilterParam(GlobalFiltersEnum.OpenMarkets);
                                if (filterItem === SportFilterEnum.All) {
                                    setDateFilter(0);
                                    setDateParam('');
                                    setAvailableTags(tagsList.sort((a, b) => a.label.localeCompare(b.label)));
                                } else {
                                    const tagsPerSport = SPORTS_TAGS_MAP[filterItem];
                                    if (tagsPerSport) {
                                        const filteredTags = tagsList.filter((tag: TagInfo) =>
                                            tagsPerSport.includes(tag.id)
                                        );
                                        setAvailableTags(filteredTags);
                                    } else {
                                        setAvailableTags([]);
                                    }
                                }
                            } else {
                                setSportFilter(SportFilterEnum.All);
                                setSportParam(SportFilterEnum.All);
                                setTagFilter([]);
                                setTagParam('');
                                setAvailableTags(tagsList.sort((a, b) => a.label.localeCompare(b.label)));
                            }
                        }}
                    >
                        <SportIcon
                            className={`icon icon--${
                                filterItem.toLowerCase() == 'all' ? 'logo' : filterItem.toLowerCase()
                            }`}
                        />
                    </LabelContainer>
                );
            })}

            <RightIcon
                onClick={() => (leftIndex + SPORTS_TO_SHOW < Object.values(SportFilterEnum).length ? moveRight() : '')}
                disabled={leftIndex + SPORTS_TO_SHOW >= Object.values(SportFilterEnum).length}
            />
        </Container>
    );
};

const Container = styled(FlexDivRowCentered)`
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 13px;
    letter-spacing: 0.035em;
    text-transform: uppercase;
    cursor: pointer;
    height: 36px;
    position: relative;
    color: ${(props) => props.theme.textColor.secondary};
    margin-bottom: 5px;
    justify-content: space-around;
    width: 100%;
`;

const LabelContainer = styled(FlexDivRowCentered)`
    &.selected,
    &:hover:not(.disabled) {
        color: ${(props) => props.theme.textColor.quaternary};
    }
    &.disabled {
        cursor: default;
        opacity: 0.4;
    }
    height: 30px;
`;

const SportIcon = styled.i`
    font-size: 30px;
`;

const LeftIcon = styled.i<{ disabled?: boolean }>`
    font-size: 30px;
    font-weight: 700;
    cursor: ${(props) => (props?.disabled ? 'not-allowed' : 'pointer')};
    &:before {
        font-family: ExoticIcons !important;
        content: '\\0041';
        color: ${(props) => props.theme.button.textColor.primary};
        opacity: ${(props) => (props?.disabled ? '0.3' : '')};
        cursor: ${(props) => (props?.disabled ? 'not-allowed' : 'pointer')};
    }
`;

const RightIcon = styled.i<{ disabled?: boolean }>`
    font-size: 30px;
    font-weight: 700;
    cursor: ${(props) => (props?.disabled ? 'not-allowed' : 'pointer')};
    &:before {
        font-family: ExoticIcons !important;
        content: '\\004B';
        color: ${(props) => props.theme.button.textColor.primary};
        opacity: ${(props) => (props?.disabled ? '0.3' : '')};
        cursor: ${(props) => (props?.disabled ? 'not-allowed' : 'pointer')};
    }
`;

export default SportFilterMobile;
