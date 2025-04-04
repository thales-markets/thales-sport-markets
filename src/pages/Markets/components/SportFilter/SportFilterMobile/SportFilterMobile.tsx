import liveAnimationData from 'assets/lotties/live-markets-filter.json';
import { SportFilter } from 'enums/markets';
import Lottie from 'lottie-react';
import { LeagueMap, Sport, getSportLeagueIds } from 'overtime-utils';
import React, { CSSProperties, Dispatch, SetStateAction, useContext } from 'react';
import { ScrollMenu, VisibilityContext, publicApiType } from 'react-horizontal-scrolling-menu';
import 'react-horizontal-scrolling-menu/dist/styles.css';
import { useDispatch, useSelector } from 'react-redux';
import { getSportFilter, setSportFilter, setTagFilter } from 'redux/modules/market';
import styled, { useTheme } from 'styled-components';
import { FlexDivColumn, FlexDivColumnCentered, FlexDivRowCentered } from 'styles/common';
import { TagInfo, Tags } from 'types/markets';
import { getDefaultPlayerPropsLeague } from 'utils/marketsV2';
import useQueryParam from '../../../../../utils/useQueryParams';

type SportFilterMobileProps = {
    tagsList: Tags;
    setAvailableTags: Dispatch<SetStateAction<Tags>>;
    playerPropsCountPerTag: Record<number, number>;
    openMarketsCountPerSport: Record<SportFilter, number>;
    liveMarketsCountPerSport: Record<SportFilter, number>;
    boostedMarketsCount: number;
    showActive: boolean;
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
    tagsList,
    setAvailableTags,
    playerPropsCountPerTag,
    showActive,
    openMarketsCountPerSport,
    liveMarketsCountPerSport,
    boostedMarketsCount,
}) => {
    const dispatch = useDispatch();
    const sportFilter = useSelector(getSportFilter);
    const [, setSportParam] = useQueryParam('sport', '');
    const [, setTagParam] = useQueryParam('tag', '');

    const theme = useTheme();

    return (
        <Container>
            <NoScrollbarContainer>
                <ScrollMenu LeftArrow={LeftArrow} RightArrow={RightArrow}>
                    {Object.values(SportFilter)
                        .filter(
                            (filterItem: SportFilter) =>
                                (showActive &&
                                    filterItem !== SportFilter.Live &&
                                    openMarketsCountPerSport[filterItem] > 0) ||
                                (showActive && filterItem === SportFilter.Boosted && boostedMarketsCount > 0) ||
                                (showActive &&
                                    filterItem === SportFilter.Live &&
                                    liveMarketsCountPerSport[filterItem] > 0) ||
                                !showActive ||
                                filterItem === SportFilter.Favourites
                        )
                        .map((filterItem: any, index) => {
                            return (
                                <LabelContainer
                                    key={index}
                                    itemID={`${filterItem}`}
                                    className={`${filterItem == sportFilter ? 'selected' : ''}`}
                                    onClick={() => {
                                        if (filterItem !== sportFilter) {
                                            dispatch(setSportFilter(filterItem));
                                            setSportParam(filterItem);
                                            dispatch(
                                                setTagFilter(
                                                    filterItem === SportFilter.PlayerProps
                                                        ? [
                                                              LeagueMap[
                                                                  getDefaultPlayerPropsLeague(playerPropsCountPerTag)
                                                              ],
                                                          ]
                                                        : []
                                                )
                                            );
                                            setTagParam(
                                                filterItem === SportFilter.PlayerProps
                                                    ? LeagueMap[getDefaultPlayerPropsLeague(playerPropsCountPerTag)]
                                                          .label
                                                    : ''
                                            );
                                            if (
                                                filterItem === SportFilter.All ||
                                                filterItem === SportFilter.PlayerProps
                                            ) {
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
                                            dispatch(setSportFilter(SportFilter.All));
                                            setSportParam(SportFilter.All);
                                            dispatch(setTagFilter([]));
                                            setTagParam('');
                                            setAvailableTags(tagsList);
                                        }
                                    }}
                                >
                                    {filterItem == SportFilter.Live ? (
                                        <Lottie
                                            autoplay={true}
                                            animationData={liveAnimationData}
                                            loop={true}
                                            style={liveBlinkStyleMobile}
                                        />
                                    ) : filterItem == SportFilter.Boosted ? (
                                        <FlexDivColumnCentered>
                                            <SportIcon
                                                color={theme.overdrop.textColor.primary}
                                                className={`icon icon--fire`}
                                            />
                                        </FlexDivColumnCentered>
                                    ) : (
                                        <FlexDivColumnCentered>
                                            <SportIcon
                                                className={`icon icon--${
                                                    filterItem == SportFilter.All ? 'logo' : filterItem.toLowerCase()
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
    margin-top: 10px;
`;

const LabelContainer = styled(FlexDivColumn)`
    &.selected {
        color: ${(props) => props.theme.textColor.quaternary};
    }
    height: 36px;
    width: 30px;
    margin: 0 10px;
`;

const SportIcon = styled.i<{ color?: string }>`
    font-size: 30px;
    ::before {
        color: ${(props) => props.color || 'ingerit'};
    }
`;

const NoScrollbarContainer = styled.div`
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

const ArrowIcon = styled.i<{ hide: boolean; isLeft?: boolean }>`
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
