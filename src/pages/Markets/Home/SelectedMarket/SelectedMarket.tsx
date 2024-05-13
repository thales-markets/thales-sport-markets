import SimpleLoader from 'components/SimpleLoader';
import useSportMarketV2Query from 'queries/markets/useSportMarketV2Query';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getSelectedMarket, setMarketTypeFilter, setSelectedMarket } from 'redux/modules/market';
import { getNetworkId } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn } from 'styles/common';
import { SportMarket } from 'types/markets';
import { getTeamNameV2 } from 'utils/marketsV2';
import SelectedMarketDetails from '../SelectedMarketDetails';

const SelectedMarket: React.FC = () => {
    const dispatch = useDispatch();
    const selectedMarket = useSelector(getSelectedMarket);
    const isAppReady = useSelector(getIsAppReady);
    const networkId = useSelector(getNetworkId);
    const [lastValidMarket, setLastValidMarket] = useState<SportMarket | undefined>(undefined);

    const marketQuery = useSportMarketV2Query(selectedMarket?.gameId || '', true, networkId, {
        enabled: isAppReady && !!selectedMarket,
    });

    const marketNameHome = lastValidMarket ? getTeamNameV2(lastValidMarket, 0) : '';
    const marketNameAway = lastValidMarket ? getTeamNameV2(lastValidMarket, 1) : '';

    const matchLabel = `${marketNameHome}${
        lastValidMarket && !lastValidMarket.isOneSideMarket ? ` - ${marketNameAway}` : ''
    }`;

    useEffect(() => {
        if (marketQuery.isSuccess && marketQuery.data) {
            setLastValidMarket(marketQuery.data);
        }
    }, [selectedMarket, marketQuery.isSuccess, marketQuery.data]);

    return (
        <Wrapper>
            {lastValidMarket && <Title>{matchLabel}</Title>}
            <CloseIcon
                className="icon icon--close"
                onClick={() => {
                    dispatch(setMarketTypeFilter([]));
                    dispatch(setSelectedMarket(undefined));
                }}
            />
            {lastValidMarket ? (
                <SelectedMarketDetails market={lastValidMarket} />
            ) : (
                <LoaderContainer>
                    <SimpleLoader />
                </LoaderContainer>
            )}
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivColumn)`
    margin-top: 10px;
    position: relative;
    background-color: ${(props) => props.theme.background.quinary};
    border-radius: 8px;
    flex: 1 1 0;
    height: auto;
`;

const LoaderContainer = styled(FlexDivCentered)`
    position: relative;
    width: 100%;
    background-color: ${(props) => props.theme.background.quinary};
    border-radius: 0 0 8px 8px;
    flex: 1;
`;

const Title = styled(FlexDivCentered)`
    font-size: 12px;
    line-height: 12px;
    border-bottom: 1px solid ${(props) => props.theme.borderColor.primary};
    padding: 5px 0;
`;

const CloseIcon = styled.i`
    font-size: 12px;
    color: ${(props) => props.theme.textColor.secondary};
    position: absolute;
    top: 4px;
    right: 12px;
    cursor: pointer;
`;

export default SelectedMarket;
