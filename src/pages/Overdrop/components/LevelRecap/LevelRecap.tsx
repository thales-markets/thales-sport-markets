import React from 'react';
import { useTranslation } from 'react-i18next';

import styled from 'styled-components';
import { FlexDivColumn, FlexDivColumnCentered } from 'styles/common';

import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import BadgeGroup from './components/BadgeGroup';

const LevelRecap: React.FC = () => {
    const { t } = useTranslation();

    const isMobile = useSelector(getIsMobile);

    return (
        <Wrapper>
            <HeadingWrapper>
                <Heading>{t('overdrop.leveling-tree.heading')}</Heading>
                <Disclaimer>{t('overdrop.leveling-tree.payout-disclaimer')}</Disclaimer>
            </HeadingWrapper>
            {isMobile ? (
                <>
                    <BadgeContainer>
                        <BadgeGroup startIndex={1} endIndex={4} />
                    </BadgeContainer>
                    <BadgeContainer>
                        <BadgeGroup startIndex={4} endIndex={7} />
                    </BadgeContainer>
                    <BadgeContainer>
                        <BadgeGroup startIndex={7} endIndex={10} />
                    </BadgeContainer>
                    <BadgeContainer>
                        <BadgeGroup startIndex={10} endIndex={11} />
                    </BadgeContainer>
                </>
            ) : (
                <>
                    <BadgeContainer>
                        <BadgeGroup startIndex={1} endIndex={6} />
                    </BadgeContainer>
                    <BadgeContainer>
                        <BadgeGroup startIndex={6} endIndex={11} />
                    </BadgeContainer>
                </>
            )}
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivColumn)`
    flex-grow: 4;
    justify-content: center;
    align-items: center;
    gap: 28px;
    width: 100%;
    margin-bottom: 70px;
`;

const BadgeContainer = styled.div`
    width: 100%;
    padding: 0 20px;
`;

const HeadingWrapper = styled(FlexDivColumnCentered)`
    text-align: center;
`;

const Heading = styled.h1`
    color: ${(props) => props.theme.overdrop.textColor.primary};
    font-size: 30px;
    font-weight: 400;
    text-transform: capitalize;
    margin: 15px 0px 5px 0px;
`;

const Disclaimer = styled.p`
    font-size: 12px;
    font-style: italic;
`;

export default LevelRecap;
