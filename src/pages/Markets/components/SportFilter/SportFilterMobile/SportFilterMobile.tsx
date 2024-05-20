import liveAnimationData from 'assets/lotties/live-markets-filter.json';
import { SportFilterEnum } from 'enums/markets';
import { Sport } from 'enums/sports';
import Lottie from 'lottie-react';
import React, { CSSProperties, Dispatch, SetStateAction, useContext } from 'react';
import { ScrollMenu, VisibilityContext, publicApiType } from 'react-horizontal-scrolling-menu';
import 'react-horizontal-scrolling-menu/dist/styles.css';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivColumnCentered, FlexDivRowCentered } from 'styles/common';
import { TagInfo, Tags } from 'types/markets';
import { getSportLeagueIds } from 'utils/sports';

type SportFilterMobileProps = {
    sportFilter: string;
    tagsList: Tags;
    setSportFilter: (value: SportFilterEnum) => void;
    setSportParam: (val: string) => void;
    setTagFilter: (value: Tags) => void;
    setTagParam: (val: string) => void;
    setAvailableTags: Dispatch<SetStateAction<Tags>>;
};

const LeftArrow: React.FC = () => {
    const visibility = useContext<publicApiType>(VisibilityContext);
    const isFirstItemVisible = visibility.useIsVisible('first', true);

    return (
        <ArrowIcon
            onClick={() => visibility.scrollPrev()}
            className="icon icon--arrow-down"
            hide={isFirstItemVisible}
            isLeft
        ></ArrowIcon>
    );
};

const RightArrow: React.FC = () => {
    const visibility = useContext<publicApiType>(VisibilityContext);
    const isLastItemVisible = visibility.useIsVisible('last', false);

    return (
        <ArrowIcon
            className="icon icon--arrow-down"
            onClick={() => visibility.scrollNext()}
            hide={isLastItemVisible}
        ></ArrowIcon>
    );
};

const SportFilterMobile: React.FC<SportFilterMobileProps> = ({
    sportFilter,
    tagsList,
    setSportFilter,
    setSportParam,
    setTagFilter,
    setTagParam,
    setAvailableTags,
}) => {
    return (
        <Container>
            <NoScrollbarContainer>
                <ScrollMenu LeftArrow={LeftArrow} RightArrow={RightArrow}>
                    {Object.values(SportFilterEnum).map((filterItem: any, index) => {
                        return (
                            <LabelContainer
                                key={index}
                                itemID={`${filterItem}`}
                                className={`${filterItem == sportFilter ? 'selected' : ''}`}
                                onClick={() => {
                                    if (filterItem !== sportFilter) {
                                        setSportFilter(filterItem);
                                        setSportParam(filterItem);
                                        setTagFilter([]);
                                        setTagParam('');
                                        if (filterItem === SportFilterEnum.All) {
                                            setAvailableTags(tagsList);
                                        } else {
                                            const tagsPerSport = getSportLeagueIds(filterItem as Sport);
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
                                        setAvailableTags(tagsList);
                                    }
                                }}
                            >
                                {filterItem == SportFilterEnum.Live ? (
                                    <Lottie
                                        autoplay={true}
                                        animationData={liveAnimationData}
                                        loop={true}
                                        style={liveBlinkStyleMobile}
                                    />
                                ) : (
                                    <FlexDivColumnCentered>
                                        <SportIcon
                                            className={`icon icon--${
                                                filterItem == SportFilterEnum.All ? 'logo' : filterItem.toLowerCase()
                                            }`}
                                        />
                                    </FlexDivColumnCentered>
                                )}
                            </LabelContainer>
                        );
                    })}
                </ScrollMenu>
            </NoScrollbarContainer>
        </Container>
    );
};

const Container = styled(FlexDivRowCentered)`
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 13px;
    letter-spacing: 0.035em;
    cursor: pointer;
    height: 36px;
    position: relative;
    color: ${(props) => props.theme.textColor.secondary};
    margin-bottom: 5px;
    justify-content: space-around;
    width: 100%;
`;

const LabelContainer = styled(FlexDivColumn)`
    &.selected,
    &:hover {
        color: ${(props) => props.theme.textColor.quaternary};
    }
    height: 36px;
    width: 30px;
    margin: 0 10px;
`;

const SportIcon = styled.i`
    font-size: 30px;
`;

export const NoScrollbarContainer = styled.div`
    width: 100%;
    overflow: hidden;
    & .react-horizontal-scrolling-menu--scroll-container {
        ::-webkit-scrollbar {
            display: none;
        }
    }
    & .react-horizontal-scrolling-menu--scroll-container {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
    .react-horizontal-scrolling-menu--inner-wrapper {
        align-items: center;
    }
    .react-horizontal-scrolling-menu--item {
        min-width: 16.66%;
        justify-content: center;
        display: flex;
    }
`;

export const ArrowIcon = styled.i<{ hide: boolean; isLeft?: boolean }>`
    cursor: pointer;
    font-size: 20px;
    transform: ${(props) => (props.isLeft ? 'rotate(90deg)' : 'rotate(270deg)')};
    color: ${(props) => props.theme.textColor.secondary};
    opacity: ${(props) => (props.hide ? '0.2' : '1')};
    padding: 0px 10px;
`;

const liveBlinkStyleMobile: CSSProperties = {
    width: 38,
    marginTop: '-2px',
    marginLeft: '-6px',
};

export default SportFilterMobile;
