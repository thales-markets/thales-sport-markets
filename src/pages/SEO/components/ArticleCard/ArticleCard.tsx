import Button from 'components/Button';
import SPAAnchor from 'components/SPAAnchor';
import React from 'react';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import styled, { useTheme } from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivRow } from 'styles/common';
import { SEOItem, ThemeInterface } from 'types/ui';

const ArticleCard: React.FC<SEOItem> = ({
    title,
    description,
    url,
    backgroundImageUrl,
    callToActionButton,
    branchName,
}) => {
    const theme: ThemeInterface = useTheme();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    return (
        <Wrapper backgroundImageUrl={backgroundImageUrl} isMobile={isMobile}>
            <SPAAnchor href={`${url}${branchName ? `?branch-name=${branchName}` : ''}`} style={{ height: '100%' }}>
                <ContentWrapper>
                    <HeaderContainer></HeaderContainer>
                    <Title>{title}</Title>
                    <BottomContainer>
                        <Description>{description}</Description>
                        <ButtonContainer marginBottom={callToActionButton ? '' : '28px'}>
                            {callToActionButton && (
                                <Button
                                    textColor={theme.button.textColor.primary}
                                    backgroundColor={theme.button.background.quaternary}
                                    borderColor={theme.button.borderColor.secondary}
                                >
                                    {callToActionButton}
                                </Button>
                            )}
                        </ButtonContainer>
                    </BottomContainer>
                </ContentWrapper>
            </SPAAnchor>
        </Wrapper>
    );
};

const Wrapper = styled(FlexDiv)<{ backgroundImageUrl: string; isMobile: boolean }>`
    font-size: 14px;
    flex-direction: column;
    flex: 0 0 ${(props) => (props.isMobile ? '100%' : '24%')};
    cursor: pointer;
    border-radius: 5px;
    border: 2px ${(props) => props.theme.borderColor.primary} solid;
    padding: 15px;
    justify-content: space-between;
    height: 415px;
    background: url(${(props) => props.backgroundImageUrl});
    background-size: cover;
    background-position: center;
`;

const ContentWrapper = styled(FlexDiv)`
    flex-direction: column;
    justify-content: space-between;
    align-content: space-between;
    height: 100%;
`;

const HeaderContainer = styled(FlexDivRow)`
    margin-bottom: 120px;
    align-items: center;
`;

const Title = styled.h2`
    font-size: 20px;
    line-height: 22px;
    font-weight: 600;
    color: ${(props) => props.theme.textColor.primary};
    text-align: center;
    margin-bottom: 16px;
`;

const BottomContainer = styled(FlexDiv)`
    flex-direction: column;
`;

const Description = styled.div`
    flex: 0.8;
    font-size: 14px;
    align-items: center;
    color: ${(props) => props.theme.textColor.primary};
`;

const ButtonContainer = styled(FlexDivCentered)<{ marginBottom?: string }>`
    align-items: center;
    justify-content: center;
    margin-top: 20px;
    margin-bottom: ${(props) => props.marginBottom};
`;

export default ArticleCard;
