import React from 'react';
import { useSelector } from 'react-redux';
import { getParlay } from 'redux/modules/parlay';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import Match from './components/Match';

const Parlay: React.FC = () => {
    const parlay = useSelector(getParlay);

    return (
        <Container>
            <ListContainer>
                {parlay.map((market, index) => {
                    return (
                        <RowMarket key={index}>
                            <Match market={market} />
                        </RowMarket>
                    );
                })}
            </ListContainer>
            <HorizontalLine />
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    padding: 10px;
    max-width: 250px;
    flex-grow: 1;
    background: linear-gradient(180deg, #303656 0%, #1a1c2b 100%);
    border-radius: 10px;
`;

const ListContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const RowMarket = styled.div`
    display: flex;
    position: relative;
    margin: 10px 0;
    height: 40px;
    align-items: center;
    text-align: center;
`;

const HorizontalLine = styled.hr`
    width: 100%;
    border: 1px solid #5f6180;
    border-radius: 2px;
`;

export default Parlay;
