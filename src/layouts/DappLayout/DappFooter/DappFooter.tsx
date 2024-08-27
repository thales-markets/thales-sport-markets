import termsOfUse from 'assets/docs/thales-terms-of-use.pdf';
import { ReactComponent as ThalesLogo } from 'assets/images/thales-logo.svg';
import { LINKS } from 'constants/links';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered, FlexDivRowCentered } from 'styles/common';

const DappFooter: React.FC = () => {
    const { t } = useTranslation();

    return (
        <>
            <Container>
                <ThalesLink mobile={true} target="_blank" rel="noreferrer" href={LINKS.Thales}>
                    <LinkContent>
                        <StyledLogo />
                    </LinkContent>
                </ThalesLink>
                <LinksContainer>
                    <ThalesLink mobile={false} target="_blank" rel="noreferrer" href={LINKS.Thales}>
                        <LinkContent>
                            <StyledLogo />
                        </LinkContent>
                    </ThalesLink>
                    <Link target="_blank" rel="noreferrer" href={LINKS.Footer.Medium}>
                        <LinkContent>
                            <MediumIcon />
                            <LinkText>{t('footer.medium')}</LinkText>
                        </LinkContent>
                    </Link>
                    <Link target="_blank" rel="noreferrer" href={LINKS.Footer.Twitter}>
                        <LinkContent>
                            <TwitterIcon />
                            <LinkText>{t('footer.twitter')}</LinkText>
                        </LinkContent>
                    </Link>
                    <Link target="_blank" rel="noreferrer" href={LINKS.Footer.Discord}>
                        <LinkContent>
                            <DiscordIcon />
                            <LinkText>{t('footer.discord')}</LinkText>
                        </LinkContent>
                    </Link>
                    <Link target="_blank" rel="noreferrer" href={LINKS.Footer.Docs}>
                        <LinkContent>
                            <DocsIcon />
                            <LinkText>{t('footer.docs')}</LinkText>
                        </LinkContent>
                    </Link>
                    <Link target="_blank" rel="noreferrer" href={LINKS.Footer.Tutorial}>
                        <LinkContent>
                            <YoutubeIcon />
                            <LinkText>{t('footer.tutorial')}</LinkText>
                        </LinkContent>
                    </Link>
                    <Link target="_blank" rel="noreferrer" href={LINKS.Footer.GitHub}>
                        <LinkContent>
                            <GithubIcon />
                            <LinkText>{t('footer.github')}</LinkText>
                        </LinkContent>
                    </Link>
                    <Link target="_blank" rel="noreferrer" href={LINKS.Footer.Instagram}>
                        <LinkContent>
                            <InstagramIcon />
                            <LinkText>{t('footer.instagram')}</LinkText>
                        </LinkContent>
                    </Link>
                    <Link target="_blank" rel="noreferrer" href={LINKS.Footer.Reddit}>
                        <LinkContent>
                            <RedditIcon />
                            <LinkText>{t('footer.reddit')}</LinkText>
                        </LinkContent>
                    </Link>
                </LinksContainer>
            </Container>
            <DisclaimerContainer>
                <Trans
                    i18nKey="footer.disclaimer"
                    components={{
                        disclaimer: <DisclaimerLink href={termsOfUse} rel="noreferrer" target="_blank" />,
                        guidelines: (
                            <DisclaimerLink
                                href={'https://docs.overtimemarkets.xyz/sports-trading-guidelines'}
                                rel="noreferrer"
                                target="_blank"
                            />
                        ),
                    }}
                />
            </DisclaimerContainer>
        </>
    );
};

const Container = styled(FlexDivColumnCentered)`
    max-height: 75px;
    @media (max-width: 950px) {
        max-height: fit-content;
        margin-top: 100px;
    }
`;

const DisclaimerContainer = styled(FlexDivCentered)`
    border-top: 1px solid ${(props) => props.theme.borderColor.primary};
    margin-top: 10px;
    padding-top: 15px;
    width: 100%;
    font-size: 10px;
    line-height: 12px;
    color: ${(props) => props.theme.textColor.secondary};
    text-align: justify;
    @media (max-width: 650px) {
        margin-top: 30px;
    }
    @media (max-width: 400px) {
        margin-top: 50px;
    }
`;

const Link = styled.a``;

const DisclaimerLink = styled.a`
    display: contents;
    color: ${(props) => props.theme.link.textColor.primary};
`;

const ThalesLink = styled.a<{ mobile?: boolean }>`
    display: ${(props) => (props.mobile ? 'none' : '')};
    @media (max-width: 600px) {
        display: ${(props) => (props.mobile ? 'block' : 'none')};
    }
`;

const StyledLogo = styled(ThalesLogo)`
    margin-left: 6px;
    fill: ${(props) => props.theme.textColor.secondary};
    height: 40px;
    width: 85px;
`;

const LinksContainer = styled(FlexDivRowCentered)`
    margin-top: 15px;
    color: ${(props) => props.theme.textColor.secondary};
    font-size: 30px;
    flex-wrap: wrap;
    justify-content: center;
    a {
        :not(:last-child) {
            margin-right: 40px;
            @media (max-width: 500px) {
                margin-left: 10px;
                margin-right: 10px;
            }
        }
    }
    @media (max-width: 950px) {
        gap: 10px;
    }
`;

const LinkContent = styled(FlexDivColumnCentered)`
    align-items: center;
`;

const LinkText = styled(FlexDivCentered)`
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 15px;
    color: ${(props) => props.theme.textColor.secondary};
`;

const TwitterIcon = styled.i`
    color: ${(props) => props.theme.textColor.secondary};
    &:before {
        font-family: HomepageIconsV2 !important;
        content: '\\0021';
    }
`;

const DiscordIcon = styled.i`
    color: ${(props) => props.theme.textColor.secondary};
    &:before {
        font-family: HomepageIconsV2 !important;
        content: '\\0023';
    }
`;

const DocsIcon = styled.i`
    color: ${(props) => props.theme.textColor.secondary};
    &:before {
        font-family: HomepageIconsV2 !important;
        content: '\\0025';
    }
`;

const YoutubeIcon = styled.i`
    color: ${(props) => props.theme.textColor.secondary};
    &:before {
        font-family: OvertimeIconsV2 !important;
        content: '\\0119';
    }
`;

const MediumIcon = styled.i`
    color: ${(props) => props.theme.textColor.secondary};
    &:before {
        font-family: HomepageIconsV2 !important;
        content: '\\0024';
    }
`;

const GithubIcon = styled.i`
    color: ${(props) => props.theme.textColor.secondary};
    &:before {
        font-family: HomepageIconsV2 !important;
        content: '\\0022';
    }
`;

const InstagramIcon = styled.i`
    color: ${(props) => props.theme.textColor.secondary};
    &:before {
        font-family: OvertimeIconsV2 !important;
        content: '\\0116';
    }
`;

const RedditIcon = styled.i`
    color: ${(props) => props.theme.textColor.secondary};
    &:before {
        font-family: OvertimeIconsV2 !important;
        content: '\\0114';
    }
`;

export default DappFooter;
