import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import { GamesOnDate } from 'types/markets';
import { formatDayOfWeek, formatShortDateNoYear } from 'utils/formatters/date';
import Hammer from 'hammerjs';

type HeaderDatepickerProps = {
    gamesPerDay: GamesOnDate[];
    dateFilter: string;
    setDateFilter: (value: any) => void;
    setStartDate: (value: any) => void;
    setEndDate: (value: any) => void;
};

const DATES_TO_SHOW = 7;

const HeaderDatepicker: React.FC<HeaderDatepickerProps> = ({
    gamesPerDay,
    dateFilter,
    setStartDate,
    setEndDate,
    setDateFilter,
}) => {
    const [farLeftDateIndex, setFarLeftDateIndex] = useState(0);
    const [hammerManager, setHammerManager] = useState<any>();

    const moveLeft = () => {
        if (farLeftDateIndex === 0) setFarLeftDateIndex(0);
        if (farLeftDateIndex > 0) setFarLeftDateIndex(farLeftDateIndex - 1);
    };

    const moveRight = () => {
        setFarLeftDateIndex(
            farLeftDateIndex + DATES_TO_SHOW < gamesPerDay.length ? farLeftDateIndex + 1 : farLeftDateIndex
        );
    };

    const slicedDates = useMemo(() => {
        if (gamesPerDay.length) {
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
                    const swipe = new Hammer.Swipe();
                    hammer.add(swipe);
                    hammer.on('swipeleft', moveRight);
                    hammer.on('swiperight', moveLeft);
                }
            }
        }
        return gamesPerDay.slice(
            farLeftDateIndex,
            farLeftDateIndex === 0 ? DATES_TO_SHOW : farLeftDateIndex + DATES_TO_SHOW
        );
    }, [gamesPerDay, farLeftDateIndex]);

    return (
        <Wrapper id="wrapper-cards">
            {gamesPerDay.length > 0 ? (
                <>
                    <LeftIcon onClick={moveLeft} disabled={farLeftDateIndex == 0} />
                    {slicedDates.map((data: GamesOnDate, index: number) => (
                        <DateContainer
                            key={index}
                            selected={dateFilter === data.date}
                            onClick={() => {
                                setStartDate(null);
                                setEndDate(null);
                                setDateFilter(dateFilter === data.date ? '' : data.date);
                            }}
                        >
                            <DayLabel>{formatDayOfWeek(new Date(data.date)).toUpperCase()}</DayLabel>
                            <DateLabel selected={dateFilter === data.date}>
                                {formatShortDateNoYear(new Date(data.date)).toUpperCase()}
                            </DateLabel>
                            <GamesNumberLabel>{data.numberOfGames + ' games'}</GamesNumberLabel>
                        </DateContainer>
                    ))}
                    <RightIcon onClick={moveRight} disabled={farLeftDateIndex + DATES_TO_SHOW >= gamesPerDay?.length} />
                </>
            ) : (
                <></>
            )}
        </Wrapper>
    );
};

const Wrapper = styled.div`
    display: flex;
    flex-direction: row;
    margin-bottom: 35px;
    align-items: center;
    @media (max-width: 1250px) and (min-width: 769px) {
        & > div:nth-of-type(4),
        & > div:last-of-type {
            display: none;
        }
    }

    @media (max-width: 768px) {
        & > div {
            box-shadow: var(--shadow);
        }
        & > div:first-of-type,
        & > div:last-of-type {
            opacity: 0.5;
            box-shadow: none;
        }
    }

    @media (max-width: 568px) {
        & > div {
            opacity: 0.5;
        }

        & > div:nth-of-type(3) {
            opacity: 1;
            box-shadow: var(--shadow);
        }
    }
`;

const RightIcon = styled.i<{ disabled?: boolean }>`
    font-size: 60px;
    font-weight: 700;
    cursor: pointer;
    pointer-events: ${(props) => (props?.disabled ? 'none' : 'auto')};
    display: ${(props) => (props?.disabled ? 'none' : '')};
    &:before {
        font-family: ExoticIcons !important;
        content: '\\004B';
        color: ${(props) => props.theme.button.textColor.primary};
        cursor: pointer;
        pointer-events: ${(props) => (props?.disabled ? 'none' : 'auto')};
    }
`;

const LeftIcon = styled.i<{ disabled?: boolean }>`
    font-size: 60px;
    font-weight: 700;
    cursor: pointer;
    pointer-events: ${(props) => (props?.disabled ? 'none' : 'auto')};
    display: ${(props) => (props?.disabled ? 'none' : '')};
    &:before {
        font-family: ExoticIcons !important;
        content: '\\0041';
        color: ${(props) => props.theme.button.textColor.primary};
        cursor: pointer;
        pointer-events: ${(props) => (props?.disabled ? 'none' : 'auto')};
    }
`;

const DateContainer = styled(FlexDivColumn)<{ selected?: boolean }>`
    margin-top: 10px;
    width: 80px;
    align-items: center;
    justify-content: flex-end;
    cursor: pointer;
    &:not(:last-of-type) {
        border-right: 2px solid ${(props) => props.theme.borderColor.secondary};
    }
`;

const DayLabel = styled.span`
    font-style: normal;
    font-weight: 700;
    font-size: 20px;
    line-height: 24px;
`;
const DateLabel = styled.span<{ selected?: boolean }>`
    font-style: normal;
    font-weight: 300;
    font-size: 14.8909px;
    line-height: 17px;
    color: ${(props) => (props.selected ? props.theme.textColor.quaternary : props.theme.textColor.primary)};
`;
const GamesNumberLabel = styled.span`
    font-style: normal;
    font-weight: 600;
    font-size: 11px;
    line-height: 13px;
    color: ${(props) => props.theme.textColor.secondary};
`;

export default HeaderDatepicker;
