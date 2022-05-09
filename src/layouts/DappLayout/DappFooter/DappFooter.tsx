import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { ReactComponent as ThalesLogo } from 'assets/images/thales-logo.svg';
import { LINKS } from 'constants/links';

const DappFooter: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Link target="_blank" rel="noreferrer" href={LINKS.Thales}>
            <Container>
                {t('common.built-on')}
                <StyledLogo />
            </Container>
        </Link>
    );
};

const Link = styled.a``;

const Container = styled(FlexDivCentered)`
    margin-top: 30px;
    font-style: normal;
    font-weight: bold;
    font-size: 20px;
    line-height: 102.6%;
    letter-spacing: 0.035em;
    color: ${(props) => props.theme.textColor.primary};
    a {
        color: ${(props) => props.theme.textColor.primary};
    }
`;

const StyledLogo = styled(ThalesLogo)`
    margin-left: 6px;
    margin-bottom: -5px;
    fill: ${(props) => props.theme.textColor.primary};
    height: 24px;
`;

export default DappFooter;
