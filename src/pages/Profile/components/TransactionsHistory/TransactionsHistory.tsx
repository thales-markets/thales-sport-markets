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
    const [showSingles, setShowSingles] = useState<boolean>(false);
    const { t } = useTranslation();

    return (
        <>
            <Container>
                <Wrapper active={showSingles}>
                    <Icon className="icon icon--claimable-flag" onClick={() => setShowSingles(true)} />
                    <Label onClick={() => setShowSingles(true)}>{t('profile.categories.single')}</Label>
                </Wrapper>
                <Wrapper active={!showSingles}>
                    <Icon className="icon icon--logo" onClick={() => setShowSingles(false)} />
                    <Label onClick={() => setShowSingles(false)}>{t('profile.categories.parlay')}</Label>
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

const Icon = styled(CategoryIcon)`
    cursor: pointer;
`;

const Label = styled(CategoryLabel)`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 700;
    font-size: 10px;
    line-height: 12px;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.secondary};
`;

const Wrapper = styled(CategoryContainer)<{ active: boolean }>`
    flex-direction: row;
    align-items: center;
    margin: 10px 0 !important;
    ${Icon},
    ${Label} {
        color: ${(props) => (props.active ? props.theme.textColor.primary : props.theme.textColor.secondary)};
    }
`;

export default TransactionsHistory;
