import React from 'react';
import { useTranslation } from 'react-i18next';
import { EligibilityContainer, EligibilityText } from 'pages/MintWorldCupNFT/styled-components';
import { ReactComponent as FirstRectangle } from 'assets/images/favorite-team/first-rectangle.svg';

const AlreadyMinted: React.FC = () => {
    const { t } = useTranslation();

    return (
        <>
            <EligibilityContainer style={{ marginBottom: '28vh' }}>
                <FirstRectangle />
                <EligibilityText>{t('mint-world-cup-nft.already-minted')}</EligibilityText>
            </EligibilityContainer>
        </>
    );
};

export default AlreadyMinted;
