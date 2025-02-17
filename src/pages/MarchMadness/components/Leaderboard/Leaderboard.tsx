import Search from 'components/Search';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Stats from '../Stats';
import TableByGuessedCorrectly from './components/TableByGuessedCorrectly';
import TableByVolume from './components/TableByVolume';

const Leaderboard: React.FC = () => {
    const { t } = useTranslation();
    const [searchText, setSearchText] = useState<string>('');

    return (
        <>
            <Stats />
            <SearchContainer>
                <Search
                    text={searchText}
                    customPlaceholder={t('quiz.leaderboard.search-placeholder')}
                    handleChange={(e) => setSearchText(e)}
                    width={230}
                />
            </SearchContainer>
            <TablesContainer>
                <TableByGuessedCorrectly searchText={searchText} />
                <TableByVolume searchText={searchText} />
            </TablesContainer>
        </>
    );
};

const SearchContainer = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    margin: 0 0 20px 0;
`;

const TablesContainer = styled.div`
    display: flex;
    flex-direction: row;
    height: auto;
    width: 100%;
    gap: 10px;
    @media (max-width: 900px) {
        flex-direction: column;
    }
`;

export default Leaderboard;
