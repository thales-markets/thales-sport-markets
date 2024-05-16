import liveAnimationData from 'assets/lotties/live-markets-filter.json';
import Lottie from 'lottie-react';
import React, { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivRowCentered } from 'styles/common';

type SportFilterProps = {
    disabled?: boolean;
    selected?: boolean;
    sport: string;
    isMobile?: boolean;
    onClick: () => void;
    count: number;
    open: boolean;
};

const SportFilter: React.FC<SportFilterProps> = ({
    disabled,
    selected,
    sport,
    isMobile,
    onClick,
    count,
    children,
    open,
}) => {
    const { t } = useTranslation();
    return (
        <Container isMobile={isMobile}>
            <LeftContainer>
                <LabelContainer
                    className={`${disabled ? 'disabled' : ''} ${selected ? 'selected' : ''}`}
                    onClick={() => (!disabled ? onClick() : '')}
                >
                    <FlexDiv>
                        {sport.toLowerCase() == 'live' && (
                            <Lottie
                                autoplay={true}
                                animationData={liveAnimationData}
                                loop={true}
                                style={liveBlinkStyle}
                            />
                        )}
                        {sport.toLowerCase() != 'live' && (
                            <SportIcon
                                className={`icon icon--${sport.toLowerCase() == 'all' ? 'logo' : sport.toLowerCase()}`}
                            />
                        )}
                        <Label>{`${children} ${disabled ? `\n ${t('common.coming-soon')}` : ''} `}</Label>
                    </FlexDiv>
                    <FlexDiv gap={15}>
                        {count > 0 && <Count isMobile={isMobile}>{count}</Count>}
                        {sport.toLowerCase() != 'all' ? (
                            !open ? (
                                <ArrowIcon className={`icon icon--arrow ${selected ? 'selected' : ''}`} />
                            ) : (
                                <ArrowIcon
                                    down={true}
                                    className={`icon icon--arrow-down ${selected ? 'selected' : ''}`}
                                />
                            )
                        ) : (
                            <ArrowIcon className={`invisible icon icon--arrow`} />
                        )}
                    </FlexDiv>
                </LabelContainer>
            </LeftContainer>
        </Container>
    );
};

const Container = styled(FlexDivRowCentered)<{ isMobile?: boolean }>`
    font-style: normal;
    font-weight: 600;
    font-size: ${(props) => (props.isMobile ? '17px' : '12px')};
    line-height: ${(props) => (props.isMobile ? '17px' : '13px')};
    letter-spacing: 0.035em;
    text-transform: uppercase;
    cursor: pointer;
    height: 25px;
    margin-left: ${(props) => (props.isMobile ? '30px' : '0px')};
    margin-right: ${(props) => (props.isMobile ? '30px' : '0px')};
    position: relative;
    color: ${(props) => props.theme.textColor.quinary};
    margin-bottom: 5px;
    justify-content: flex-start;
`;

const LeftContainer = styled(FlexDivRowCentered)`
    flex: 1;
`;

const LabelContainer = styled(FlexDivRowCentered)`
    flex: 1;
    &.selected,
    &:hover {
        color: ${(props) => props.theme.textColor.quaternary};
    }

    @media (max-width: 950px) {
        &:hover {
            color: ${(props) => props.theme.textColor.secondary};
        }
        &.selected {
            color: ${(props) => props.theme.textColor.quaternary};
        }
    }
`;

const Label = styled.div`
    white-space: pre-line;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
    align-self: center;
`;

const SportIcon = styled.i`
    font-size: 25px;
    margin-right: 15px;
    font-weight: 400;
`;

const ArrowIcon = styled.i<{ down?: boolean }>`
    font-size: 12px;
    margin-left: 5px;
    text-transform: none;
    &.selected,
    &:hover {
        cursor: pointer;
        color: ${(props) => props.theme.textColor.quaternary};
    }
    @media (max-width: 950px) {
        &:hover {
            color: ${(props) => props.theme.textColor.secondary};
        }
        &.selected {
            color: ${(props) => props.theme.textColor.quaternary};
        }
    }
`;

const Count = styled(FlexDivCentered)<{ isMobile?: boolean }>`
    border-radius: 8px;
    color: ${(props) => props.theme.textColor.quaternary};
    background: ${(props) => (props.isMobile ? props.theme.background.primary : props.theme.background.primary)};
    border: 2px solid ${(props) => props.theme.background.secondary};
    font-size: ${(props) => (props.isMobile ? '15px' : '12px')};
    min-width: 30px;
    height: ${(props) => (props.isMobile ? '20px' : '18px')};
    line-height: ${(props) => (props.isMobile ? '20px' : '18px')};
    padding: 0 6px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
`;

const liveBlinkStyle: CSSProperties = {
    width: 37,
    margin: '0px 9px 0px -6px',
};

export default SportFilter;
