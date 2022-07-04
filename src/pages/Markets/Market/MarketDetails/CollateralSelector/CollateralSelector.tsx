import React from 'react';
import {
    AssetContainer,
    CollateralIcon,
    CollateralName,
    Container,
    Label,
    LabelValueContainer,
} from './styled-components';
// import CurrencyIcon from 'components/Currency/v2/CurrencyIcon';
import { getStableIcon, StablecoinKey } from 'utils/collaterals';
import { useTranslation } from 'react-i18next';

type CollateralSelectorProps = {
    collateralArray: Array<string>;
    selectedItem: number;
    onChangeCollateral: (index: number) => void;
};

const CollateralSelector: React.FC<CollateralSelectorProps> = ({
    collateralArray,
    selectedItem,
    onChangeCollateral,
}) => {
    const { t } = useTranslation();
    return (
        <Container>
            <LabelValueContainer>
                <Label>{t('market.pay-with')}</Label>
                <CollateralName>{collateralArray[selectedItem]}</CollateralName>
            </LabelValueContainer>
            <AssetContainer>
                {collateralArray.length &&
                    collateralArray.map((item, index) => {
                        const AssetIcon = getStableIcon(item as StablecoinKey);
                        return (
                            <CollateralIcon active={selectedItem == index} key={index}>
                                <AssetIcon
                                    key={index}
                                    onClick={() => onChangeCollateral(index)}
                                    style={{
                                        ...(selectedItem == index
                                            ? {
                                                  opacity: '1',
                                              }
                                            : {
                                                  opacity: '0.5',
                                              }),
                                        marginRight: 7,
                                        width: '40px',
                                        height: '40px',
                                    }}
                                />
                            </CollateralIcon>
                        );
                    })}
            </AssetContainer>
        </Container>
    );
};

export default CollateralSelector;
