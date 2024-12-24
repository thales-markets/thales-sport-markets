import Button from 'components/Button';
import Loader from 'components/Loader';
import SPAAnchor from 'components/SPAAnchor';
import ROUTES from 'constants/routes';
import { PROMOTION_SANITIZE_PROPS } from 'constants/ui';
import DOMPurify from 'dompurify';
import { useSEOArticlesQuery } from 'queries/seo/useSEOArticlesQuery';
import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import { FlexDiv, FlexDivColumn } from 'styles/common';
import { SeoArticleProps, ThemeInterface } from 'types/ui';
import { buildHref } from 'utils/routes';
import useQueryParam from 'utils/useQueryParams';
import Header from '../components/Header';

const SeoArticle: React.FC<SeoArticleProps> = (props) => {
    const theme: ThemeInterface = useTheme();

    const { t } = useTranslation();

    const seoId = props?.match?.params?.seoId;

    const [branchName] = useQueryParam('branch-name', '');

    const SEOArticlesQuery = useSEOArticlesQuery(branchName, {
        enabled: true,
    });

    const seoArticles = useMemo(() => {
        if (SEOArticlesQuery.isSuccess && SEOArticlesQuery.data) return SEOArticlesQuery.data;
        return [];
    }, [SEOArticlesQuery.data, SEOArticlesQuery.isSuccess]);

    const seoArticle = useMemo(() => {
        if (seoArticles.length > 0) {
            return seoArticles.find((seoArticle) => seoArticle.seoId == seoId);
        }
        return undefined;
    }, [seoId, seoArticles]);

    return (
        <Background>
            <Header />
            <Wrapper>
                <BackContainer>
                    <SPAAnchor href={buildHref(`${ROUTES.SEO.Home}${branchName ? `?branch-name=${branchName}` : ''}`)}>
                        <ArrowIcon className="icon icon--arrow-down" />
                        <Back>{t('promotions.back')}</Back>
                    </SPAAnchor>
                </BackContainer>
                {(!seoArticle || SEOArticlesQuery.isLoading) && <Loader />}
                {seoArticle !== undefined && (
                    <>
                        <Helmet>
                            <meta name="title" content={seoArticle.meta.title} />
                            <meta name="description" content={seoArticle.meta.description} />
                            <meta name="keywords" content={seoArticle.meta.keywords} />
                        </Helmet>

                        <CoverImageWrapper imageUrl={seoArticle.article.coverImageUrl}></CoverImageWrapper>
                        <HeaderContainer
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(seoArticle.article.headerHtml, PROMOTION_SANITIZE_PROPS),
                            }}
                        ></HeaderContainer>
                        <CTAContainer>
                            <CTAContent
                                dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(
                                        seoArticle.article.ctaSection.sectionHtml,
                                        PROMOTION_SANITIZE_PROPS
                                    ),
                                }}
                            ></CTAContent>
                            <SPAAnchor href={seoArticle.article.ctaSection.ctaButtonLink}>
                                <Button
                                    width={'150px'}
                                    backgroundColor={theme.button.background.quaternary}
                                    textColor={theme.button.textColor.primary}
                                    borderColor={theme.button.borderColor.secondary}
                                >
                                    {seoArticle.article.ctaSection.ctaButtonLabel}
                                </Button>
                            </SPAAnchor>
                        </CTAContainer>
                        <MainContent
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(seoArticle.article.contentHtml, PROMOTION_SANITIZE_PROPS),
                            }}
                        ></MainContent>
                    </>
                )}
            </Wrapper>
        </Background>
    );
};

const Background = styled.section`
    min-height: 100vh;
    background: ${(props) => props.theme.background.primary};
    color: ${(props) => props.theme.textColor.primary};
    position: relative;
`;

const Wrapper = styled(FlexDivColumn)`
    align-items: center;
    width: 99%;
    margin-left: auto;
    margin-right: auto;
    padding: 10px 15px;
    max-width: 1512px;
    min-height: 100vh;
    justify-content: space-between;
    @media (max-width: 1499px) {
        padding: 10px 10px;
    }
    @media (max-width: 767px) {
        padding: 0px 3px;
    }
`;

const CoverImageWrapper = styled(FlexDiv)<{ imageUrl: string }>`
    background: url(${(props) => props.imageUrl});
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    width: 100%;
    height: 210px;
`;

const BackContainer = styled(FlexDiv)`
    align-items: center;
    justify-content: flex-start;
    margin: 10px 0px;
    width: 100%;
`;

const Back = styled.span`
    font-weight: 600;
    cursor: pointer;
    font-size: 14px;
    text-transform: uppercase;
`;

