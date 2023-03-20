import styled from 'styled-components';
import React, { useState } from 'react';
import TableByVolume from './components/TableByVolume';
import TableByGuessedCorrectly from './components/TableByGuessedCorrectly';
import Search from 'components/Search';
import { useTranslation } from 'react-i18next';

const Leaderboard: React.FC = () => {
    const { t } = useTranslation();
    const [searchText, setSearchText] = useState<string>('');

    return (
        <>
            <SearchContainer>
                <Search
                    text={searchText}
                    customPlaceholder={t('quiz.leaderboard.search-placeholder')}
                    handleChange={(e) => setSearchText(e)}
                    width={230}
                />
            </SearchContainer>
            <TablesContainer>
                <TableByVolume searchText={searchText} />
                <TableByGuessedCorrectly searchText={searchText} />
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
`;

export default Leaderboard;
