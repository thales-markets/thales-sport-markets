import Button from 'components/Button';
import Logo from 'components/Logo';
import SPAAnchor from 'components/SPAAnchor';
import ROUTES from 'constants/routes';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import { FlexDivRowCentered } from 'styles/common';
import { ThemeInterface } from 'types/ui';
import { buildHref } from 'utils/routes';

const Header: React.FC = () => {
    const theme: ThemeInterface = useTheme();
    const { t } = useTranslation();

    return (
        <HeaderContainer>
            <Container>
                <LeftContainer>
                    <Logo />
                </LeftContainer>
                <RightContainer>
                    <SPAAnchor href={buildHref(ROUTES.Home)}>
                        <Button
                            borderColor={theme.button.background.quinary}
                            backgroundColor={theme.button.background.quinary}
                            textColor={theme.button.textColor.primary}
                            additionalStyles={{ borderRadius: '5px' }}
                        >
                            {t('seo.page.start-using-overtime')}
                        </Button>
                    </SPAAnchor>
                </RightContainer>
            </Container>
        </HeaderContainer>
    );
};

export default Header;

const HeaderContainer = styled.header`
    align-items: center;
    width: 99%;
    margin: 0px auto;
    padding: 20px 15px;
    max-width: 1512px;
    justify-content: space-between;
    @media (max-width: 1499px) {
        padding: 10px 10px;
    }
    @media (max-width: 767px) {
        padding: 0px 3px;
    }
`;

const Container = styled(FlexDivRowCentered)`
    width: 100%;
    gap: 10px;
    @media (max-width: 767px) {
        flex-direction: column;
    }
    @keyframes pulsing {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(1.2);
            @media (max-width: 767px) {
                transform: scale(1.1);
            }

            opacity: 1;
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
`;

const LeftContainer = styled(FlexDivRowCentered)`
    width: 100%;
    max-width: 278px;
    justify-content: center;
    padding-right: 15px;
`;

const RightContainer = styled(FlexDivRowCentered)`
    position: relative;
    width: 100%;
    max-width: 360px;
    @media (max-width: 767px) {
        flex-direction: column;
    }
    > div {
        :not(:last-child) {
            margin-right: 20px;
            @media (max-width: 767px) {
                margin-right: 0px;
                margin-bottom: 10px;
            }
        }
    }
`;