const ArrowIcon = styled.i`
    font-size: 14px;
    color: ${(props) => props.theme.textColor.primary};
    text-transform: none !important;
    margin-right: 5px;
    transform: rotate(90deg);
`;

const HeaderContainer = styled(FlexDiv)`
    font-family: 'Nunito' !important;
    font-weight: 600;
    text-align: center !important;
    align-items: center;
    width: 100%;
    margin: 40px 0px 30px 0px;
    justify-content: center;
    color: ${(props) => props.theme.textColor.primary} !important;
    h1 {
        font-family: 'Nunito' !important;
        font-size: 30px;
        font-weight: 600;
        line-height: 36px;
        width: 100%;
    }
    h2 {
        font-size: 20px;
        font-weight: 600;
        line-height: 26px;
        margin: 10px 0px;
        margin: 15px 0px;
    }
    h3 {
        font-size: 14px;
        font-weight: 600;
        margin: 15px 0px;
        color: ${(props) => props.theme.textColor.quaternary};
    }
    p {
        padding: 10px 0px;
    }
    strong {
        font-weight: 600;
    }
    a {
        font-weight: 600;
        text-decoration: none;
        color: ${(props) => props.theme.textColor.quaternary};
        :active {
            text-decoration: none;
            color: ${(props) => props.theme.textColor.quaternary};
        }
        :visited {
            text-decoration: none;
            color: ${(props) => props.theme.textColor.quaternary};
        }
        :hover {
            text-decoration: none;
            color: ${(props) => props.theme.textColor.quaternary};
        }
        :link {
            text-decoration: none;
            color: ${(props) => props.theme.textColor.quaternary};
        }
    }
`;

const CTAContainer = styled(FlexDiv)`
    width: 100%;
    background-color: ${(props) => props.theme.background.secondary};
    padding: 20px;
    flex-direction: column;
    align-items: center;
    margin-bottom: 30px;
`;

const CTAContent = styled(FlexDiv)`
    color: ${(props) => props.theme.textColor.primary};
    font-weight: 400;
    font-size: 14px;
    line-height: 18px;
    margin-bottom: 20px;
    h1 {
        font-size: 30px;
        font-weight: 600;
        line-height: 36px;
    }
    h2 {
        font-size: 20px;
        font-weight: 600;
        line-height: 26px;
        margin: 10px 0px;
        margin: 15px 0px;
    }
    h3 {
        font-size: 14px;
        font-weight: 600;
        margin: 15px 0px;
        color: ${(props) => props.theme.textColor.quaternary};
    }
    p {
        padding: 10px 0px;
    }
    strong {
        font-weight: 600;
    }
    a {
        font-weight: 600;
        text-decoration: none;
        color: ${(props) => props.theme.textColor.quaternary};
        :active {
            text-decoration: none;
            color: ${(props) => props.theme.textColor.quaternary};
        }
        :visited {
            text-decoration: none;
            color: ${(props) => props.theme.textColor.quaternary};
        }
        :hover {
            text-decoration: none;
            color: ${(props) => props.theme.textColor.quaternary};
        }
        :link {
            text-decoration: none;
            color: ${(props) => props.theme.textColor.quaternary};
        }
    }
`;

const MainContent = styled(FlexDiv)`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 14px;
    line-height: 18px;
    font-weight: 400;
    flex-direction: column;
    ul {
        list-style: circle !important;
        list-style-position: inside !important;
        margin-left: 15px !important;
    }
    h1 {
        font-size: 30px;
        font-weight: 600;
        line-height: 36px;
    }
    h2 {
        font-size: 20px;
        font-weight: 600;
        line-height: 26px;
        margin: 10px 0px;
        margin: 15px 0px;
    }
    h3 {
        font-size: 14px;
        font-weight: 600;
        margin: 15px 0px;
        color: ${(props) => props.theme.textColor.quaternary};
    }
    p {
        padding: 10px 0px;
    }
    strong {
        font-weight: 600;
    }
    a {
        font-weight: 600;
        text-decoration: none;
        color: ${(props) => props.theme.textColor.quaternary};
        :active {
            text-decoration: none;
            color: ${(props) => props.theme.textColor.quaternary};
        }
        :visited {
            text-decoration: none;
            color: ${(props) => props.theme.textColor.quaternary};
        }
        :hover {
            text-decoration: none;
            color: ${(props) => props.theme.textColor.quaternary};
        }
        :link {
            text-decoration: none;
            color: ${(props) => props.theme.textColor.quaternary};
        }
    }
    hr {
        border-top: 1px solid ${(props) => props.theme.borderColor.primary};
        width: 100%;
        margin: 15px 0px;
    }
`;

export default SeoArticle;
