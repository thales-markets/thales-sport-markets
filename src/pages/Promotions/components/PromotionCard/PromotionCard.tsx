import Button from 'components/Button';
import SPAAnchor from 'components/SPAAnchor';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import styled, { useTheme } from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivRow } from 'styles/common';
import { PromotionCardProps, PromotionCardStatus, ThemeInterface } from 'types/ui';
import { formatTimestampForPromotionDate } from 'utils/formatters/date';
import { getPromotionStatus } from 'utils/ui';

const PromotionCard: React.FC<PromotionCardProps> = ({
    title,
    description,
    startDate,
    endDate,
    promotionUrl,
    backgroundImageUrl,
    callToActionButton,
    branchName,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    return (
        <Wrapper backgroundImageUrl={backgroundImageUrl} isMobile={isMobile}>
            <SPAAnchor
                href={`${promotionUrl}${branchName ? `?branch-name=${branchName}` : ''}`}
                style={{ height: '100%' }}
            >
                <FlexDiv
                    style={{
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignContent: 'space-between',
                        height: '100%',
                    }}
                >
                    <HeaderContainer>
                        <PromotionStatusBadge status={getPromotionStatus(startDate, endDate)}>
                            {t(`promotions.nav-items.${getPromotionStatus(startDate, endDate)}`)}
                        </PromotionStatusBadge>
                        <DateRangeLabel>{`${t('promotions.from-label')} ${formatTimestampForPromotionDate(
                            startDate
                        )} ${t('promotions.to-label')} ${formatTimestampForPromotionDate(endDate)}`}</DateRangeLabel>
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
                </FlexDiv>
            </SPAAnchor>
        </Wrapper>
    );
};

export const Wrapper = styled(FlexDiv)<{ backgroundImageUrl: string; isMobile: boolean }>`
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

export const HeaderContainer = styled(FlexDivRow)`
    margin-bottom: 120px;
    align-items: center;
`;

export const PromotionStatusBadge = styled(FlexDiv)<{ status: PromotionCardStatus }>`
    background-color: ${(props) => props.status == 'ongoing' && props.theme.promotion.background.primary};
    background-color: ${(props) => props.status == 'finished' && props.theme.promotion.background.secondary};
    color: ${(props) => props.status == 'ongoing' && props.theme.promotion.textColor.primary};
    color: ${(props) => props.status == 'finished' && props.theme.promotion.textColor.secondary};
    border-radius: 30px;
    font-size: 14px;
    padding: 5px 20px;
    font-weight: 500;
    text-transform: uppercase;
`;

export const DateRangeLabel = styled.span`
    color: ${(props) => props.theme.textColor.primary};
    font-weight: 700;
    font-size: 12px;
    text-transform: uppercase;
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
