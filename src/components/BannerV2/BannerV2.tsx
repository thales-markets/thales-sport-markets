import React from 'react';
import { Trans } from 'react-i18next';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';

const BannerV2: React.FC = () => {
    return (
        <Container>
            <Label>
                <Trans
                    i18nKey={'banner.v2-text'}
                    components={{
                        bold: <Bold />,
                        v2Link: <Link href="https://v2.overtimemarkets.xyz/" />,
                        detailsLink: (
                            <Link href="https://medium.com/@OvertimeMarkets.xyz/overtime-v2-is-coming-to-public-beta-e2109ee4d348" />
                        ),
                    }}
                />
            </Label>
        </Container>
    );
};

const Container = styled(FlexDiv)`
    width: 100%;
    align-items: center;
    justify-content: center;
    color: ${(props) => props.theme.textColor.primary};
    background: ${(props) => props.theme.error.textColor.primary};
    min-height: 30px;
    z-index: 102;
    text-align: center;
    padding: 5px 5px;
    @media screen and (max-width: 767px) {
        min-height: 20px;
    }
`;

const Label = styled.span`
    font-size: 16px;
    line-height: 18px;
    font-weight: 400;
    @media screen and (max-width: 767px) {
        font-size: 12px;
        line-height: 14px;
    }
`;

const Bold = styled.a`
    font-weight: 600;
`;

const TextLink = styled.a`
    text-decoration: underline;
    cursor: pointer;
    font-weight: 600;
    color: ${(props) => props.theme.textColor.primary};
`;

const Link: React.FC<{ href: string }> = ({ children, href }) => {
    return (
        <TextLink target="_blank" rel="noreferrer" href={href}>
            {children}
        </TextLink>
    );
};

export default BannerV2;
