import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import LevelCircles from '../LevelCircles';

const Explainer: React.FC = () => {
    const { t } = useTranslation();

    const [showMore, setShowMore] = useState<boolean>(false);

    return (
        <Wrapper onClick={() => setShowMore(!showMore)}>
            <Label>{t('overdrop.leveling-tree.explainer.xp-explained')}</Label>

            <Arrow className={`icon ${showMore ? 'icon--arrow-up' : 'icon--arrow-down'}`} />

            {showMore && (
                <>
                    <Content>
                        <Trans
                            i18nKey="overdrop.leveling-tree.explainer.xp-explained-content"
                            components={{
                                br: <br />,
                                bold: <Bold />,
                                highlight: <HighlightedText />,
                            }}
                        />
                    </Content>
                    <Label>{t('overdrop.leveling-tree.explainer.base-xp-accrual')}</Label>
                    <Content>
                        <Trans
                            i18nKey="overdrop.leveling-tree.explainer.base-xp-content"
                            components={{
                                br: <br />,
                                bold: <Bold />,
                                highlight: <HighlightedText />,
                            }}
                        />
                    </Content>
                    <Label>{t('overdrop.leveling-tree.explainer.xp-boost')}</Label>
                    <Content>
                        <Trans
                            i18nKey="overdrop.leveling-tree.explainer.xp-boost-content"
                            components={{
                                bold: <Bold />,
                            }}
                        />
                    </Content>
                    <Label>{t('overdrop.leveling-tree.explainer.daily-bonus')}</Label>
                    <LevelCircles
                        levels={[1, 2, 3, 4, 5, 6, 7]}
                        displayLevelNumberInsideCircle={true}
                        additionalLabelsForLevels={['5%', '10%', '15%', '20%', '25%', '30%', '35%']}
                        currentLevel={7}
                    />
                    <Content>
                        <Trans
                            i18nKey="overdrop.leveling-tree.explainer.days-content"
                            components={{
                                bold: <Bold />,
                            }}
                        />
                    </Content>
                    <Label>{t('overdrop.leveling-tree.explainer.weekly-boost')}</Label>
                    <LevelCircles
                        levels={[1, 2, 3, 4]}
                        displayLevelNumberInsideCircle={true}
                        additionalLabelsForLevels={['5%', '10%', '15%', '20%']}
                        currentLevel={4}
                    />
                    <Content>
                        <Trans
                            i18nKey="overdrop.leveling-tree.explainer.weekly-boost-content"
                            components={{
                                bold: <Bold />,
                            }}
                        />
                    </Content>
                    <Label>{t('overdrop.leveling-tree.explainer.parlay-xp')}</Label>
                    <LevelCircles
                        levels={[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]}
                        displayLevelNumberInsideCircle={true}
                        additionalLabelsForLevels={[
                            '10%',
                            '20%',
                            '30%',
                            '40%',
                            '60%',
                            '80%',
                            '100%',
                            '120%',
                            '140%',
                            '170%',
                            '200%',
                            '230%',
                            '260%',
                            '290%',
                        ]}
                        additionalStyles={{ flexWrap: 'wrap', gap: 14 }}
                        currentLevel={15}
                    />
                    <Content>
                        <Trans
                            i18nKey="overdrop.leveling-tree.explainer.parlay-content"
                            components={{
                                bold: <Bold />,
                            }}
                        />
                    </Content>
                    <Label>{t('overdrop.leveling-tree.explainer.positions-thales')}</Label>
                    <Content>
                        <Trans
                            i18nKey="overdrop.leveling-tree.explainer.position-thales-content"
                            components={{
                                br: <br />,
                                bold: <Bold />,
                                highlight: <HighlightedText />,
                            }}
                        />
                    </Content>
                    <Label>{t('overdrop.leveling-tree.explainer.twitter-share-bonus')}</Label>
                    <Content>
                        <Trans
                            i18nKey="overdrop.leveling-tree.explainer.twitter-content"
                            components={{
                                br: <br />,
                                bold: <Bold />,
                                highlight: <HighlightedText />,
                            }}
                        />
                    </Content>
                    <Label>{t('overdrop.leveling-tree.explainer.loyalty-boost')}</Label>
                    <Content>
                        <Trans
                            i18nKey="overdrop.leveling-tree.explainer.loyalty-boost-content"
                            components={{
                                br: <br />,
                                bold: <Bold />,
                                highlight: <HighlightedText />,
                            }}
                        />
                    </Content>
                </>
            )}
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivColumn)`
    cursor: pointer;
    flex: none;
    position: relative;
    min-width: 30%;
    padding: 6px 16px;
    border: 3px solid transparent;
    margin-bottom: 20px;
    border-radius: 6px;
    background: linear-gradient(${(props) => props.theme.overdrop.background.active} 0 0) padding-box,
        linear-gradient(40deg, rgba(92, 68, 44, 1) 0%, rgba(23, 25, 42, 1) 50%, rgba(92, 68, 44, 1) 100%) border-box;
    @media (max-width: 767px) {
        width: 100%;
    }
`;

const Content = styled.p`
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-size: 13px;
    line-height: 16px;
    font-weight: 200;
    text-align: left;
    white-space: pre-line;
`;

const Label = styled.span`
    color: ${(props) => props.theme.textColor.septenary};
    font-size: 13.5px;
    line-height: 16px;
    font-weight: 900;
    text-transform: uppercase;
    margin: 10px 0px;
`;

const HighlightedText = styled.span`
    display: inline-block;
    font-weight: 800;
    color: ${(props) => props.theme.overdrop.textColor.primary};
    line-height: 16px;
`;

const Bold = styled.span`
    display: inline-block;
    font-weight: 800;
    line-height: 16px;
`;

const Arrow = styled.i`
    position: absolute;
    top: 15px;
    right: 15px;
    font-size: 12px;
    color: ${(props) => props.theme.textColor.septenary};
`;

export default Explainer;
