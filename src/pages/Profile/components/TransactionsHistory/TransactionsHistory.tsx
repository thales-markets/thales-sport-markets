import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivStart } from 'styles/common';
import { CategoryContainer, CategoryIcon, CategoryLabel } from '../Positions/styled-components';
import ParlayTransactions from './components/ParlayTransactions';
import SingleTransactions from './components/SingleTransactions';

type TransactionHistoryProps = {
    searchText?: string;
};

const TransactionsHistory: React.FC<TransactionHistoryProps> = ({ searchText }) => {
    const [showSingles, setShow] = useState<boolean>(false);
    const { t } = useTranslation();

    return (
        <>
            <Container>
                <Wrapper active={showSingles} onClick={() => setShow(!showSingles)}>
                    <Icon className="icon icon--claimable-flag" />
                    <Label>{t('profile.categories.single')}</Label>
                </Wrapper>
                <Wrapper active={!showSingles} onClick={() => setShow(!showSingles)}>
                    <Icon className="icon icon--logo" />
                    <Label>{t('profile.categories.parlay')}</Label>
                </Wrapper>
            </Container>
            {showSingles && <SingleTransactions searchText={searchText} />}
            {!showSingles && <ParlayTransactions searchText={searchText} />}
        </>
    );
};

const Container = styled(FlexDivStart)`
    margin-top: 10px;
    margin-left: 20px;
`;

const Icon = styled(CategoryIcon)``;

const Label = styled(CategoryLabel)`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 700;
    font-size: 10px;
    line-height: 12px;
    text-transform: uppercase;
    color: #5f6180;
`;

const Wrapper = styled(CategoryContainer)<{ active: boolean }>`
    flex-direction: row;
    align-items: center;
    margin: 10px 0 !important;
    ${Icon},
    ${Label} {
        color: ${(props) => (props.active ? 'white' : '#5f6180')};
    }
`;

export default TransactionsHistory;
