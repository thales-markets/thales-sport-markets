import useSportMarketV2Query from 'queries/markets/useSportMarketV2Query';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getSelectedMarket, setSelectedMarket } from 'redux/modules/market';
import { getNetworkId } from 'redux/modules/wallet';
import styled from 'styled-components';
import { SportMarketInfoV2 } from 'types/markets';
import SimpleLoader from '../../../../components/SimpleLoader';
import { FlexDivCentered, FlexDivColumn } from '../../../../styles/common';
import { getMarketNameV2 } from '../../../../utils/marketsV2';
import SelectedMarketDetails from '../SelectedMarketDetails';

const SelectedMarket: React.FC = () => {
    const dispatch = useDispatch();
    const selectedMarket = useSelector(getSelectedMarket);
    const isAppReady = useSelector(getIsAppReady);
    const networkId = useSelector(getNetworkId);
    const [lastValidMarket, setLastValidMarket] = useState<SportMarketInfoV2 | undefined>(undefined);

    const marketQuery = useSportMarketV2Query(selectedMarket, true, networkId, {
        enabled: isAppReady && selectedMarket !== '',
    });

    const marketNameHome = lastValidMarket ? getMarketNameV2(lastValidMarket, 0) : '';
    const marketNameAway = lastValidMarket ? getMarketNameV2(lastValidMarket, 1) : '';

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
            <CloseIcon className="icon icon--close" onClick={() => dispatch(setSelectedMarket(''))} />
            {lastValidMarket ? <SelectedMarketDetails market={lastValidMarket} /> : <SimpleLoader />}
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivColumn)`
    margin-top: 10px;
    position: relative;
    background-color: ${(props) => props.theme.background.quinary};
    border-radius: 8px;
    flex: 1 1 0;
    height: min-content;
`;

const Title = styled(FlexDivCentered)`
    font-size: 12px;
    line-height: 12px;
    border-bottom: 1px solid ${(props) => props.theme.borderColor.primary};
    padding: 5px 0;
`;

const CloseIcon = styled.i`
    font-size: 10px;
    color: ${(props) => props.theme.textColor.secondary};
    position: absolute;
    top: 6px;
    right: 2px;
    margin-right: 2px;
    cursor: pointer;
`;

export default SelectedMarket;
