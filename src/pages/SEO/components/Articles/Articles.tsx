import Loader from 'components/Loader';
import { SEO_ARTICLES_PER_PAGE } from 'constants/ui';
import DappFooter from 'layouts/DappLayout/DappFooter';
import { useSEOArticlesQuery } from 'queries/seo/useSEOArticlesQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import useQueryParam from 'utils/useQueryParams';
import ArticleCard from '../ArticleCard';

const Articles: React.FC = () => {
    const { t } = useTranslation();

    const history = useHistory();
    const location = useLocation();

    const [branchName] = useQueryParam('branch-name', '');

    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const initialPage = parseInt(queryParams.get('page') || '1', 10);

    const [currentPage, setCurrentPage] = useState(initialPage);

    useEffect(() => {
        queryParams.set('page', currentPage.toString());
        history.push({ search: queryParams.toString() });
    }, [currentPage, history, queryParams]);

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

    const paginatedArticles = useMemo(() => {
        const startIndex = (currentPage - 1) * SEO_ARTICLES_PER_PAGE;
        const endIndex = startIndex + SEO_ARTICLES_PER_PAGE;
        return seoArticles.slice(startIndex, endIndex);
    }, [seoArticles, currentPage]);

    const totalPages = Math.ceil(seoArticles.length / SEO_ARTICLES_PER_PAGE);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <Wrapper>
            {seoArticlesQuery.isLoading && <Loader />}
            {!seoArticlesQuery.isLoading && (
                <>
                    <HeadingWrapper>
                        <Heading>
                            <Trans
                                i18nKey={t('seo.page.title')}
                                components={{
                                    br: <br />,
                                }}
                            />
                        </Heading>
                        <Description>{t('seo.page.content')}</Description>
                    </HeadingWrapper>
                    <CardsWrapper>
                        {paginatedArticles.length > 0 ? (
                            paginatedArticles.map((seoArticle, index) => {
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
                    <PaginationControls>
                        <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                            Previous
                        </button>
                        <span>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                            Next
                        </button>
                    </PaginationControls>
                </>
            )}
            <DappFooter />
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
    margin-bottom: 40px;
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

const PaginationControls = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 30px 0px;

    button {
        margin: 0 10px;
        padding: 10px 20px;
        background-color: ${(props) => props.theme.button.background.quaternary};
        color: ${(props) => props.theme.button.textColor.primary};
        border: none;
        border-radius: 5px;
        cursor: pointer;

        &:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }
    }

    span {
        margin: 0 10px;
    }
`;

export default Articles;
