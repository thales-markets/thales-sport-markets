import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivColumnCentered } from 'styles/common';

const Footer: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Container>
            <RightsReserved>{t('footer.all-rights-reserved', { year: new Date().getFullYear() })}</RightsReserved>
        </Container>
    );
};

const Container = styled(FlexDivColumnCentered)`
    margin-top: auto;
    max-height: 40px;
`;

const RightsReserved = styled(FlexDivColumnCentered)`
    font-style: normal;
    font-weight: bold;
    font-size: 16px;
    line-height: 102.6%;
    letter-spacing: 0.035em;
    color: ${(props) => props.theme.textColor.primary};
`;

export default Footer;
