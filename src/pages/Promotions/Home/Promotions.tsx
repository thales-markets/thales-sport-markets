import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import Navigation, { NavigationItem } from '../components/Navigation/Navigation';
import PromotionCard from '../components/PromotionCard/PromotionCard';

const NavItems: NavigationItem[] = [
    {
        index: 0,
        i18Label: 'promotions.nav-items.all',
    },
    {
        index: 1,
        i18Label: 'promotions.nav-items.ongoing',
    },
    {
        index: 2,
        i18Label: 'promotions.nav-items.finished',
    },
];

const Promotions: React.FC = () => {
    const { t } = useTranslation();

    const [selectedNavItem, setSelectedNavItem] = useState<number>(0);

    return (
        <Wrapper>
            <HeadingWrapper>
                <Heading>
                    <Trans
                        i18nKey={t('promotions.title')}
                        components={{
                            br: <br />,
                        }}
                    />
                </Heading>
                <Description>{t('promotions.description')}</Description>
            </HeadingWrapper>
            <Navigation
                items={NavItems}
                selectedItemIndex={selectedNavItem}
                onChangeNavItem={(index: number) => setSelectedNavItem(index)}
            />
            <CardsWrapper>
                <PromotionCard
                    title="The Biggest ARB Incentives Program on Overtime Ever"
                    description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged."
                    startDate={1702236692}
                    endDate={1704915092}
                    backgroundImageUrl="/cover-card.png"
                    promotionUrl="/test-djsakdjsakdjskadjskajda"
                    callToActionButton="Test"
                />
                <PromotionCard
                    title="The Biggest ARB Incentives Program on Overtime Ever"
                    description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged."
                    startDate={1702236692}
                    endDate={1704915092}
                    promotionUrl="/test-djsakdjsakdjskadjskajda"
                    backgroundImageUrl="public/cover-card.png"
                    callToActionButton="Test"
                />
                <PromotionCard
                    title="The Biggest ARB Incentives Program on Overtime Ever"
                    description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged."
                    startDate={1702236692}
                    endDate={1704915092}
                    backgroundImageUrl="/promotions/cover-card.png"
                    promotionUrl="/test-djsakdjsakdjskadjskajda"
                    callToActionButton="Test"
                />
            </CardsWrapper>
        </Wrapper>
    );
};

const Wrapper = styled(FlexDiv)`
    flex-direction: column;
    margin-top: 50px;
`;

const HeadingWrapper = styled(FlexDiv)`
    width: 100%;
    align-items: center;
    text-align: center;
    flex-direction: column;
`;

const Heading = styled.h1`
    margin: 70px 0px;
    font-size: 56px;
    font-weight: 900;
    font-family: Nunito;
    color: ${(props) => props.theme.textColor.primary};
`;

const Description = styled.p`
    font-size: 20px;
    font-family: Roboto;
    font-weight: 400;
`;

const CardsWrapper = styled(FlexDiv)`
    flex-direction: row;
    gap: 10px;
    flex-wrap: wrap;
    flex-basis: 33%;
`;

export default Promotions;
