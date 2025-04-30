import { LpStatsTab } from 'enums/ui';
import { League } from 'overtime-utils';
import React, { useEffect, useState } from 'react';
import useQueryParam from 'utils/useQueryParams';
import LpStatsByLeague from './LpStatsByLeague';
import LpStatsByLp from './LpStatsByLp';
import LpStatsByType from './LpStatsByType';
import LpStatsNavigation from './LpStatsNavigation';

type LpStatsProps = {
    round: number;
    leagueId: League;
    onlyPP: boolean;
};

const LpStats: React.FC<LpStatsProps> = ({ round, leagueId, onlyPP }) => {
    const [selectedLpStatsTabParam, setSelecteLpStatsTabParam] = useQueryParam('lp-stats', LpStatsTab.BY_LP);
    const [selectedLpStatsTab, setSelectedLpStatsTab] = useState<LpStatsTab>(LpStatsTab.BY_LP);

    useEffect(() => {
        if (Object.values(LpStatsTab).includes(selectedLpStatsTabParam.toLowerCase() as LpStatsTab)) {
            setSelectedLpStatsTab(selectedLpStatsTabParam.toLowerCase() as LpStatsTab);
        } else {
            setSelectedLpStatsTab(LpStatsTab.BY_LP);
        }
    }, [selectedLpStatsTabParam]);

    const handleTabChange = (tab: LpStatsTab) => {
        setSelectedLpStatsTab(tab);
        setSelecteLpStatsTabParam(tab);
    };

    return (
        <>
            <LpStatsNavigation selectedTab={selectedLpStatsTab} setSelectedTab={handleTabChange} />
            {selectedLpStatsTab == LpStatsTab.BY_LP && (
                <LpStatsByLp round={round} leagueId={leagueId} onlyPP={onlyPP} />
            )}
            {selectedLpStatsTab == LpStatsTab.BY_TYPE && (
                <LpStatsByType round={round} leagueId={leagueId} onlyPP={onlyPP} />
            )}
            {selectedLpStatsTab == LpStatsTab.BY_LEAGUE && (
                <LpStatsByLeague round={round} leagueId={leagueId} onlyPP={onlyPP} />
            )}
        </>
    );
};

export default LpStats;
