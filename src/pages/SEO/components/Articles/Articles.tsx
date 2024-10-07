import Loader from 'components/Loader';
import { useSEOArticlesQuery } from 'queries/seo/useSEOArticlesQuery';
import React, { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import useQueryParam from 'utils/useQueryParams';
import ArticleCard from '../ArticleCard';

const Articles: React.FC = () => {
    const { t } = useTranslation();

    const [branchName] = useQueryParam('branch-name', '');

    const seoArticlesQuery = useSEOArticlesQuery(branchName, {
        enabled: true,
    });

    const seoArticles = useMemo(() => {
        try {
            const articles = seoArticlesQuery.isSuccess && seoArticlesQuery.data ? seoArticlesQuery.data : [];
            return articles;
        } catch (e) {
            console.log('Error ', e);
            return [];
        }
    }, [seoArticlesQuery.data, seoArticlesQuery.isSuccess]);

    return (
        <Wrapper>
            {seoArticlesQuery.isLoading && <Loader />}
            {!seoArticlesQuery.isLoading && (
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
                    <CardsWrapper>
                        {seoArticles.length > 0 ? (
                            seoArticles.map((seoArticle, index) => {
                                return (
                                    <ArticleCard
                                        key={`${index}-${seoArticle.url}`}
                                        {...seoArticle}
                                        url={
                                            branchName ? `${seoArticle.url}?branch-name=${branchName}` : seoArticle.url
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

export default Articles;
