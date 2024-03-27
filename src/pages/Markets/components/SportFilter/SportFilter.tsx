import liveAnimationData from 'assets/lotties/live-markets-filter.json';
import Lottie from 'lottie-react';
import React, { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivRowCentered } from 'styles/common';

type SportFilterProps = {
    disabled?: boolean;
    selected?: boolean;
    sport: string;
    isMobile?: boolean;
    onClick: () => void;
    count: number;
};

const SportFilter: React.FC<SportFilterProps> = ({ disabled, selected, sport, isMobile, onClick, count, children }) => {
    const { t } = useTranslation();

    return (
        <Container isMobile={isMobile}>
            <LeftContainer>
                <LabelContainer
                    className={`${disabled ? 'disabled' : ''} ${selected ? 'selected' : ''}`}
                    onClick={() => (!disabled ? onClick() : '')}
                >
                    {sport.toLowerCase() == 'live' && (
                        <Lottie autoplay={true} animationData={liveAnimationData} loop={true} style={liveBlinkStyle} />
                    )}
                    {sport.toLowerCase() != 'live' && (
                        <SportIcon
                            className={`icon icon--${sport.toLowerCase() == 'all' ? 'logo' : sport.toLowerCase()}`}
                        />
                    )}
                    <Label>{`${children} ${disabled ? `\n ${t('common.coming-soon')}` : ''} `}</Label>
                    {sport.toLowerCase() != 'all' ? (
                        !selected ? (
                            <ArrowIcon className={`icon-exotic icon-exotic--right ${selected ? 'selected' : ''}`} />
                        ) : (
                            <ArrowIcon
                                down={true}
                                className={`icon-exotic icon-exotic--down ${selected ? 'selected' : ''}`}
                            />
                        )
                    ) : (
                        ''
                    )}
                </LabelContainer>
            </LeftContainer>
            {count > 0 && <Count isMobile={isMobile}>{count}</Count>}
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
    height: 36px;
    margin-left: ${(props) => (props.isMobile ? '30px' : '0px')};
    margin-right: ${(props) => (props.isMobile ? '30px' : '0px')};
    position: relative;
    color: ${(props) => props.theme.textColor.secondary};
    margin-bottom: 5px;
    justify-content: flex-start;
`;

const LeftContainer = styled(FlexDivRowCentered)`
    width: 100%;
`;

const LabelContainer = styled(FlexDivRowCentered)`
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
`;

const SportIcon = styled.i`
    font-size: 25px;
    margin-right: 15px;
`;

const ArrowIcon = styled.i<{ down?: boolean }>`
    font-size: 12px;
    margin-left: 5px;
    margin-top: ${(props) => (props.down ? '5px' : '')};
    margin-bottom: ${(props) => (props.down ? '' : '2px')};
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
    background: ${(props) => (props.isMobile ? props.theme.background.tertiary : props.theme.background.secondary)};
    font-size: ${(props) => (props.isMobile ? '15px' : '12px')};
    min-width: 30px;
    height: ${(props) => (props.isMobile ? '20px' : '18px')};
    padding: 0 6px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
`;

const liveBlinkStyle: CSSProperties = {
    width: 50,
    margin: '0px 2px 0px -12px',
};

export default SportFilter;
