import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    EligibilityContainer,
    EligibilityText,
    InfoContainer,
    InfoContent,
    InfoText,
    StyledButton,
    ListItemContainer,
    ListItem,
    GoToTwitterContainer,
    IncentivesTitle,
} from 'pages/MintWorldCupNFT/styled-components';
import { ReactComponent as HappyFace } from 'assets/images/favorite-team/happy-face.svg';
import { ReactComponent as FirstRectangle } from 'assets/images/favorite-team/first-rectangle.svg';
import { ReactComponent as SecondRectangle } from 'assets/images/favorite-team/second-rectangle.svg';
import { ReactComponent as ArrowRight } from 'assets/images/favorite-team/arrow-right.svg';

type EligibleProps = {
    onChooseNft: VoidFunction;
};

const Eligible: React.FC<EligibleProps> = ({ onChooseNft }) => {
    const { t } = useTranslation();

    return (
        <>
            <EligibilityContainer>
                <FirstRectangle />
                <EligibilityText>
                    {t('mint-world-cup-nft.eligible-text')}
                    <HappyFace />
                </EligibilityText>
            </EligibilityContainer>
            <InfoContainer>
                <SecondRectangle />
                <InfoContent>
                    <InfoText>{t('mint-world-cup-nft.minting-is-free')}</InfoText>
                    <IncentivesTitle>{t('mint-world-cup-nft.incentives')}:</IncentivesTitle>
                    <ListItemContainer>
                        <ArrowRight />
                        <ListItem>{t('mint-world-cup-nft.free-entry')}</ListItem>
                    </ListItemContainer>
                    <GoToTwitterContainer>
                        <StyledButton onClick={onChooseNft}>{t('mint-world-cup-nft.choose-nft')}</StyledButton>
                    </GoToTwitterContainer>
                </InfoContent>
            </InfoContainer>
        </>
    );
};

export default Eligible;
