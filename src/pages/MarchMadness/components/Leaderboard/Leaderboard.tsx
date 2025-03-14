import Search from 'components/Search';
import { ScreenSizeBreakpoint } from 'enums/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Stats from '../Stats';
import TableByGuessedCorrectly from './components/TableByGuessedCorrectly';
import TableByVolume from './components/TableByVolume';

const IS_VOLUME_REWARDS_AVAILABLE = false;

const Leaderboard: React.FC = () => {
    const { t } = useTranslation();
    const [searchText, setSearchText] = useState<string>('');

    const [guessedCorrectlyTableDataLength, setGuessedCorrectlyTableDataLength] = useState(0);
    const [volumeTableDataLength, setVolumeTableDataLength] = useState(0);

    return (
        <>
            <Stats />
            <SearchContainer>
                <Search
                    text={searchText}
                    customPlaceholder={t('common.search')}
                    handleChange={(e) => setSearchText(e)}
                    width={230}
                />
            </SearchContainer>
            <TablesContainer>
                <TableByGuessedCorrectly
                    searchText={searchText}
                    isMainHeight={guessedCorrectlyTableDataLength >= volumeTableDataLength}
                    setLength={setGuessedCorrectlyTableDataLength}
                />
                {IS_VOLUME_REWARDS_AVAILABLE && (
                    <TableByVolume
                        searchText={searchText}
                        isMainHeight={guessedCorrectlyTableDataLength < volumeTableDataLength}
                        setLength={setVolumeTableDataLength}
                    />
                )}
            </TablesContainer>
        </>
    );
};

const SearchContainer = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    margin: 0 0 20px 0;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        height: 36px;
    }
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
