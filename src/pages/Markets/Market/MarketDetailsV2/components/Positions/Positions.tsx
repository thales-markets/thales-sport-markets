import PositionSymbol from 'components/PositionSymbol';
import { USD_SIGN } from 'constants/currency';
import { Position, Side } from 'constants/options';
import { ODDS_COLOR } from 'constants/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AvailablePerSide, MarketData } from 'types/markets';
import { floorNumberToDecimals, formatCurrencyWithKey } from 'utils/formatters/number';
import { getVisibilityOfDrawOptionByTagId } from 'utils/markets';
import { InnerContrainer, Label, TeamOptionContainer, Value, Wrapper } from './styled-components';

type PositionsProps = {
    market: MarketData;
    selectedSide: Side;
    availablePerSide: AvailablePerSide | null;
};

const Positions: React.FC<PositionsProps> = ({ market, selectedSide, availablePerSide }) => {
    const { t } = useTranslation();

    const disabledDrawOption = !(market?.positions[Position.DRAW]?.sides[selectedSide]?.odd > 0);
    const disableddHomeOption = !(market?.positions[Position.HOME]?.sides[selectedSide]?.odd > 0);
    const disabledAwayOption = !(market?.positions[Position.AWAY]?.sides[selectedSide]?.odd > 0);

    const showDrawOdds = getVisibilityOfDrawOptionByTagId(market.tags);

    return (
        <Wrapper>
            <TeamOptionContainer disabled={disableddHomeOption}>
                <InnerContrainer>
                    <PositionSymbol
                        type={0}
                        symbolColor={ODDS_COLOR.HOME}
                        additionalText={{
                            firstText: market.homeTeam,
                            firstTextStyle: { fontSize: '19px', marginLeft: '15px', textTransform: 'uppercase' },
                        }}
                    />
                </InnerContrainer>
                <InnerContrainer>
                    <Label>{t('markets.market-details.price')}</Label>
                    <Value>
                        {formatCurrencyWithKey(USD_SIGN, market.positions[Position.HOME]?.sides[selectedSide]?.odd, 2)}
                    </Value>
                </InnerContrainer>
                <InnerContrainer>
                    <Label>{t('markets.market-details.liquidity')}</Label>
                    <Value>
                        {availablePerSide
                            ? floorNumberToDecimals(availablePerSide.positions[Position.HOME].available)
                            : '-'}
                    </Value>
                </InnerContrainer>
            </TeamOptionContainer>
            {showDrawOdds && (
                <TeamOptionContainer disabled={disabledDrawOption}>
                    <InnerContrainer>
                        <PositionSymbol
                            type={2}
                            symbolColor={ODDS_COLOR.DRAW}
                            additionalText={{
                                firstText: 'DRAW',
                                firstTextStyle: { fontSize: '19px', marginLeft: '15px', textTransform: 'uppercase' },
                            }}
                        />
                    </InnerContrainer>
                    <InnerContrainer>
                        <Label>{t('markets.market-details.price')}</Label>
                        <Value>
                            {formatCurrencyWithKey(
                                USD_SIGN,
                                market.positions[Position.DRAW]?.sides[selectedSide]?.odd,
                                2
                            )}
                        </Value>
                    </InnerContrainer>
                    <InnerContrainer>
                        <Label>{t('markets.market-details.liquidity')}</Label>
                        <Value>
                            {availablePerSide
                                ? floorNumberToDecimals(availablePerSide.positions[Position.DRAW].available)
                                : '-'}
                        </Value>
                    </InnerContrainer>
                </TeamOptionContainer>
            )}
            <TeamOptionContainer disabled={disabledAwayOption}>
                <InnerContrainer>
                    <PositionSymbol
                        type={1}
                        symbolColor={ODDS_COLOR.AWAY}
                        additionalText={{
                            firstText: market.awayTeam,
                            firstTextStyle: { fontSize: '19px', marginLeft: '15px', textTransform: 'uppercase' },
                        }}
                    />
                </InnerContrainer>
                <InnerContrainer>
                    <Label>{t('markets.market-details.price')}</Label>
                    <Value>
                        {formatCurrencyWithKey(USD_SIGN, market.positions[Position.AWAY]?.sides[selectedSide]?.odd, 2)}
                    </Value>
                </InnerContrainer>
                <InnerContrainer>
                    <Label>{t('markets.market-details.liquidity')}</Label>
                    <Value>
                        {availablePerSide
                            ? floorNumberToDecimals(availablePerSide.positions[Position.AWAY].available)
                            : '-'}
                    </Value>
                </InnerContrainer>
            </TeamOptionContainer>
        </Wrapper>
    );
};

export default Positions;
