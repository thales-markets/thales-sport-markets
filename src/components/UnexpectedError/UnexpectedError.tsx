import Button from 'components/Button';
import { LINKS } from 'constants/links';
import ROUTES from 'constants/routes';
import { ScreenSizeBreakpoint } from 'enums/ui';
import React from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered } from 'styles/common';
import { ThemeInterface } from 'types/ui';
import { navigateTo } from 'utils/routes';

const UnexpectedError: React.FC<{ theme: ThemeInterface }> = ({ theme }) => {
    const { t } = useTranslation();
    const { resetBoundary } = useErrorBoundary();

    const tryAgainHandler = () => {
        resetBoundary();
        navigateTo(ROUTES.Markets.Home);
    };

    return (
        <Container theme={theme}>
            <FlexDivCentered>
                <Message>{t('common.errors.something-went-wrong')}</Message>
            </FlexDivCentered>
            <FlexDivCentered>
                <Text>
                    <Trans
                        i18nKey="common.support-contact"
                        components={{
                            anchor: <Link href={LINKS.Discord.Help} target="_blank" rel="noreferrer" />,
                        }}
                    />
                </Text>
            </FlexDivCentered>
            <FlexDivCentered>
                <Button
                    onClick={tryAgainHandler}
                    margin="10px 0 0 0"
                    backgroundColor={theme.button.background.primary}
                    borderColor={theme.button.borderColor.primary}
                    textColor={theme.button.textColor.primary}
                >
                    {t('common.try-again')}
                </Button>
            </FlexDivCentered>
        </Container>
    );
};

const Container = styled(FlexDivColumnCentered)<{ theme: ThemeInterface }>`
    height: 100%;
    background: ${(props) => props.theme.background.primary};
    color: ${(props) => props.theme.textColor.secondary};
    font-family: ${(props) => props.theme.fontFamily.primary};

    a {
        color: ${(props) => props.theme.link.textColor.secondary};
    }
    button:hover {
        color: ${(props) => props.theme.button.textColor.tertiary};
    }
    div:has(> button:hover) {
        background: ${(props) => props.theme.button.textColor.tertiary};
    }
`;

const Message = styled.span`
    font-size: 42px;
    padding: 10px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 22px;
    }
`;

const Text = styled.span`
    font-size: 22px;
    padding: 10px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 13px;
    }
`;

const Link = styled.a`
    &:hover {
        text-decoration: underline;
    }
`;

export default UnexpectedError;
