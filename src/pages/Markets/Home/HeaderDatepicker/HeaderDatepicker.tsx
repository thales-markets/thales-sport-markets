import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import { GamesOnDate } from 'types/markets';
import { formatDayOfWeek, formatShortDateNoYear } from 'utils/formatters/date';
import Hammer, { DIRECTION_HORIZONTAL } from 'hammerjs';
import { useTranslation } from 'react-i18next';

type HeaderDatepickerProps = {
    gamesPerDay: GamesOnDate[];
    dateFilter: string;
    setDateFilter: (value: any) => void;
    setDateParam: (value: any) => void;
};

const HeaderDatepicker: React.FC<HeaderDatepickerProps> = ({
    gamesPerDay,
    dateFilter,
    setDateFilter,
    setDateParam,
}) => {
    const { t } = useTranslation();
    const [farLeftDateIndex, setFarLeftDateIndex] = useState(0);
    const [hammerManager, setHammerManager] = useState<any>();
    const DATES_TO_SHOW = useMemo(() => {
        return Math.min(Math.round(window.innerWidth / 80) - 2, 7);
    }, []);

    const moveLeft = useCallback(() => {
        if (farLeftDateIndex > 0) setFarLeftDateIndex(farLeftDateIndex - 1);
    }, [farLeftDateIndex]);

    const moveRight = useCallback(() => {
        setFarLeftDateIndex(
            farLeftDateIndex + DATES_TO_SHOW < gamesPerDay.length ? farLeftDateIndex + 1 : farLeftDateIndex
        );
    }, [DATES_TO_SHOW, farLeftDateIndex, gamesPerDay.length]);

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
                    const swipe = new Hammer.Swipe({ direction: DIRECTION_HORIZONTAL });
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gamesPerDay, farLeftDateIndex, DATES_TO_SHOW, moveRight, moveLeft]);

    return (
        <Wrapper id="wrapper-cards" hidden={gamesPerDay.length === 0}>
            {gamesPerDay.length > 0 ? (
                <>
                    <LeftIcon
                        onClick={() => (farLeftDateIndex !== 0 ? moveLeft() : '')}
                        disabled={farLeftDateIndex == 0}
                    />
                    {slicedDates.map((data: GamesOnDate, index: number) => (
                        <DateContainer
                            key={index}
                            selected={dateFilter === data.date}
                            onClick={() => {
                                setDateFilter(dateFilter === data.date ? '' : data.date);
                                setDateParam(dateFilter === data.date ? '' : data.date);
                            }}
                        >
                            <DayLabel>
                                {t(`common.days-of-week.${formatDayOfWeek(new Date(data.date)).toLowerCase()}`)}
                            </DayLabel>
                            <DateLabel selected={dateFilter === data.date}>
                                {formatShortDateNoYear(new Date(data.date)).toUpperCase()}
                            </DateLabel>
                            <GamesNumberLabel>
                                {t(`market.filter-label.datepicker.games`, { numberOfGames: data.numberOfGames })}
                            </GamesNumberLabel>
                        </DateContainer>
                    ))}
                    <RightIcon
                        onClick={() => (farLeftDateIndex + DATES_TO_SHOW < gamesPerDay?.length ? moveRight() : '')}
                        disabled={farLeftDateIndex + DATES_TO_SHOW >= gamesPerDay?.length}
                    />
                </>
            ) : (
                <Wrapper></Wrapper>
            )}
        </Wrapper>
    );
};

const Wrapper = styled.div<{ hidden?: boolean }>`
    display: flex;
    flex-direction: row;
    visibility: ${(props) => (props?.hidden ? 'hidden' : '')};
    height: ${(props) => (props?.hidden ? '64px' : '')};
    margin-bottom: 35px;
    align-items: center;

    @media (max-width: 768px) {
        margin-top: 20px;
        margin-bottom: 20px;
    }

    @media (max-width: 568px) {
        & > div:nth-of-type(3) {
            opacity: 1;
            box-shadow: var(--shadow);
        }
    }
`;

const RightIcon = styled.i<{ disabled?: boolean }>`
    font-size: 60px;
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

const LeftIcon = styled.i<{ disabled?: boolean }>`
    font-size: 60px;
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

const DateContainer = styled(FlexDivColumn)<{ selected?: boolean }>`
    margin-top: 10px;
    width: 80px;
    align-items: center;
    justify-content: flex-end;
    cursor: pointer;
    color: ${(props) => (props.selected ? props.theme.textColor.quaternary : props.theme.textColor.primary)};
    &:not(:last-of-type) {
        border-right: 2px solid ${(props) => props.theme.borderColor.secondary};
    }
`;

const DayLabel = styled.span`
    font-style: normal;
    font-weight: 700;
    font-size: 20px;
    line-height: 24px;
    text-transform: uppercase;
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
