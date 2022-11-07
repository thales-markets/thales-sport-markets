import React from 'react';
import { useTranslation } from 'react-i18next';
import { EligibilityContainer, EligibilityText } from 'pages/MintWorldCupNFT/styled-components';
import { ReactComponent as HappyFace } from 'assets/images/favorite-team/happy-face.svg';
import { ReactComponent as FirstRectangle } from 'assets/images/favorite-team/first-rectangle.svg';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';

const AlreadyMinted: React.FC = () => {
    const { t } = useTranslation();
    const isMobile = useSelector(getIsMobile);

    return (
        <>
            <EligibilityContainer style={{ marginBottom: '28vh' }}>
                <FirstRectangle />
                <EligibilityText>
                    {t('mint-world-cup-nft.already-minted')}
                    {!isMobile && <HappyFace />}
                </EligibilityText>
            </EligibilityContainer>
        </>
    );
};

export default AlreadyMinted;
