import Loyalty10 from 'assets/images/overdrop/loyalty_10.webp';
import Loyalty15 from 'assets/images/overdrop/loyalty_15.webp';
import Loyalty20 from 'assets/images/overdrop/loyalty_20.webp';
import Loyalty5 from 'assets/images/overdrop/loyalty_5.webp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivColumnCentered, FlexDivRowCentered } from 'styles/common';

import { LOYALTY_BOOST_TEXT_COLORS } from 'constants/overdrop';
import BadgeGroup from './components/BadgeGroup';

const LevelRecap: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Wrapper>
            <HeadingWrapper>
                <Heading>{t('overdrop.leveling-tree.heading')}</Heading>
                <Disclaimer>{t('overdrop.leveling-tree.payout-disclaimer')}</Disclaimer>
            </HeadingWrapper>
            <BadgeContainer>
                <FlexDivCentered>
                    <LoyaltyText boostLevel={0}>{`5% ${t(
                        'overdrop.leveling-tree.explainer.loyalty-boost'
                    )}`}</LoyaltyText>
                    <img src={Loyalty5} />
                </FlexDivCentered>
                <BadgeGroup loyaltyBoost={0} startIndex={1} endIndex={6} />
            </BadgeContainer>
            <BadgeContainer>
                <FlexDivCentered>
                    <LoyaltyText boostLevel={1}>{`10% ${t(
                        'overdrop.leveling-tree.explainer.loyalty-boost'
                    )}`}</LoyaltyText>
                    <img src={Loyalty10} />
                </FlexDivCentered>
                <BadgeGroup loyaltyBoost={1} startIndex={6} endIndex={11} />
            </BadgeContainer>
            <BadgeContainer>
                <FlexDivCentered>
                    <LoyaltyText boostLevel={2}>{`15% ${t(
                        'overdrop.leveling-tree.explainer.loyalty-boost'
                    )}`}</LoyaltyText>
                    <img src={Loyalty15} />
                </FlexDivCentered>
                <BadgeGroup loyaltyBoost={2} startIndex={11} endIndex={16} />
            </BadgeContainer>
            <FlexDivCentered>
                <LoyaltyText boostLevel={4}>{`25% ${t('overdrop.leveling-tree.explainer.loyalty-boost')}`}</LoyaltyText>
                <img src={Loyalty20} />
            </FlexDivCentered>
            <LastRowWrapper>
                <LastContainer>
                    <BadgeGroup loyaltyBoost={3} startIndex={16} endIndex={20} />
                </LastContainer>
                <LastContainer>
                    <BadgeGroup loyaltyBoost={4} startIndex={20} endIndex={21} />
                </LastContainer>
            </LastRowWrapper>
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivColumn)`
    flex-grow: 4;
    justify-content: center;
    align-items: center;
    gap: 28px;
    width: 100%;
`;

const BadgeContainer = styled.div`
    width: 100%;
`;

const LastContainer = styled.div`
    width: 100%;
    flex: 1;
`;

const LastRowWrapper = styled(FlexDivRowCentered)`
    width: 100%;
    gap: 10px;
    margin-top: -28px;
    ${LastContainer}:first-child {
        flex: 4;
    }
    @media (max-width: 767px) {
        flex-direction: column;
    }
`;

const HeadingWrapper = styled(FlexDivColumnCentered)`
    text-align: center;
`;

const Heading = styled.h1`
    color: ${(props) => props.theme.overdrop.textColor.primary};
    font-size: 30px;
    font-weight: 400;
    text-transform: capitalize;
    margin: 15px 0px 5px 0px;
`;

const Disclaimer = styled.p`
    font-size: 12px;
    font-style: italic;
`;

const LoyaltyText = styled.div<{ boostLevel: number }>`
    color: ${(props) => LOYALTY_BOOST_TEXT_COLORS[props.boostLevel]};
    font-weight: bold;
    text-transform: uppercase;
    font-size: 14px;
    position: absolute;
    margin: auto;
`;

export default LevelRecap;
