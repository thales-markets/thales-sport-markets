import Button from 'components/Button';
import Loader from 'components/Loader';
import SPAAnchor from 'components/SPAAnchor';
import { SUPPORTED_NETWORKS_PARAMS } from 'constants/network';
import { PROMOTION_SANITIZE_PROPS } from 'constants/ui';
import DOMPurify from 'dompurify';
import { usePromotionsQuery } from 'queries/promotions/usePromotionsQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { getIsAppReady } from 'redux/modules/app';
import { switchToNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled, { useTheme } from 'styled-components';
import { FlexDiv, FlexDivColumn } from 'styles/common';
import { changeNetwork } from 'thales-utils';
import { SupportedNetwork } from 'types/network';
import { ThemeInterface } from 'types/ui';
import useQueryParam from 'utils/useQueryParams';
import { useSwitchNetwork } from 'wagmi';

type PromotionProps = RouteComponentProps<{
    promotionId: string;
}>;

const Promotion: React.FC<PromotionProps> = (props) => {
    const theme: ThemeInterface = useTheme();
    const dispatch = useDispatch();

    const history = useHistory();
    const { t } = useTranslation();
    const { switchNetwork } = useSwitchNetwork();

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

    const network = Object.keys(SUPPORTED_NETWORKS_PARAMS)
        .map((key) => {
            return {
                id: Number(key),
                ...SUPPORTED_NETWORKS_PARAMS[Number(key)],
            };
        })
        .sort((a, b) => a.order - b.order)
        .find((item) => item.chainKey == promotion?.article.ctaSection.forceChangeNetworkOnClick);

    return (
        <Wrapper>
            {(!promotion || promotionsQuery.isLoading) && <Loader />}
            {promotion !== undefined && (
                <>
                    <BackContainer>
                        <Back onClick={() => history.goBack()}>{t('promotions.back')}</Back>
                    </BackContainer>
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
                        <SPAAnchor
                            href={promotion.article.ctaSection.ctaButtonLink}
                            onClick={async () => {
                                if (promotion?.article.ctaSection.forceChangeNetworkOnClick && network) {
                                    await changeNetwork(network, () => {
                                        switchNetwork?.(network.id);
                                        // Trigger App.js init
                                        // do not use updateNetworkSettings(networkId) as it will trigger queries before provider in App.js is initialized
                                        dispatch(
                                            switchToNetworkId({
                                                networkId: Number(network.id) as SupportedNetwork,
                                            })
                                        );
                                    });
                                }
                            }}
                        >
                            <Button
                                width={'150px'}
                                backgroundColor={theme.button.background.quaternary}
                                textColor={theme.button.textColor.primary}
                                borderColor={theme.button.borderColor.secondary}
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
    margin-top: 20px;
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
`;

const Back = styled.span`
    font-weight: 600;
    cursor: pointer;
    font-size: 14px;
    text-transform: uppercase;
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

export default Promotion;
