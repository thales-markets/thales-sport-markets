import { LiveTag, MarketPositionContainer, MatchLabel } from 'components/MatchInfoV2/styled-components';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { removeFromTicket } from 'redux/modules/ticket';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumn } from 'styles/common';
import { TicketPosition } from 'types/markets';
import { getMatchLabel, getTitleText } from 'utils/marketsV2';
import MatchLogosV2 from '../MatchLogosV2';

type MatchInfoProps = {
    market: TicketPosition;
    readOnly?: boolean;
    showOddUpdates?: boolean;
    acceptOdds?: boolean;
    setAcceptOdds?: (accept: boolean) => void;
    isLive?: boolean;
    applyPayoutMultiplier: boolean;
};

const MatchUnavailableInfo: React.FC<MatchInfoProps> = ({ market, readOnly, isLive }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const matchLabel = getMatchLabel(market);

    const isLiveTicket = market.live || !!isLive;

    const marketText = useMemo(() => {
        if (isLiveTicket && market.line) {
            return `${getTitleText(market as any, true)} ${market.line}`;
        }
        return;
    }, [market, isLiveTicket]);

    return (
        <>
            <LeftContainer>
                {isLiveTicket && <LiveTag readOnly={readOnly}>{t(`markets.market-card.live`)}</LiveTag>}
                <MatchLogosV2
                    market={market}
                    width={readOnly && isLiveTicket ? '52px' : '55px'}
                    height={readOnly && isLiveTicket ? '24px' : '30px'}
                    logoHeight={readOnly && isLiveTicket ? '24px' : undefined}
                    logoWidth={readOnly && isLiveTicket ? '24px' : undefined}
                />
            </LeftContainer>
            <MarketPositionContainer readOnly={readOnly}>
                <MatchLabel readOnly={readOnly} isLive={isLiveTicket}>
                    {matchLabel}
                    {!readOnly && (
                        <CloseIcon
                            className="icon icon--close"
                            onClick={() => {
                                dispatch(removeFromTicket(market));
                            }}
                        />
                    )}
                </MatchLabel>
                {marketText && <MatchType>{marketText}</MatchType>}
                <Description>{t(`markets.market-card.not-available-for-trading`)}</Description>
            </MarketPositionContainer>
        </>
    );
};

const Description = styled(FlexDiv)`
    text-transform: uppercase;
    font-weight: bold;
`;

const MatchType = styled(FlexDiv)`
    font-weight: bold;
    margin-bottom: 1px;
`;

const CloseIcon = styled.i`
    font-size: 10px;
    color: ${(props) => props.theme.textColor.primary};
    cursor: pointer;
`;

const LeftContainer = styled(FlexDivColumn)`
    flex: initial;
    height: 100%;
    justify-content: center;
    height: 49px;
`;

export default MatchUnavailableInfo;
