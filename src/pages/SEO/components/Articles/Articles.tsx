import Loader from 'components/Loader';
import SelectInput from 'components/SelectInput';
import { ScreenSizeBreakpoint } from 'enums/ui';
import DappFooter from 'layouts/DappLayout/DappFooter';
import { useSEOArticlesQuery } from 'queries/seo/useSEOArticlesQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import useQueryParam from 'utils/useQueryParams';
import ArticleCard from '../ArticleCard';

const PAGINATION_SIZE = [
    { value: 12, label: '12' },
    { value: 24, label: '24' },
    { value: 36, label: '36' },
    { value: 48, label: '48' },
];

const Articles: React.FC = () => {
    const { t } = useTranslation();

    const history = useHistory();
    const location = useLocation();

    const [branchName] = useQueryParam('branch-name', '');

    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const initialPage = parseInt(queryParams.get('page') || '1', 10);

    const [seoArticlesPerPage, setSeoArticlesPerPage] = useState<number>(PAGINATION_SIZE[0].value);

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
        const startIndex = (currentPage - 1) * seoArticlesPerPage;
        const endIndex = startIndex + seoArticlesPerPage;
        return seoArticles.slice(startIndex, endIndex);
    }, [currentPage, seoArticlesPerPage, seoArticles]);

    const totalPages = Math.ceil(seoArticles.length / seoArticlesPerPage);

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
                    <PaginationWrapper>
                        <SectionWrapper>
                            <PaginationLabel>{t('common.pagination.rows-per-page')}</PaginationLabel>
                            <div>
                                <SelectInput
                                    options={PAGINATION_SIZE}
                                    value={{ value: seoArticlesPerPage, label: seoArticlesPerPage.toString() }}
                                    handleChange={(value: any) => {
                                        setCurrentPage(1);
                                        setSeoArticlesPerPage(Number(value));
                                    }}
                                    isPaginationStyle
                                />
                            </div>
                        </SectionWrapper>

                        <SectionWrapper className="flex items-center gap-1">
                            <PaginationLabel>
                                {`${currentPage} ${t('common.pagination.of')} ${totalPages}`}
                            </PaginationLabel>
                        </SectionWrapper>

                        <ActionSection>
                            <ArrowWrapper onClick={() => handlePreviousPage()} disabled={currentPage === 1}>
                                <ArrowLeft className={'icon icon--arrow-down'} />
                            </ArrowWrapper>
                        </ActionSection>
                        <ActionSection>
                            <ArrowWrapper onClick={() => handleNextPage()} disabled={currentPage === totalPages}>
                                <ArrowRight className={'icon icon--arrow-down'} />
                            </ArrowWrapper>
                        </ActionSection>
                    </PaginationWrapper>
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

const PaginationWrapper = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 5px 0;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        justify-content: flex-start;
    }
`;

const SectionWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    margin: 0 14px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        margin: 0 8px;
    }
`;

const PaginationLabel = styled.p`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 14px;
    font-weight: 400;
    line-height: 10%;
    letter-spacing: 0.13px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 12px;
    }
`;

const ActionSection = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
`;

const ArrowWrapper = styled.span<{ disabled: boolean }>`
    display: flex;
    width: 40px;
    height: 24px;
    justify-content: center;
    align-items: center;
    padding: 4px;
    color: ${(props) => props.theme.textColor.primary};
    opacity: ${(props) => (props.disabled ? 0.5 : 1)};
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
`;

const ArrowLeft = styled.i`
    font-size: 12px;
    rotate: 90deg;
`;
const ArrowRight = styled.i`
    font-size: 12px;
    rotate: -90deg;
`;

export default Articles;
