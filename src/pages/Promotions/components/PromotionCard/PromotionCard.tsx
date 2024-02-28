import Button from 'components/Button';
import SPAAnchor from 'components/SPAAnchor';
import TimeRemaining from 'components/TimeRemaining';
import { Network } from 'enums/network';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import styled, { useTheme } from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivRow } from 'styles/common';
import { PromotionCardData, PromotionCardStatus, PromotionStatus, ThemeInterface } from 'types/ui';
import { getPromotionDateRange, getPromotionStatus } from 'utils/ui';

import { ReactComponent as ArbitrumLogo } from 'assets/images/arbitrum-logo.svg';
import { ReactComponent as BaseLogo } from 'assets/images/base-logo.svg';
import { ReactComponent as OPLogo } from 'assets/images/optimism-logo.svg';

const PromotionCard: React.FC<PromotionCardData> = ({
    title,
    description,
    startDate,
    endDate,
    displayCountdown,
    finished,
    promotionUrl,
    backgroundImageUrl,
    callToActionButton,
    availableOnNetworks,
    branchName,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const getPromotionStatusLabel = (
        startDate: number,
        endDate: number,
        displayCountdown?: boolean,
        finished?: boolean
    ) => {
        if (!displayCountdown) return <>{getPromotionDateRange(startDate, endDate)}</>;
        if (getPromotionStatus(startDate, endDate, finished) == PromotionStatus.ONGOING) {
            return (
                <>
                    <span>{t('promotions.ends-in')}</span>
                    <TimeRemaining
                        end={endDate * 1000}
                        fontSize={14}
                        fontWeight={700}
                        color={theme.promotion.textColor.primary}
                    />
                </>
            );
        }
        if (getPromotionStatus(startDate, endDate, finished) == PromotionStatus.COMING_SOON) {
            return (
                <>
                    {t('promotions.starts-in')}{' '}
                    <TimeRemaining
                        end={endDate * 1000}
                        fontSize={14}
                        fontWeight={700}
                        color={theme.promotion.textColor.primary}
                    />
                </>
            );
        }
        return <>{getPromotionStatus(startDate, endDate, finished)}</>;
    };

    return (
        <Wrapper backgroundImageUrl={backgroundImageUrl} isMobile={isMobile}>
            <SPAAnchor
                href={`${promotionUrl}${branchName ? `?branch-name=${branchName}` : ''}`}
                style={{ height: '100%' }}
            >
                <ContentWrapper>
                    <HeaderContainer>
                        <NetworkIconsWrapper>
                            {availableOnNetworks?.length ? (
                                availableOnNetworks.map((item) => {
                                    return getNetworkLogo(item as Network);
                                })
                            ) : (
                                <></>
                            )}
                        </NetworkIconsWrapper>
                        <PromotionStatusBadge status={getPromotionStatus(startDate, endDate, finished)}>
                            {getPromotionStatusLabel(startDate, endDate, displayCountdown, finished)}
                        </PromotionStatusBadge>
                    </HeaderContainer>
                    <Title>{title}</Title>
                    <BottomContainer>
                        <Description>{description}</Description>
                        <ButtonContainer>
                            <Button
                                textColor={theme.button.textColor.primary}
                                backgroundColor={theme.button.background.quaternary}
                                borderColor={theme.button.borderColor.secondary}
                            >
                                {callToActionButton}
                            </Button>
                        </ButtonContainer>
                    </BottomContainer>
                </ContentWrapper>
            </SPAAnchor>
        </Wrapper>
    );
};

const getNetworkLogo = (networkId: number) => {
    switch (networkId) {
        case Network.OptimismMainnet:
            return <OPLogo />;
        case Network.Arbitrum:
            return <ArbitrumLogo />;
        case Network.Base:
            return <BaseLogo />;
        default:
            return <></>;
    }
};

const Wrapper = styled(FlexDiv)<{ backgroundImageUrl: string; isMobile: boolean }>`
    font-size: 14px;
    flex-direction: column;
    flex: 0 0 ${(props) => (props.isMobile ? '100%' : '24%')};
    cursor: pointer;
    border-radius: 5px;
    border: 2px ${(props) => props.theme.borderColor.primary} solid;
    padding: 15px;
    justify-content: space-between;
    height: 415px;
    background: url(${(props) => props.backgroundImageUrl});
    background-size: cover;
    background-position: center;
`;

const ContentWrapper = styled(FlexDiv)`
    flex-direction: column;
    justify-content: space-between;
    align-content: space-between;
    height: 100%;
`;

export const HeaderContainer = styled(FlexDivRow)`
    margin-bottom: 120px;
    align-items: center;
`;

export const PromotionStatusBadge = styled(FlexDiv)<{ status: PromotionCardStatus }>`
    background-color: ${(props) => props.status == 'coming-soon' && props.theme.promotion.background.primary};
    background-color: ${(props) => props.status == 'ongoing' && props.theme.promotion.background.primary};
    background-color: ${(props) => props.status == 'finished' && props.theme.promotion.background.secondary};
    color: ${(props) => props.status == 'coming-soon' && props.theme.promotion.textColor.primary};
    color: ${(props) => props.status == 'ongoing' && props.theme.promotion.textColor.primary};
    color: ${(props) => props.status == 'finished' && props.theme.promotion.textColor.secondary};
    border-radius: 30px;
    font-size: 14px;
    padding: 5px 20px;
    font-weight: 700;
    text-transform: uppercase;
    justify-content: space-between;
    > span:first-child {
        margin-right: 4px;
    }
`;

export const NetworkIconsWrapper = styled(FlexDiv)`
    flex-direction: row;
    svg {
        width: 24px;
        height: 24px;
    }
    gap: 5px;
`;

export const Title = styled.h2`
    font-size: 20px;
    line-height: 22px;
    font-weight: 800;
    color: ${(props) => props.theme.textColor.primary};
    text-align: center;
    margin-bottom: 16px;
`;

export const BottomContainer = styled(FlexDiv)`
    flex-direction: column;
`;

export const Description = styled.div`
    flex: 0.8;
    font-size: 14px;
    align-items: center;
    color: ${(props) => props.theme.textColor.primary};
`;

export const ButtonContainer = styled(FlexDivCentered)`
    align-items: center;
    justify-content: center;
    margin-top: 20px;
`;

export default PromotionCard;
