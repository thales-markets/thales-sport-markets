import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import Navigation, { NavigationItem } from './components/Navigation/Navigation';

const NavItems: NavigationItem[] = [
    {
        index: 0,
        i18Label: 'promotions.nav-items.all',
    },
    {
        index: 1,
        i18Label: 'promotions.nav-items.ongoing',
    },
    {
        index: 2,
        i18Label: 'promotions.nav-items.finished',
    },
];

const Promotions: React.FC = () => {
    const { t } = useTranslation();

    const [selectedNavItem, setSelectedNavItem] = useState<number>(0);

    return (
        <Wrapper>
            <HeadingWrapper>
                <Heading>
                    <Trans
                        i18nKey={t('promotions.title')}
                        components={{
                            br: <br />,
                        }}
                    />
                </Heading>
                <Description>{t('promotions.description')}</Description>
            </HeadingWrapper>
            <Navigation
                items={NavItems}
                selectedItemIndex={selectedNavItem}
                onChangeNavItem={(index: number) => setSelectedNavItem(index)}
            />
        </Wrapper>
    );
};

const Wrapper = styled(FlexDiv)`
    flex-direction: column;
    margin-top: 50px;
`;

const HeadingWrapper = styled(FlexDiv)`
    width: 100%;
    align-items: center;
    text-align: center;
    flex-direction: column;
`;

const Heading = styled.h1`
    margin: 70px 0px;
    font-size: 56px;
    font-weight: 900;
    font-family: Nunito;
    color: ${(props) => props.theme.textColor.primary};
`;

const Description = styled.p`
    font-size: 20px;
    font-family: Roboto;
    font-weight: 400;
`;

export default Promotions;
