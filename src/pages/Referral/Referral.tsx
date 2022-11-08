import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ButtonContainer,
    CopyLink,
    GenerateLink,
    InfoContainer,
    KeyValueContainer,
    Label,
    MainInfoContainer,
    Paragraph,
    ParagraphContainer,
    ParagraphHeader,
    Tab,
    TabsContainer,
    Value,
    Wrapper,
} from './styled-components';

const NavigationItems = [
    {
        index: 0,
        i18label: 'referral.nav-items.all-transactions',
    },
    {
        index: 1,
        i18label: 'referral.nav-items.see-result-by-trader',
    },
    {
        index: 2,
        i18label: 'referral.nav-items.affiliate-leaderboard',
    },
];

const Referral: React.FC = () => {
    const { t } = useTranslation();

    const [selectedTab, setSelectedTab] = useState<number>(0);

    return (
        <Wrapper>
            <MainInfoContainer>
                <ButtonContainer>
                    <GenerateLink>{t('referral.generate-link')}</GenerateLink>
                    <CopyLink>{t('referral.copy-link')}</CopyLink>
                </ButtonContainer>
                <InfoContainer>
                    <KeyValueContainer>
                        <Label>{t('referral.trades')}</Label>
                        <Value>{'1000.00'}</Value>
                    </KeyValueContainer>
                    <KeyValueContainer>
                        <Label>{t('referral.total-volume')}</Label>
                        <Value>{'1000.00'}</Value>
                    </KeyValueContainer>
                    <KeyValueContainer>
                        <Label>{t('referral.total-trading-fees')}</Label>
                        <Value>{'1000.00'}</Value>
                    </KeyValueContainer>
                    <KeyValueContainer>
                        <Label win={true}>{t('referral.total-trading-fees')}</Label>
                        <Value win={true}>{'1000.00'}</Value>
                    </KeyValueContainer>
                </InfoContainer>
            </MainInfoContainer>
            <ParagraphContainer>
                <ParagraphHeader>{t('referral.header')}</ParagraphHeader>
                <Paragraph>{t('referral.paragraph')}</Paragraph>
            </ParagraphContainer>
            <TabsContainer>
                {NavigationItems.map((item, index) => {
                    return (
                        <Tab active={selectedTab == item.index} key={index} onClick={() => setSelectedTab(item.index)}>
                            {t(item.i18label)}
                        </Tab>
                    );
                })}
            </TabsContainer>
        </Wrapper>
    );
};

export default Referral;
