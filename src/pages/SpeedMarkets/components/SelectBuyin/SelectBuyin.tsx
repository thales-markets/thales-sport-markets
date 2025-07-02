import SuggestedAmount from 'components/SuggestedAmount';
import { useTheme } from 'styled-components';
import { ThemeInterface } from 'types/ui';

const BUYIN_AMOUNTS = [5, 10, 50, 100, 500];

const SelectBuyin: React.FC = () => {
    const theme: ThemeInterface = useTheme();

    return (
        <SuggestedAmount
            amounts={BUYIN_AMOUNTS}
            insertedAmount={''}
            exchangeRates={null}
            collateralIndex={0}
            changeAmount={(value) => value}
            buttonHeight="32px"
            buttonColor={theme.speedMarkets.button.background.primary}
        />
    );
};

export default SelectBuyin;
