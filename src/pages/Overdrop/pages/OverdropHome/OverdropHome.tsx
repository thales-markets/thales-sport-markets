import GiftIcon from 'assets/images/gift.svg?react';
import { OverdropTab } from 'enums/ui';
import { t } from 'i18next';
import BadgeOverview from 'pages/Overdrop/components/BadgeOverview';
import DailyRecap from 'pages/Overdrop/components/DailyRecap';
import XPOverview from 'pages/Overdrop/components/XPOverview';
import React from 'react';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow } from 'styles/common';
import { RootState } from 'types/redux';

type OverdropHomeProps = {
    setSelectedTab: (tab: OverdropTab) => void;
};

const OverdropHome: React.FC<OverdropHomeProps> = ({ setSelectedTab }) => {
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    return (
        <Wrapper>
            {/* <OverdropBanner /> */}
            <NewSeasonBanner>
                <BannerContent>
                    <IconContainer>
                        <GiftIcon />
                    </IconContainer>
                    <BannerText>
                        <HighlightText>{t('overdrop.season-2')}</HighlightText>
                        {t('overdrop.new-season')}
                    </BannerText>
                </BannerContent>
            </NewSeasonBanner>
            <XPOverview setSelectedTab={setSelectedTab} />
            <LevelDetailsWrapper isMobile={isMobile}>
                <DailyRecap />
                <BadgeOverview />
            </LevelDetailsWrapper>
        </Wrapper>
    );
};

const LevelDetailsWrapper = styled(FlexDivRow)<{ isMobile: boolean }>`
    margin-top: ${(props) => (props.isMobile ? '16px' : '40px')};
    flex-direction: ${(props) => (props.isMobile ? 'column' : 'row')};
    gap: 10px;
    justify-content: center;
`;

const NewSeasonBanner = styled.div`
    background: ${(props) => props.theme.overdrop.background.tertiary};
    border: 2px solid ${(props) => props.theme.overdrop.textColor.primary};
    padding: 16px 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 800px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
    margin-bottom: 40px;

    :after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(219, 161, 17, 0.3), transparent);
        animation: sweep 3s ease-in-out infinite;
    }

    @keyframes sweep {
        0% {
            left: -100%;
        }
        100% {
            left: 100%;
        }
    }

    @media (max-width: 950px) {
        min-width: auto;
        width: 100%;
        padding: 10px 20px;
    }
`;

const BannerContent = styled.div`
    display: flex;
    align-items: center;
    gap: 20px;
    z-index: 1;
    position: relative;
`;

const IconContainer = styled.div`
    width: 40px;
    height: 40px;
    background: ${(props) => props.theme.overdrop.textColor.primary};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: pulse 2s ease-in-out infinite;

    svg {
        width: 24px;
        height: 24px;
        fill: none;
        stroke: ${(props) => props.theme.overdrop.background.active};
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
    }

    @keyframes pulse {
        0%,
        100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.1);
        }
    }

    @media (max-width: 950px) {
        min-width: 36px;
        min-height: 36px;
        max-width: 36px;
        max-height: 36px;
    }
`;

const BannerText = styled.span`
    font-size: 18px;
    font-weight: 600;
    color: white;
    text-transform: uppercase;
    letter-spacing: 2px;
    @media (max-width: 950px) {
        font-size: 14px;
        letter-spacing: 1.5px;
    }
`;

const HighlightText = styled(BannerText)`
    color: #3fffff;
    font-weight: 800;
`;

const Wrapper = styled(FlexDivColumn)``;

export default OverdropHome;
