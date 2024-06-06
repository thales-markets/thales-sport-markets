import Loader from 'components/Loader';
import { usePromotionsQuery } from 'queries/promotions/usePromotionsQuery';
import React, { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import { PromotionStatus } from 'types/ui';
import { getPromotionStatus } from 'utils/ui';
import useQueryParam from 'utils/useQueryParams';
import Navigation from '../components/Navigation';
import { NavigationItem } from '../components/Navigation/Navigation';
import PromotionCard from '../components/PromotionCard';

enum NavigationEnum {
    'ALL',
    'ONGOING',
    'COMING_SOON',
}

const NavItems: NavigationItem[] = [
    {
        index: NavigationEnum.ALL,
        i18Label: 'promotions.nav-items.all',
    },
    {
        index: NavigationEnum.ONGOING,
        i18Label: 'promotions.nav-items.ongoing',
    },
    {
        index: NavigationEnum.COMING_SOON,
        i18Label: 'promotions.nav-items.finished',
    },
];

const Promotions: React.FC = () => {
    const { t } = useTranslation();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));

    const [selectedNavItem, setSelectedNavItem] = useState<number>(NavigationEnum.ONGOING);

    const [branchName] = useQueryParam('branch-name', '');

    const promotionsQuery = usePromotionsQuery(branchName, {
        enabled: isAppReady,
    });

    const promotions = useMemo(() => {
        try {
            const promotions = promotionsQuery.isSuccess && promotionsQuery.data ? promotionsQuery.data : [];
            if (selectedNavItem == NavigationEnum.ONGOING) {
                return promotions.filter((item) => {
                    const status = getPromotionStatus(item.startDate, item.endDate);
                    return status == PromotionStatus.ONGOING || status == PromotionStatus.COMING_SOON;
                });
            }
            if (selectedNavItem == NavigationEnum.COMING_SOON) {
                return promotions.filter((item) => {
                    const status = getPromotionStatus(item.startDate, item.endDate);
                    return status == PromotionStatus.FINISHED;
                });
            }
            return promotions;
        } catch (e) {
            console.log('Error ', e);
            return [];
        }
    }, [promotionsQuery.data, promotionsQuery.isSuccess, selectedNavItem]);

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
                        {promotions.length > 0 ? (
                            promotions.map((promotion, index) => {
                                return (
                                    <PromotionCard
                                        key={`${index}-${promotion.promotionUrl}`}
                                        {...promotion}
                                        promotionUrl={
                                            branchName
                                                ? `${promotion.promotionUrl}?branch-name=${branchName}`
                                                : promotion.promotionUrl
                                        }
                                    />
                                );
                            })
                        ) : (
                            <EmptyContainer>{t('promotions.no-promotions')}</EmptyContainer>
                        )}
                    </CardsWrapper>
                </>
            )}
        </Wrapper>
    );
};

const Wrapper = styled(FlexDiv)`
    flex-direction: column;
    margin-top: 10px;
    min-height: 620px;
`;

const HeadingWrapper = styled(FlexDiv)`
    width: 100%;
    align-items: center;
    text-align: center;
    flex-direction: column;
`;

const Heading = styled.h1`
    margin: 30px 0px;
    font-size: 36px;
    line-height: 43px;
    font-weight: 600;
    font-family: Nunito;
    color: ${(props) => props.theme.textColor.primary};
`;

const Description = styled.p`
    font-size: 14px;
    font-weight: 400;
`;

const CardsWrapper = styled(FlexDiv)`
    flex-direction: row;
    gap: 15px;
    margin: 0 auto;
    flex-wrap: wrap;
    align-items: center;
`;

const EmptyContainer = styled(FlexDiv)`
    margin: 100px 0px;
    font-size: 14px;
    align-items: center;
    justify-content: center;
    width: 100%;
`;

export default Promotions;
