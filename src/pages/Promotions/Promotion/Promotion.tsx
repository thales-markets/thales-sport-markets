import Button from 'components/Button';
import Loader from 'components/Loader';
import SPAAnchor from 'components/SPAAnchor';
import { PROMOTION_SANITIZE_PROPS } from 'constants/ui';
import DOMPurify from 'dompurify';
import { usePromotionsQuery } from 'queries/promotions/usePromotionsQuery';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { getIsAppReady } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import styled, { useTheme } from 'styled-components';
import { FlexDiv, FlexDivColumn } from 'styles/common';
import { ThemeInterface } from 'types/ui';
import useQueryParam from 'utils/useQueryParams';

type PromotionProps = RouteComponentProps<{
    promotionId: string;
}>;

const Promotion: React.FC<PromotionProps> = (props) => {
    const theme: ThemeInterface = useTheme();

    const promotionId = props?.match?.params?.promotionId;

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));

    const [branchName] = useQueryParam('branch-name', '');

    const promotionsQuery = usePromotionsQuery(branchName, {
        enabled: isAppReady,
    });

    const promotions = useMemo(() => {
        if (promotionsQuery.isSuccess && promotionsQuery.data) return promotionsQuery.data;
        return [];
    }, [promotionsQuery.data, promotionsQuery.isSuccess]);

    const promotion = useMemo(() => {
        if (promotions.length > 0) {
            return promotions.find((promotion) => promotion.promotionId == promotionId);
        }
        return undefined;
    }, [promotionId, promotions]);

    return (
        <Wrapper>
            {(!promotion || promotionsQuery.isLoading) && <Loader />}
            {promotion !== undefined && (
                <>
                    <CoverImageWrapper imageUrl={promotion.article.coverImageUrl}></CoverImageWrapper>
                    <HeaderContainer
                        dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(promotion.article.headerHtml, PROMOTION_SANITIZE_PROPS),
                        }}
                    ></HeaderContainer>
                    <CTAContainer>
                        <CTAContent
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(
                                    promotion.article.ctaSection.sectionHtml,
                                    PROMOTION_SANITIZE_PROPS
                                ),
                            }}
                        ></CTAContent>
                        <SPAAnchor href={promotion.article.ctaSection.ctaButtonLink}>
                            <Button
                                width={'150px'}
                                backgroundColor={theme.button.background.quaternary}
                                textColor={theme.button.textColor.primary}
                            >
                                {promotion.article.ctaSection.ctaButtonLabel}
                            </Button>
                        </SPAAnchor>
                    </CTAContainer>
                    <MainContent
                        dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(promotion.article.contentHtml, PROMOTION_SANITIZE_PROPS),
                        }}
                    ></MainContent>
                </>
            )}
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivColumn)`
    width: 100%;
    margin-top: 50px;
`;

const CoverImageWrapper = styled(FlexDiv)<{ imageUrl: string }>`
    background: url(${(props) => props.imageUrl});
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    width: 100%;
    height: 210px;
`;

const HeaderContainer = styled(FlexDiv)`
    font-family: 'Nunito' !important;
    font-weight: 900;
    text-align: center !important;
    align-items: center;
    width: 100%;
    margin: 50px 0px;
    justify-content: center;
    color: ${(props) => props.theme.textColor.primary} !important;
    h1 {
        font-size: 30px;
        font-weight: 900;
        line-height: 36px;
    }
    h2 {
        font-size: 20px;
        font-weight: 700;
        line-height: 26px;
        margin: 10px 0px;
        margin: 15px 0px;
    }
    h3 {
        font-size: 14px;
        font-weight: 700;
        margin: 15px 0px;
        color: ${(props) => props.theme.textColor.quaternary};
    }
    p {
        padding: 10px 0px;
    }
    strong {
        font-weight: 700;
    }
    a {
        font-weight: 700;
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
    margin-bottom: 20px;
`;

const CTAContent = styled(FlexDiv)`
    color: ${(props) => props.theme.textColor.primary};
    font-weight: 500;
    font-size: 14px;
    line-height: 18px;
    margin-bottom: 20px;
    font-family: 'Roboto';
    h1 {
        font-size: 30px;
        font-weight: 900;
        line-height: 36px;
    }
    h2 {
        font-size: 20px;
        font-weight: 700;
        line-height: 26px;
        margin: 10px 0px;
        margin: 15px 0px;
    }
    h3 {
        font-size: 14px;
        font-weight: 700;
        margin: 15px 0px;
        color: ${(props) => props.theme.textColor.quaternary};
    }
    p {
        padding: 10px 0px;
    }
    strong {
        font-weight: 700;
    }
    a {
        font-weight: 700;
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
    font-family: 'Roboto';
    font-weight: 400;
    flex-direction: column;
    ul {
        list-style: circle !important;
        list-style-position: inside !important;
        margin-left: 15px !important;
    }
    h1 {
        font-size: 30px;
        font-weight: 900;
        line-height: 36px;
    }
    h2 {
        font-size: 20px;
        font-weight: 700;
        line-height: 26px;
        margin: 10px 0px;
        margin: 15px 0px;
    }
    h3 {
        font-size: 14px;
        font-weight: 700;
        margin: 15px 0px;
        color: ${(props) => props.theme.textColor.quaternary};
    }
    p {
        padding: 10px 0px;
    }
    strong {
        font-weight: 700;
    }
    a {
        font-weight: 700;
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

export default Promotion;
