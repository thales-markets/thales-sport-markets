import liveAnimationData from 'assets/lotties/live-markets-filter.json';
import { SportFilter } from 'enums/markets';
import { t } from 'i18next';
import Lottie from 'lottie-react';
import React, { CSSProperties } from 'react';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import styled, { useTheme } from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivSpaceBetween } from 'styles/common';

type SportFilterProps = {
    selected?: boolean;
    sport: SportFilter;
    onClick: () => void;
    count: number;
    open: boolean;
    children: React.ReactNode;
};

const SportFilterDetails: React.FC<SportFilterProps> = ({ selected, sport, onClick, count, children, open }) => {
    const isMobile = useSelector(getIsMobile);

    const theme = useTheme();

    return (
        <Container className={selected ? 'selected' : ''} onClick={onClick}>
            <LeftContainer>
                {sport == SportFilter.Live ? (
                    <Lottie
                        autoplay={true}
                        animationData={liveAnimationData}
                        loop={true}
                        style={isMobile ? liveBlinkStyleMobile : liveBlinkStyle}
                    />
                ) : sport == SportFilter.Boosted ? (
                    <SportIcon color={theme.overdrop.textColor.primary} className={`icon icon--fire`} />
                ) : (
                    <SportIcon className={`icon icon--${sport == SportFilter.All ? 'logo' : sport.toLowerCase()}`} />
                )}
                <Label>
                    {children}
                    {sport == SportFilter.Futures && <NewBadge>{t(`common.new`)}</NewBadge>}
                </Label>
            </LeftContainer>
            <RightContainer>
                {count > 0 && <Count>{count}</Count>}
                {sport == SportFilter.All ? (
                    <ArrowIcon className={`invisible icon icon--caret-right`} />
                ) : open ? (
                    <ArrowIcon className="icon icon--caret-down" />
                ) : (
                    <ArrowIcon className="icon icon--caret-right" />
                )}
            </RightContainer>
        </Container>
    );
};

const Container = styled(FlexDivSpaceBetween)`
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 13px;
    letter-spacing: 0.035em;
    text-transform: uppercase;
    cursor: pointer;
    height: 25px;
    position: relative;
    color: ${(props) => props.theme.christmasTheme.textColor.primary};
    margin-bottom: 5px;
    &.selected,
    &:hover {
        color: ${(props) => props.theme.christmasTheme.textColor.secondary};
    }
    @media (max-width: 950px) {
        font-size: 14px;
        line-height: 18px;
        height: 30px;
        color: ${(props) => props.theme.textColor.primary};
    }
`;

const LeftContainer = styled(FlexDiv)`
    align-items: center;
`;

const RightContainer = styled(FlexDiv)`
    align-items: center;
    gap: 10px;
`;

const Label = styled.div`
    position: relative;
    white-space: pre-line;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
`;

const SportIcon = styled.i<{ color?: string }>`
    font-size: 22px;
    margin-right: 10px;
    font-weight: 400;
    margin-left: 1px;
    text-transform: none;
    @media (max-width: 950px) {
        margin-right: 18px;
    }
    ::before {
        color: ${(props) => props.color || 'ingerit'};
    }
`;

const ArrowIcon = styled.i`
    font-size: 14px;
    text-transform: none;
    font-weight: 400;
`;

const Count = styled(FlexDivCentered)`
    border-radius: 8px;
    font-size: 12px;
    line-height: 18px;
    min-width: 30px;
    height: 18px;
    color: ${(props) => props.theme.christmasTheme.textColor.secondary};
    background: ${(props) => props.theme.background.primary};
    border: 2px solid ${(props) => props.theme.background.secondary};
    padding: 0 6px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
    @media (max-width: 950px) {
        border-radius: 15px;
        font-size: 13px;
        line-height: 20px;
        min-width: 40px;
        height: 24px;
        color: ${(props) => props.theme.textColor.tertiary};
        background: ${(props) => props.theme.background.septenary};
        border: 2px solid ${(props) => props.theme.background.secondary};
    }
`;

const NewBadge = styled.div`
    position: absolute;
    background-color: #3cb55b;
    border-radius: 5px;
    color: #f6f6fe;
    display: inline-block;
    font-size: 10px;
    line-height: 10px;
    padding: 2px 4px;
    margin-top: -1px;
    margin-left: 4px;
    @media (max-width: 950px) {
        margin-top: 2px;
    }
`;

const liveBlinkStyle: CSSProperties = {
    width: 32,
    margin: '0px 5px 0px -4px',
};

const liveBlinkStyleMobile: CSSProperties = {
    width: 32,
    margin: '2px 13px 0px -4px',
};

export default SportFilterDetails;
