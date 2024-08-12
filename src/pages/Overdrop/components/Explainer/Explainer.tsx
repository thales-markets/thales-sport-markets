import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import LevelCircles from '../LevelCircles';

const Explainer: React.FC = () => {
    const { t } = useTranslation();

    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const [showMore, setShowMore] = useState<boolean>(false);

    useEffect(() => {
        if (isMobile) {
            setShowMore(false);
        } else {
            setShowMore(true);
        }
    }, [isMobile]);

    return (
        <Wrapper>
            <Label>{t('overdrop.leveling-tree.explainer.xp-explained')}</Label>
            {isMobile && (
                <Arrow
                    className={`icon ${showMore ? 'icon--arrow-up' : 'icon--arrow-down'}`}
                    onClick={() => setShowMore(!showMore)}
                />
            )}
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
                    <Label>{t('overdrop.leveling-tree.explainer.daily-bonus')}</Label>
                    <LevelCircles
                        levels={[2, 3, 4, 5, 6, 7, 14, 28]}
                        displayLevelNumberInsideCircle={true}
                        additionalLabelsForLevels={['10%', '20%', '30%', '40%', '50%', '60%', '80%', '100%']}
                        currentLevel={28}
                    />
                    <Content>{t('overdrop.leveling-tree.explainer.days')}</Content>
                    <Label>{t('overdrop.leveling-tree.explainer.parlay-xp')}</Label>
                    <LevelCircles
                        levels={[2, 3, 4, 5, 6, 7, 8, 9, 10]}
                        displayLevelNumberInsideCircle={true}
                        additionalLabelsForLevels={['10%', '20%', '30%', '40%', '50%', '70%', '60%', '80%', '100%']}
                        currentLevel={10}
                    />
                    <Content>{t('overdrop.leveling-tree.explainer.games-in-parlay')}</Content>
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
                </>
            )}
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivColumn)`
    position: relative;
    min-width: 30%;
    padding: 12px 9px 12px 12px;
    border: 3px solid transparent;
    border-radius: 6px;
    background: linear-gradient(${(props) => props.theme.overdrop.background.active} 0 0) padding-box,
        linear-gradient(40deg, rgba(92, 68, 44, 1) 0%, rgba(23, 25, 42, 1) 50%, rgba(92, 68, 44, 1) 100%) border-box;
    @media (max-width: 767px) {
        width: 100%;
    }
`;

const Content = styled.p`
    font-size: 13.5px;
    font-weight: 300;
    text-align: left;
`;

const Label = styled.span`
    color: ${(props) => props.theme.textColor.septenary};
    font-size: 13.5px;
    font-weight: 900;
    text-transform: uppercase;
    margin: 10px 0px;
`;

const HighlightedText = styled.span`
    display: inline-block;
    font-weight: 800;
    color: ${(props) => props.theme.overdrop.textColor.primary};
`;

const Bold = styled.span`
    display: inline-block;
    font-weight: 800;
`;

const Arrow = styled.i`
    position: absolute;
    top: 15px;
    right: 15px;
    font-size: 12px;
    color: ${(props) => props.theme.textColor.septenary};
`;

export default Explainer;
