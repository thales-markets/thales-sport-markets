import React from 'react';
import { useTranslation } from 'react-i18next';
import { EligibilityContainer, EligibilityText } from 'pages/MintWorldCupNFT/styled-components';
import { ReactComponent as HappyFace } from 'assets/images/favorite-team/happy-face.svg';
import { ReactComponent as FirstRectangle } from 'assets/images/favorite-team/first-rectangle.svg';

const AlreadyMinted: React.FC = () => {
    const { t } = useTranslation();

    return (
        <>
            <EligibilityContainer style={{ marginBottom: '33vh' }}>
                <FirstRectangle />
                <EligibilityText>
                    {t('mint-world-cup-nft.already-minted')}
                    <HappyFace />
                </EligibilityText>
            </EligibilityContainer>
        </>
    );
};

export default AlreadyMinted;
