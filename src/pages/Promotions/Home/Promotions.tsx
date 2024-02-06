import Loader from 'components/Loader';
import { usePromotionsQuery } from 'queries/promotions/usePromotionsQuery';
import React, { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import useQueryParam from 'utils/useQueryParams';
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

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));

    const [selectedNavItem, setSelectedNavItem] = useState<number>(0);

    const [branchName] = useQueryParam('branch-name', '');

    const promotionsQuery = usePromotionsQuery(branchName, {
        enabled: isAppReady,
    });

    const promotions = useMemo(() => {
        if (promotionsQuery.isSuccess && promotionsQuery.data) return promotionsQuery.data;
        return [];
    }, [promotionsQuery.data, promotionsQuery.isSuccess]);

    return (
        <Wrapper>
            {promotionsQuery.isLoading && <Loader />}
            {!promotionsQuery.isLoading && (
                <>
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
                        {promotions.length > 0 &&
                            promotions.map((promotion, index) => {
                                return (
                                    <PromotionCard
                                        key={`${index}-${promotion.promotionUrl}`}
                                        title={promotion.title}
                                        description={promotion.description}
                                        startDate={promotion.startDate}
                                        endDate={promotion.endDate}
                                        backgroundImageUrl={promotion.backgroundImageUrl}
                                        promotionId={promotion.promotionId}
                                        promotionUrl={promotion.promotionUrl}
                                        callToActionButton={promotion.callToActionButton}
                                        branchName={branchName ? branchName : undefined}
                                    />
                                );
                            })}
                    </CardsWrapper>
                </>
            )}
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
    gap: 20px;
    margin: 0 auto;
    flex-wrap: wrap;
    align-items: center;
`;

export default Promotions;
