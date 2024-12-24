import { MarketType, MarketTypeGroup } from 'enums/marketTypes';
import { SportFilter } from 'enums/markets';
import { MarketTypeInfo } from 'types/marketTypes';
import { Sport } from '../enums/sports';

export const MarketTypeMap: Record<MarketType, MarketTypeInfo> = {
    // Winner
    [MarketType.WINNER]: {
        id: MarketType.WINNER,
        key: 'winner',
        name: 'Winner',
    },
    // Winner without draw
    [MarketType.DRAW_NO_BET]: {
        id: MarketType.DRAW_NO_BET,
        key: 'drawNoBet',
        name: 'Draw no bet',
    },
    // Winner with draw - for hockey
    [MarketType.WINNER2]: {
        id: MarketType.WINNER2,
        key: 'winner2',
        name: 'Winner 3-way (60 min)',
    },
    // Winner (placeholder)
    [MarketType.WINNER3]: {
        id: MarketType.WINNER3,
        key: 'winner3',
        name: 'Winner',
    },
    // Winner period - half for soccer, quarter for basketball
    [MarketType.FIRST_PERIOD_WINNER]: {
        id: MarketType.FIRST_PERIOD_WINNER,
        key: 'firstPeriodWinner',
        name: 'Winner 1st',
    },
    // Who will score first
    [MarketType.FIRST_SCORE]: {
        id: MarketType.FIRST_SCORE,
        key: 'firstScore',
        name: 'First',
    },
    // Who will score last
    [MarketType.LAST_SCORE]: {
        id: MarketType.LAST_SCORE,
        key: 'lastScore',
        name: 'Last',
    },
    // Clean sheet per team
    [MarketType.CLEAN_SHEET_HOME_TEAM]: {
        id: MarketType.CLEAN_SHEET_HOME_TEAM,
        key: 'cleanSheetHomeTeam',
        name: 'Clean sheet',
    },
    [MarketType.CLEAN_SHEET_AWAY_TEAM]: {
        id: MarketType.CLEAN_SHEET_AWAY_TEAM,
        key: 'cleanSheetAwayTeam',
        name: 'Clean sheet',
    },
    [MarketType.SECOND_PERIOD_WINNER]: {
        id: MarketType.SECOND_PERIOD_WINNER,
        key: 'secondPeriodWinner',
        name: 'Winner 2nd',
    },
    [MarketType.THIRD_PERIOD_WINNER]: {
        id: MarketType.THIRD_PERIOD_WINNER,
        key: 'thirdPeriodWinner',
        name: 'Winner 3rd',
    },
    [MarketType.FOURTH_PERIOD_WINNER]: {
        id: MarketType.FOURTH_PERIOD_WINNER,
        key: 'fourthPeriodWinner',
        name: 'Winner 4th',
    },
    [MarketType.FIFTH_PERIOD_WINNER]: {
        id: MarketType.FIFTH_PERIOD_WINNER,
        key: 'fifthPeriodWinner',
        name: 'Winner 5th',
    },
    [MarketType.SIXTH_PERIOD_WINNER]: {
        id: MarketType.SIXTH_PERIOD_WINNER,
        key: 'sixthPeriodWinner',
        name: 'Winner 6th',
    },
    [MarketType.SEVENTH_PERIOD_WINNER]: {
        id: MarketType.SEVENTH_PERIOD_WINNER,
        key: 'seventhPeriodWinner',
        name: 'Winner 7th',
    },
    [MarketType.EIGHTH_PERIOD_WINNER]: {
        id: MarketType.EIGHTH_PERIOD_WINNER,
        key: 'eightPeriodWinner',
        name: 'Winner 8th',
    },
    [MarketType.NINTH_PERIOD_WINNER]: {
        id: MarketType.NINTH_PERIOD_WINNER,
        key: 'ninthPeriodWinner',
        name: 'Winner 9th',
    },
    // Winner period - half for basketball
    [MarketType.FIRST_PERIOD_WINNER2]: {
        id: MarketType.FIRST_PERIOD_WINNER2,
        key: 'firstPeriodWinner2',
        name: 'Winner 1st',
    },
    [MarketType.SECOND_PERIOD_WINNER2]: {
        id: MarketType.SECOND_PERIOD_WINNER2,
        key: 'secondPeriodWinner2',
        name: 'Winner 2nd',
    },
    [MarketType.THIRD_PERIOD_WINNER2]: {
        id: MarketType.THIRD_PERIOD_WINNER2,
        key: 'thirdPeriodWinner2',
        name: 'Winner 3rd',
    },
    [MarketType.FOURTH_PERIOD_WINNER2]: {
        id: MarketType.FOURTH_PERIOD_WINNER2,
        key: 'fourthPeriodWinner2',
        name: 'Winner 4th',
    },
    [MarketType.FIFTH_PERIOD_WINNER2]: {
        id: MarketType.FIFTH_PERIOD_WINNER2,
        key: 'fifthPeriodWinner2',
        name: 'Winner 5th',
    },
    [MarketType.SIXTH_PERIOD_WINNER2]: {
        id: MarketType.SIXTH_PERIOD_WINNER2,
        key: 'sixthPeriodWinner2',
        name: 'Winner 6th',
    },
    [MarketType.SEVENTH_PERIOD_WINNER2]: {
        id: MarketType.SEVENTH_PERIOD_WINNER2,
        key: 'seventhPeriodWinner2',
        name: 'Winner 7th',
    },
    [MarketType.EIGHTH_PERIOD_WINNER2]: {
        id: MarketType.EIGHTH_PERIOD_WINNER2,
        key: 'eightPeriodWinner2',
        name: 'Winner 8th',
    },
    [MarketType.NINTH_PERIOD_WINNER2]: {
        id: MarketType.NINTH_PERIOD_WINNER2,
        key: 'ninthPeriodWinner2',
        name: 'Winner 9th',
    },
    // Winner without draw period - half for soccer, quarter for basketball
    [MarketType.FIRST_PERIOD_DRAW_NO_BET]: {
        id: MarketType.FIRST_PERIOD_DRAW_NO_BET,
        key: 'firstPeriodDrawNoBet',
        name: 'Draw no bet 1st',
    },
    [MarketType.SECOND_PERIOD_DRAW_NO_BET]: {
        id: MarketType.SECOND_PERIOD_DRAW_NO_BET,
        key: 'secondPeriodDrawNoBet',
        name: 'Draw no bet 2nd',
    },
    [MarketType.THIRD_PERIOD_DRAW_NO_BET]: {
        id: MarketType.THIRD_PERIOD_DRAW_NO_BET,
        key: 'thirdPeriodDrawNoBet',
        name: 'Draw no bet 3rd',
    },
    [MarketType.FOURTH_PERIOD_DRAW_NO_BET]: {
        id: MarketType.FOURTH_PERIOD_DRAW_NO_BET,
        key: 'fourthPeriodDrawNoBet',
        name: 'Draw no bet 4th',
    },

    // Spread (handicap)
    [MarketType.SPREAD]: {
        id: MarketType.SPREAD,
        key: 'spread',
        name: 'Handicap',
    },

    // Spread (handicap) - sets for tennis
    [MarketType.SPREAD2]: {
        id: MarketType.SPREAD2,
        key: 'spread2',
        name: 'Handicap',
    },
    // Spread period - half for soccer, quarter for basketball
    [MarketType.FIRST_PERIOD_SPREAD]: {
        id: MarketType.FIRST_PERIOD_SPREAD,
        key: 'firstPeriodSpread',
        name: 'Handicap 1st',
    },
    [MarketType.SECOND_PERIOD_SPREAD]: {
        id: MarketType.SECOND_PERIOD_SPREAD,
        key: 'secondPeriodSpread',
        name: 'Handicap 2nd',
    },
    [MarketType.THIRD_PERIOD_SPREAD]: {
        id: MarketType.THIRD_PERIOD_SPREAD,
        key: 'thirdPeriodSpread',
        name: 'Handicap 3rd',
    },
    [MarketType.FOURTH_PERIOD_SPREAD]: {
        id: MarketType.FOURTH_PERIOD_SPREAD,
        key: 'fourthPeriodSpread',
        name: 'Handicap 4th',
    },
    [MarketType.FIFTH_PERIOD_SPREAD]: {
        id: MarketType.FIFTH_PERIOD_SPREAD,
        key: 'fifthPeriodSpread',
        name: 'Handicap 5th',
    },
    [MarketType.SIXTH_PERIOD_SPREAD]: {
        id: MarketType.SIXTH_PERIOD_SPREAD,
        key: 'sixthPeriodSpread',
        name: 'Handicap 6th',
    },
    [MarketType.SEVENTH_PERIOD_SPREAD]: {
        id: MarketType.SEVENTH_PERIOD_SPREAD,
        key: 'seventhPeriodSpread',
        name: 'Handicap 7th',
    },
    [MarketType.EIGHTH_PERIOD_SPREAD]: {
        id: MarketType.EIGHTH_PERIOD_SPREAD,
        key: 'eightPeriodSpread',
        name: 'Handicap 8th',
    },
    [MarketType.NINTH_PERIOD_SPREAD]: {
        id: MarketType.NINTH_PERIOD_SPREAD,
        key: 'ninthPeriodSpread',
        name: 'Handicap 9th',
    },
    // Spread period - half for basketball
    [MarketType.FIRST_PERIOD_SPREAD2]: {
        id: MarketType.FIRST_PERIOD_SPREAD2,
        key: 'firstPeriodSpread2',
        name: 'Handicap 1st',
    },
    [MarketType.SECOND_PERIOD_SPREAD2]: {
        id: MarketType.SECOND_PERIOD_SPREAD2,
        key: 'secondPeriodSpread2',
        name: 'Handicap 2nd',
    },
    [MarketType.THIRD_PERIOD_SPREAD2]: {
        id: MarketType.THIRD_PERIOD_SPREAD2,
        key: 'thirdPeriodSpread2',
        name: 'Handicap 3rd',
    },
    [MarketType.FOURTH_PERIOD_SPREAD2]: {
        id: MarketType.FOURTH_PERIOD_SPREAD2,
        key: 'fourthPeriodSpread2',
        name: 'Handicap 4th',
    },
    [MarketType.FIFTH_PERIOD_SPREAD2]: {
        id: MarketType.FIFTH_PERIOD_SPREAD2,
        key: 'fifthPeriodSpread2',
        name: 'Handicap 5th',
    },
    [MarketType.SIXTH_PERIOD_SPREAD2]: {
        id: MarketType.SIXTH_PERIOD_SPREAD2,
        key: 'sixthPeriodSpread2',
        name: 'Handicap 6th',
    },
    [MarketType.SEVENTH_PERIOD_SPREAD2]: {
        id: MarketType.SEVENTH_PERIOD_SPREAD2,
        key: 'seventhPeriodSpread2',
        name: 'Handicap 7th',
    },
    [MarketType.EIGHTH_PERIOD_SPREAD2]: {
        id: MarketType.EIGHTH_PERIOD_SPREAD2,
        key: 'eightPeriodSpread2',
        name: 'Handicap 8th',
    },
    [MarketType.NINTH_PERIOD_SPREAD2]: {
        id: MarketType.NINTH_PERIOD_SPREAD2,
        key: 'ninthPeriodSpread2',
        name: 'Handicap 9th',
    },

    // Total
    [MarketType.TOTAL]: {
        id: MarketType.TOTAL,
        key: 'total',
        name: 'Total',
    },
    // Total - sets for tennis
    [MarketType.TOTAL2]: {
        id: MarketType.TOTAL2,
        key: 'total2',
        name: 'Total',
    },
    // Total period - half for soccer, quarter for basketball
    [MarketType.FIRST_PERIOD_TOTAL]: {
        id: MarketType.FIRST_PERIOD_TOTAL,
        key: 'firstPeriodTotal',
        name: 'Total 1st',
    },
    [MarketType.SECOND_PERIOD_TOTAL]: {
        id: MarketType.SECOND_PERIOD_TOTAL,
        key: 'secondPeriodTotal',
        name: 'Total 2nd',
    },
    [MarketType.THIRD_PERIOD_TOTAL]: {
        id: MarketType.THIRD_PERIOD_TOTAL,
        key: 'thirdPeriodTotal',
        name: 'Total 3rd',
    },
    [MarketType.FOURTH_PERIOD_TOTAL]: {
        id: MarketType.FOURTH_PERIOD_TOTAL,
        key: 'fourthPeriodTotal',
        name: 'Total 4th',
    },
    [MarketType.FIFTH_PERIOD_TOTAL]: {
        id: MarketType.FIFTH_PERIOD_TOTAL,
        key: 'fifthPeriodTotal',
        name: 'Total 5th',
    },
    [MarketType.SIXTH_PERIOD_TOTAL]: {
        id: MarketType.SIXTH_PERIOD_TOTAL,
        key: 'sixthPeriodTotal',
        name: 'Total 6th',
    },
    [MarketType.SEVENTH_PERIOD_TOTAL]: {
        id: MarketType.SEVENTH_PERIOD_TOTAL,
        key: 'seventhPeriodTotal',
        name: 'Total 7th',
    },
    [MarketType.EIGHTH_PERIOD_TOTAL]: {
        id: MarketType.EIGHTH_PERIOD_TOTAL,
        key: 'eightPeriodTotal',
        name: 'Total 8th',
    },
    [MarketType.NINTH_PERIOD_TOTAL]: {
        id: MarketType.NINTH_PERIOD_TOTAL,
        key: 'ninthPeriodTotal',
        name: 'Total 9th',
    },
    // Total period - half for basketball
    [MarketType.FIRST_PERIOD_TOTAL2]: {
        id: MarketType.FIRST_PERIOD_TOTAL2,
        key: 'firstPeriodTotal2',
        name: 'Total 1st',
    },
    [MarketType.SECOND_PERIOD_TOTAL2]: {
        id: MarketType.SECOND_PERIOD_TOTAL2,
        key: 'secondPeriodTotal',
        name: 'Total 2nd',
    },
    [MarketType.THIRD_PERIOD_TOTAL2]: {
        id: MarketType.THIRD_PERIOD_TOTAL2,
        key: 'thirdPeriodTotal2',
        name: 'Total 3rd',
    },
    [MarketType.FOURTH_PERIOD_TOTAL2]: {
        id: MarketType.FOURTH_PERIOD_TOTAL2,
        key: 'fourthPeriodTotal2',
        name: 'Total 4th',
    },
    [MarketType.FIFTH_PERIOD_TOTAL2]: {
        id: MarketType.FIFTH_PERIOD_TOTAL2,
        key: 'fifthPeriodTotal2',
        name: 'Total 5th',
    },
    [MarketType.SIXTH_PERIOD_TOTAL2]: {
        id: MarketType.SIXTH_PERIOD_TOTAL2,
        key: 'sixthPeriodTotal2',
        name: 'Total 6th',
    },
    [MarketType.SEVENTH_PERIOD_TOTAL2]: {
        id: MarketType.SEVENTH_PERIOD_TOTAL2,
        key: 'seventhPeriodTotal2',
        name: 'Total 7th',
    },
    [MarketType.EIGHTH_PERIOD_TOTAL2]: {
        id: MarketType.EIGHTH_PERIOD_TOTAL2,
        key: 'eightPeriodTotal2',
        name: 'Total 8th',
    },
    [MarketType.NINTH_PERIOD_TOTAL2]: {
        id: MarketType.NINTH_PERIOD_TOTAL2,
        key: 'ninthPeriodTotal2',
        name: 'Total 9th',
    },
    // Total per team
    [MarketType.TOTAL_HOME_TEAM]: {
        id: MarketType.TOTAL_HOME_TEAM,
        key: 'totalHomeTeam',
        name: 'Total',
    },
    [MarketType.TOTAL_AWAY_TEAM]: {
        id: MarketType.TOTAL_AWAY_TEAM,
        key: 'totalAwayTeam',
        name: 'Total',
    },
    // Total per team period - half for soccer
    [MarketType.FIRST_PERIOD_TOTAL_HOME_TEAM]: {
        id: MarketType.FIRST_PERIOD_TOTAL_HOME_TEAM,
        key: 'firstPeriodTotalHomeTeam',
        name: 'Total 1st',
    },
    [MarketType.FIRST_PERIOD_TOTAL_AWAY_TEAM]: {
        id: MarketType.FIRST_PERIOD_TOTAL_AWAY_TEAM,
        key: 'firstPeriodTotalAwayTeam',
        name: 'Total 1st',
    },
    [MarketType.SECOND_PERIOD_TOTAL_HOME_TEAM]: {
        id: MarketType.SECOND_PERIOD_TOTAL_HOME_TEAM,
        key: 'secondPeriodTotalHomeTeam',
        name: 'Total 2nd',
    },
    [MarketType.SECOND_PERIOD_TOTAL_AWAY_TEAM]: {
        id: MarketType.SECOND_PERIOD_TOTAL_AWAY_TEAM,
        key: 'secondPeriodTotalAwayTeam',
        name: 'Total 2nd',
    },
    // Total per team period - half for basketball
    [MarketType.FIRST_PERIOD_TOTAL2_HOME_TEAM]: {
        id: MarketType.FIRST_PERIOD_TOTAL2_HOME_TEAM,
        key: 'firstPeriodTotal2HomeTeam',
        name: 'Total 1st',
    },
    [MarketType.FIRST_PERIOD_TOTAL2_AWAY_TEAM]: {
        id: MarketType.FIRST_PERIOD_TOTAL2_AWAY_TEAM,
        key: 'firstPeriodTotal2AwayTeam',
        name: 'Total 1st',
    },
    [MarketType.SECOND_PERIOD_TOTAL2_HOME_TEAM]: {
        id: MarketType.SECOND_PERIOD_TOTAL2_HOME_TEAM,
        key: 'secondPeriodTotal2HomeTeam',
        name: 'Total 2nd',
    },
    [MarketType.SECOND_PERIOD_TOTAL2_AWAY_TEAM]: {
        id: MarketType.SECOND_PERIOD_TOTAL2_AWAY_TEAM,
        key: 'secondPeriodTotal2AwayTeam',
        name: 'Total 2nd',
    },

    // Total odd/even
    [MarketType.TOTAL_ODD_EVEN]: {
        id: MarketType.TOTAL_ODD_EVEN,
        key: 'totalOddEven',
        name: 'Total odd/even',
    },
    // Total odd/even period - half for soccer, quarter for basketball
    [MarketType.FIRST_PERIOD_TOTAL_ODD_EVEN]: {
        id: MarketType.FIRST_PERIOD_TOTAL_ODD_EVEN,
        key: 'firstPeriodTotalOddEven',
        name: 'Total odd/even 1st',
    },
    [MarketType.SECOND_PERIOD_TOTAL_ODD_EVEN]: {
        id: MarketType.SECOND_PERIOD_TOTAL_ODD_EVEN,
        key: 'secondPeriodTotalOddEven',
        name: 'Total odd/even 2nd',
    },
    [MarketType.THIRD_PERIOD_TOTAL_ODD_EVEN]: {
        id: MarketType.THIRD_PERIOD_TOTAL_ODD_EVEN,
        key: 'thirdPeriodTotalOddEven',
        name: 'Total odd/even 3rd',
    },
    [MarketType.FOURTH_PERIOD_TOTAL_ODD_EVEN]: {
        id: MarketType.FOURTH_PERIOD_TOTAL_ODD_EVEN,
        key: 'fourthPeriodTotalOddEven',
        name: 'Total odd/even 4th',
    },
    [MarketType.FIFTH_PERIOD_TOTAL_ODD_EVEN]: {
        id: MarketType.FIFTH_PERIOD_TOTAL_ODD_EVEN,
        key: 'fifthPeriodTotalOddEven',
        name: 'Total odd/even 5th',
    },
    [MarketType.SIXTH_PERIOD_TOTAL_ODD_EVEN]: {
        id: MarketType.SIXTH_PERIOD_TOTAL_ODD_EVEN,
        key: 'sixthPeriodTotalOddEven',
        name: 'Total odd/even 6th',
    },
    [MarketType.SEVENTH_PERIOD_TOTAL_ODD_EVEN]: {
        id: MarketType.SEVENTH_PERIOD_TOTAL_ODD_EVEN,
        key: 'seventhPeriodTotalOddEven',
        name: 'Total odd/even 7th',
    },
    [MarketType.EIGHTH_PERIOD_TOTAL_ODD_EVEN]: {
        id: MarketType.EIGHTH_PERIOD_TOTAL_ODD_EVEN,
        key: 'eightPeriodTotalOddEven',
        name: 'Total odd/even 8th',
    },
    [MarketType.NINTH_PERIOD_TOTAL_ODD_EVEN]: {
        id: MarketType.NINTH_PERIOD_TOTAL_ODD_EVEN,
        key: 'ninthPeriodTotalOddEven',
        name: 'Total odd/even 9th',
    },
    // Total odd/even period - half for basketball
    [MarketType.FIRST_PERIOD_TOTAL2_ODD_EVEN]: {
        id: MarketType.FIRST_PERIOD_TOTAL2_ODD_EVEN,
        key: 'firstPeriodTotal2OddEven',
        name: 'Total odd/even 1st',
    },
    [MarketType.SECOND_PERIOD_TOTAL2_ODD_EVEN]: {
        id: MarketType.SECOND_PERIOD_TOTAL2_ODD_EVEN,
        key: 'secondPeriodTotal2OddEven',
        name: 'Total odd/even 2nd',
    },
    [MarketType.THIRD_PERIOD_TOTAL2_ODD_EVEN]: {
        id: MarketType.THIRD_PERIOD_TOTAL2_ODD_EVEN,
        key: 'thirdPeriodTotal2OddEven',
        name: 'Total odd/even 3rd',
    },
    [MarketType.FOURTH_PERIOD_TOTAL2_ODD_EVEN]: {
        id: MarketType.FOURTH_PERIOD_TOTAL2_ODD_EVEN,
        key: 'fourthPeriodTotal2OddEven',
        name: 'Total odd/even 4th',
    },
    [MarketType.FIFTH_PERIOD_TOTAL2_ODD_EVEN]: {
        id: MarketType.FIFTH_PERIOD_TOTAL2_ODD_EVEN,
        key: 'fifthPeriodTotal2OddEven',
        name: 'Total odd/even 5th',
    },
    [MarketType.SIXTH_PERIOD_TOTAL2_ODD_EVEN]: {
        id: MarketType.SIXTH_PERIOD_TOTAL2_ODD_EVEN,
        key: 'sixthPeriodTotal2OddEven',
        name: 'Total odd/even 6th',
    },
    [MarketType.SEVENTH_PERIOD_TOTAL2_ODD_EVEN]: {
        id: MarketType.SEVENTH_PERIOD_TOTAL2_ODD_EVEN,
        key: 'seventhPeriodTotal2OddEven',
        name: 'Total odd/even 7th',
    },
    [MarketType.EIGHTH_PERIOD_TOTAL2_ODD_EVEN]: {
        id: MarketType.EIGHTH_PERIOD_TOTAL2_ODD_EVEN,
        key: 'eightPeriodTotal2OddEven',
        name: 'Total odd/even 8th',
    },
    [MarketType.NINTH_PERIOD_TOTAL2_ODD_EVEN]: {
        id: MarketType.NINTH_PERIOD_TOTAL2_ODD_EVEN,
        key: 'ninthPeriodTotal2OddEven',
        name: 'Total odd/even 9th',
    },

    // Double chance
    [MarketType.DOUBLE_CHANCE]: {
        id: MarketType.DOUBLE_CHANCE,
        key: 'doubleChance',
        name: 'Double chance',
    },
    // Double chance period - half for soccer
    [MarketType.FIRST_PERIOD_DOUBLE_CHANCE]: {
        id: MarketType.FIRST_PERIOD_DOUBLE_CHANCE,
        key: 'firstPeriodDoubleChance',
        name: 'Double chance 1st',
    },
    [MarketType.SECOND_PERIOD_DOUBLE_CHANCE]: {
        id: MarketType.SECOND_PERIOD_DOUBLE_CHANCE,
        key: 'secondPeriodDoubleChance',
        name: 'Double chance 2nd',
    },

    // Both teams to score
    [MarketType.BOTH_TEAMS_TO_SCORE]: {
        id: MarketType.BOTH_TEAMS_TO_SCORE,
        key: 'bothTeamsToScore',
        name: 'Both teams to score',
    },
    // Both teams to score period - half for soccer
    [MarketType.FIRST_PERIOD_BOTH_TEAMS_TO_SCORE]: {
        id: MarketType.FIRST_PERIOD_BOTH_TEAMS_TO_SCORE,
        key: 'firstPeriodBothTeamsToScore',
        name: 'Both teams to score 1st',
    },
    [MarketType.SECOND_PERIOD_BOTH_TEAMS_TO_SCORE]: {
        id: MarketType.SECOND_PERIOD_BOTH_TEAMS_TO_SCORE,
        key: 'secondPeriodBothTeamsToScore',
        name: 'Both teams to score 2nd',
    },
    [MarketType.THIRD_PERIOD_BOTH_TEAMS_TO_SCORE]: {
        id: MarketType.THIRD_PERIOD_BOTH_TEAMS_TO_SCORE,
        key: 'thirdPeriodBothTeamsToScore',
        name: 'Both teams to score 3rd',
    },
    [MarketType.FOURTH_PERIOD_BOTH_TEAMS_TO_SCORE]: {
        id: MarketType.FOURTH_PERIOD_BOTH_TEAMS_TO_SCORE,
        key: 'fourthPeriodBothTeamsToScore',
        name: 'Both teams to score 4th',
    },
    [MarketType.FIFTH_PERIOD_BOTH_TEAMS_TO_SCORE]: {
        id: MarketType.FIFTH_PERIOD_BOTH_TEAMS_TO_SCORE,
        key: 'fifthPeriodBothTeamsToScore',
        name: 'Both teams to score 5th',
    },
    [MarketType.SIXTH_PERIOD_BOTH_TEAMS_TO_SCORE]: {
        id: MarketType.SIXTH_PERIOD_BOTH_TEAMS_TO_SCORE,
        key: 'sixthPeriodBothTeamsToScore',
        name: 'Both teams to score 6th',
    },
    [MarketType.SEVENTH_PERIOD_BOTH_TEAMS_TO_SCORE]: {
        id: MarketType.SEVENTH_PERIOD_BOTH_TEAMS_TO_SCORE,
        key: 'seventhPeriodBothTeamsToScore',
        name: 'Both teams to score 7th',
    },
    [MarketType.EIGHTH_PERIOD_BOTH_TEAMS_TO_SCORE]: {
        id: MarketType.EIGHTH_PERIOD_BOTH_TEAMS_TO_SCORE,
        key: 'eightPeriodBothTeamsToScore',
        name: 'Both teams to score 8th',
    },
    [MarketType.NINTH_PERIOD_BOTH_TEAMS_TO_SCORE]: {
        id: MarketType.NINTH_PERIOD_BOTH_TEAMS_TO_SCORE,
        key: 'ninthPeriodBothTeamsToScore',
        name: 'Both teams to score 9th',
    },

    // Combined positions
    [MarketType.WINNER_TOTAL]: {
        id: MarketType.WINNER_TOTAL,
        key: 'winnerTotal',
        name: 'Winner + Total',
    },
    [MarketType.HALFTIME_FULLTIME]: {
        id: MarketType.HALFTIME_FULLTIME,
        key: 'halftimeFulltime',
        name: 'Half-time/Full-time',
    },
    [MarketType.GOALS]: {
        id: MarketType.GOALS,
        key: 'goals',
        name: 'Goals',
    },
    [MarketType.HALFTIME_FULLTIME_GOALS]: {
        id: MarketType.HALFTIME_FULLTIME_GOALS,
        key: 'halftimeFulltimeGoals',
        name: 'Half-time/Full-time + Goals',
    },

    // Who will qualify for the next round
    [MarketType.WHO_WILL_QUALIFY]: {
        id: MarketType.WHO_WILL_QUALIFY,
        key: 'whoWillQualify',
        name: 'Who will qualify for the next round',
    },
    // Will there be overtime in the game
    [MarketType.WILL_THERE_BE_OVERTIME]: {
        id: MarketType.WILL_THERE_BE_OVERTIME,
        key: 'willThereBeOvertime',
        name: 'Overtime',
        description: 'Will there be overtime in the game',
    },
    // No runs in the first inning
    [MarketType.FIRST_INNING_NO_RUNS]: {
        id: MarketType.FIRST_INNING_NO_RUNS,
        key: 'firstInningNoRuns',
        name: 'No runs in the first inning',
    },

    // Player props
    [MarketType.PLAYER_PROPS_STRIKEOUTS]: {
        id: MarketType.PLAYER_PROPS_STRIKEOUTS,
        key: 'strikeouts',
        name: 'Strikeouts',
    },
    [MarketType.PLAYER_PROPS_HOMERUNS]: {
        id: MarketType.PLAYER_PROPS_HOMERUNS,
        key: 'homeruns',
        name: 'Home runs',
    },
    [MarketType.PLAYER_PROPS_BASES]: {
        id: MarketType.PLAYER_PROPS_BASES,
        key: 'bases',
        name: 'Bases',
    },
    [MarketType.PLAYER_PROPS_PASSING_YARDS]: {
        id: MarketType.PLAYER_PROPS_PASSING_YARDS,
        key: 'passingYards',
        name: 'Passing yards',
    },
    [MarketType.PLAYER_PROPS_PASSING_TOUCHDOWNS]: {
        id: MarketType.PLAYER_PROPS_PASSING_TOUCHDOWNS,
        key: 'passingTouchdowns',
        name: 'Passing touchdowns',
    },
    [MarketType.PLAYER_PROPS_RUSHING_YARDS]: {
        id: MarketType.PLAYER_PROPS_RUSHING_YARDS,
        key: 'rushingYards',
        name: 'Rushing yards',
    },
    [MarketType.PLAYER_PROPS_RECEIVING_YARDS]: {
        id: MarketType.PLAYER_PROPS_RECEIVING_YARDS,
        key: 'receivingYards',
        name: 'Receiving yards',
    },
    [MarketType.PLAYER_PROPS_TOUCHDOWN_SCORER]: {
        id: MarketType.PLAYER_PROPS_TOUCHDOWN_SCORER,
        key: 'touchdowns',
        name: 'Scoring touchdown',
        description: 'Who will score a touchdown in the game?',
        tooltipKey: 'touchdowns',
    },
    [MarketType.PLAYER_PROPS_FIELD_GOALS_MADE]: {
        id: MarketType.PLAYER_PROPS_FIELD_GOALS_MADE,
        key: 'fieldGoalsMade',
        name: 'Field goals made',
    },
    [MarketType.PLAYER_PROPS_PITCHER_HITS_ALLOWED]: {
        id: MarketType.PLAYER_PROPS_PITCHER_HITS_ALLOWED,
        key: 'pitcherHitsAllowed',
        name: 'Pitcher hits allowed',
    },
    [MarketType.PLAYER_PROPS_POINTS]: {
        id: MarketType.PLAYER_PROPS_POINTS,
        key: 'points',
        name: 'Points',
    },
    [MarketType.PLAYER_PROPS_SHOTS]: {
        id: MarketType.PLAYER_PROPS_SHOTS,
        key: 'shots',
        name: 'Shots',
    },
    [MarketType.PLAYER_PROPS_GOALS]: {
        id: MarketType.PLAYER_PROPS_GOALS,
        key: 'goals',
        name: 'Goals',
        description: 'Who will score a goal in the game?',
    },
    [MarketType.PLAYER_PROPS_HITS_RECORDED]: {
        id: MarketType.PLAYER_PROPS_HITS_RECORDED,
        key: 'hitsRecorded',
        name: 'Hits recorded',
    },
    [MarketType.PLAYER_PROPS_REBOUNDS]: {
        id: MarketType.PLAYER_PROPS_REBOUNDS,
        key: 'rebounds',
        name: 'Rebounds',
    },
    [MarketType.PLAYER_PROPS_ASSISTS]: {
        id: MarketType.PLAYER_PROPS_ASSISTS,
        key: 'assists',
        name: 'Assists',
    },
    [MarketType.PLAYER_PROPS_DOUBLE_DOUBLE]: {
        id: MarketType.PLAYER_PROPS_DOUBLE_DOUBLE,
        key: 'doubleDouble',
        name: 'Double double',
    },
    [MarketType.PLAYER_PROPS_TRIPLE_DOUBLE]: {
        id: MarketType.PLAYER_PROPS_TRIPLE_DOUBLE,
        key: 'tripleDouble',
        name: 'Triple double',
    },
    [MarketType.PLAYER_PROPS_RECEPTIONS]: {
        id: MarketType.PLAYER_PROPS_RECEPTIONS,
        key: 'receptions',
        name: 'Receptions',
    },
    [MarketType.PLAYER_PROPS_FIRST_TOUCHDOWN]: {
        id: MarketType.PLAYER_PROPS_FIRST_TOUCHDOWN,
        key: 'firstTouchdown',
        name: 'First touchdown',
        description: 'Who will score the first touchdown in the game? (incl. OT)',
    },
    [MarketType.PLAYER_PROPS_LAST_TOUCHDOWN]: {
        id: MarketType.PLAYER_PROPS_LAST_TOUCHDOWN,
        key: 'lastTouchdown',
        name: 'Last touchdown',
        description: 'Who will score the last touchdown in the game?',
    },
    [MarketType.PLAYER_PROPS_3PTS_MADE]: {
        id: MarketType.PLAYER_PROPS_3PTS_MADE,
        key: 'threePointsMade',
        name: '3-points made',
    },
    [MarketType.PLAYER_PROPS_BLOCKS]: {
        id: MarketType.PLAYER_PROPS_BLOCKS,
        key: 'blocks',
        name: 'Blocks',
    },
    [MarketType.PLAYER_PROPS_OVER_GOALS]: {
        id: MarketType.PLAYER_PROPS_OVER_GOALS,
        key: 'overGoals',
        name: 'Over goals',
        description: 'How many goals will player score?',
    },

    [MarketType.PLAYER_PROPS_INTERCEPTIONS]: {
        id: MarketType.PLAYER_PROPS_INTERCEPTIONS,
        key: 'interceptions',
        name: 'Interceptions',
    },
    [MarketType.PLAYER_PROPS_KICKING_POINTS]: {
        id: MarketType.PLAYER_PROPS_KICKING_POINTS,
        key: 'KickingPoints',
        name: 'Kicking points',
    },
    [MarketType.PLAYER_PROPS_PASSING_ATTEMPTS]: {
        id: MarketType.PLAYER_PROPS_PASSING_ATTEMPTS,
        key: 'passingAttempts',
        name: 'Passing attempts',
    },
    [MarketType.PLAYER_PROPS_PASSING_COMPLETIONS]: {
        id: MarketType.PLAYER_PROPS_PASSING_COMPLETIONS,
        key: 'passingCompletions',
        name: 'Passing completions',
    },
    [MarketType.PLAYER_PROPS_TOUCHDOWNS]: {
        id: MarketType.PLAYER_PROPS_TOUCHDOWNS,
        key: 'totalTouchdowns', // TODO: new
        name: 'Touchdowns', // TODO: new
    },

    [MarketType.PLAYER_PROPS_SACKS]: {
        id: MarketType.PLAYER_PROPS_SACKS,
        key: 'sacks',
        name: 'Sacks',
        tooltipKey: 'sacks',
    },
    [MarketType.PLAYER_PROPS_PASSING_RUSHING]: {
        id: MarketType.PLAYER_PROPS_PASSING_RUSHING,
        key: 'passingAndRushing',
        name: 'Passing + Rushing Yards',
        tooltipKey: 'passing-rushing',
    },
    [MarketType.PLAYER_PROPS_RUSHING_RECEIVING]: {
        id: MarketType.PLAYER_PROPS_RUSHING_RECEIVING,
        key: 'rushingAndReceiving',
        name: 'Rushing + Receiving Yards',
        tooltipKey: 'rushing-receiving',
    },
    [MarketType.PLAYER_PROPS_LONGEST_RECEPTION]: {
        id: MarketType.PLAYER_PROPS_LONGEST_RECEPTION,
        key: 'longestReception',
        name: 'Longest reception',
        tooltipKey: 'longest-reception',
    },
    [MarketType.PLAYER_PROPS_EXTRA_POINTS]: {
        id: MarketType.PLAYER_PROPS_EXTRA_POINTS,
        key: 'extraPoints',
        name: 'Extra points',
        tooltipKey: 'extra-points',
    },
    [MarketType.PLAYER_PROPS_TACKLES]: {
        id: MarketType.PLAYER_PROPS_TACKLES,
        key: 'tackles',
        name: 'Tackles',
        tooltipKey: 'tackles',
    },

    [MarketType.PLAYER_PROPS_OUTS]: {
        id: MarketType.PLAYER_PROPS_OUTS,
        key: 'outs',
        name: 'Outs recorded',
    },
    [MarketType.PLAYER_PROPS_RBIS]: {
        id: MarketType.PLAYER_PROPS_RBIS,
        key: 'rbis',
        name: 'RBIs O/U',
    },
    [MarketType.PLAYER_PROPS_HITS_RUNS_RBIS]: {
        id: MarketType.PLAYER_PROPS_HITS_RUNS_RBIS,
        key: 'hitsRunsRbis',
        name: 'Hits + Runs + RBIs',
    },
    [MarketType.PLAYER_PROPS_EARNED_RUNS]: {
        id: MarketType.PLAYER_PROPS_EARNED_RUNS,
        key: 'earnedRuns',
        name: 'Earned runs allowed',
    },
    [MarketType.PLAYER_PROPS_DOUBLES]: {
        id: MarketType.PLAYER_PROPS_DOUBLES,
        key: 'doubles',
        name: 'Doubles',
    },
    [MarketType.PLAYER_PROPS_BATTING_WALKS]: {
        id: MarketType.PLAYER_PROPS_BATTING_WALKS,
        key: 'battingWalks',
        name: 'Walks',
    },
    [MarketType.PLAYER_PROPS_BATTING_STRIKEOUTS]: {
        id: MarketType.PLAYER_PROPS_BATTING_STRIKEOUTS,
        key: 'battingStrikeouts',
        name: 'Strikeouts',
    },
    [MarketType.PLAYER_PROPS_SINGLES]: {
        id: MarketType.PLAYER_PROPS_SINGLES,
        key: 'singles',
        name: 'Singles',
    },
    [MarketType.PLAYER_PROPS_STOLEN_BASES]: {
        id: MarketType.PLAYER_PROPS_STOLEN_BASES,
        key: 'stolenBases',
        name: 'Stolen bases',
    },
    [MarketType.PLAYER_PROPS_RUNS]: {
        id: MarketType.PLAYER_PROPS_RUNS,
        key: 'runsScored',
        name: 'Runs scored',
    },
    [MarketType.PLAYER_PROPS_WALKS]: {
        id: MarketType.PLAYER_PROPS_WALKS,
        key: 'walksAllowed',
        name: 'Walks allowed',
    },
    [MarketType.PLAYER_PROPS_POINTS_ASSISTS]: {
        id: MarketType.PLAYER_PROPS_POINTS_ASSISTS,
        key: 'pointsAssists',
        name: 'Points + Assists',
        shortName: 'PTS + AST',
    },
    [MarketType.PLAYER_PROPS_POINTS_REBOUNDS]: {
        id: MarketType.PLAYER_PROPS_POINTS_REBOUNDS,
        key: 'pointsRebound',
        name: 'Points + Rebounds',
        shortName: 'PTS + REB',
    },
    [MarketType.PLAYER_PROPS_POINTS_REBOUNDS_ASSISTS]: {
        id: MarketType.PLAYER_PROPS_POINTS_REBOUNDS_ASSISTS,
        key: 'pointsReboundsAssists',
        name: 'Points + Rebounds + Assists',
        shortName: 'PTS + REB + AST',
    },
    [MarketType.PLAYER_PROPS_REBOUNDS_ASSISTS]: {
        id: MarketType.PLAYER_PROPS_REBOUNDS_ASSISTS,
        key: 'reboundsAssists',
        name: 'Rebounds + Assists',
        shortName: 'REB + AST',
    },
    [MarketType.PLAYER_PROPS_STEALS]: {
        id: MarketType.PLAYER_PROPS_STEALS,
        key: 'steals',
        name: 'Steals',
    },
    [MarketType.PLAYER_PROPS_STEALS_BLOCKS]: {
        id: MarketType.PLAYER_PROPS_STEALS_BLOCKS,
        key: 'stealsBlocks',
        name: 'Steals + Blocks',
    },

    [MarketType.PLAYER_PROPS_CARD_RECEIVER]: {
        id: MarketType.PLAYER_PROPS_CARD_RECEIVER,
        key: 'cardReceiver',
        name: 'Card receiver',
    },
    [MarketType.PLAYER_PROPS_RED_CARD_RECEIVER]: {
        id: MarketType.PLAYER_PROPS_RED_CARD_RECEIVER,
        key: 'redCardReceiver',
        name: 'Red card receiver',
    },
    [MarketType.PLAYER_PROPS_FIRST_SCORER]: {
        id: MarketType.PLAYER_PROPS_FIRST_SCORER,
        key: 'firstScorer',
        name: 'First scorer',
    },
    [MarketType.PLAYER_PROPS_LAST_SCORER]: {
        id: MarketType.PLAYER_PROPS_LAST_SCORER,
        key: 'lastScorer',
        name: 'Last scorer',
    },
    [MarketType.PLAYER_PROPS_SHOTS_ON_TARGET]: {
        id: MarketType.PLAYER_PROPS_SHOTS_ON_TARGET,
        key: 'shotsOnTarget',
        name: 'Shots on target',
    },
    [MarketType.PLAYER_PROPS_TOTAL_SHOTS]: {
        id: MarketType.PLAYER_PROPS_TOTAL_SHOTS,
        key: 'shots',
        name: 'Shots',
    },

    // UFC market types
    [MarketType.WINNING_ROUND]: {
        id: MarketType.WINNING_ROUND,
        key: 'winningRound',
        name: 'Winning round',
    },
    [MarketType.GO_THE_DISTANCE]: {
        id: MarketType.GO_THE_DISTANCE,
        key: 'goTheDistance',
        name: 'Go the distance',
    },
    [MarketType.WILL_FIGHT_END_IN_FIRST_MINUTE]: {
        id: MarketType.WILL_FIGHT_END_IN_FIRST_MINUTE,
        key: 'willFightEndInFirstMinute',
        name: 'First minute finish',
        description: 'Will the fight end in the first minute',
    },
    [MarketType.WILL_POINT_BE_DEDUCTED]: {
        id: MarketType.WILL_POINT_BE_DEDUCTED,
        key: 'willPointBeDeducted',
        name: 'Point to be deducted',
        description: 'Will point be deducted',
    },
    [MarketType.ENDING_METHOD]: {
        id: MarketType.ENDING_METHOD,
        key: 'endingMethod',
        name: 'Ending method',
    },
    [MarketType.METHOD_OF_VICTORY]: {
        id: MarketType.METHOD_OF_VICTORY,
        key: 'methodOfVictory',
        name: 'Method of victory',
    },
    // UFC player props market types
    [MarketType.PLAYER_PROPS_UFC_TAKEDOWNS_LANDED]: {
        id: MarketType.PLAYER_PROPS_UFC_TAKEDOWNS_LANDED,
        key: 'takedownsLanded',
        name: 'Takedowns landed',
    },
    [MarketType.PLAYER_PROPS_UFC_SIGNIFICANT_STRIKES_LANDED]: {
        id: MarketType.PLAYER_PROPS_UFC_SIGNIFICANT_STRIKES_LANDED,
        key: 'significantStrikesLanded',
        name: 'Significant strikes landed',
    },

    // US election market types
    [MarketType.US_ELECTION_POPULAR_VOTE_WINNER]: {
        id: MarketType.US_ELECTION_POPULAR_VOTE_WINNER,
        key: 'popularVoteWinner',
        name: 'Popular vote winner',
    },
    [MarketType.US_ELECTION_WINNING_PARTY]: {
        id: MarketType.US_ELECTION_WINNING_PARTY,
        key: 'winningParty',
        name: 'Winning party',
    },
    [MarketType.US_ELECTION_WINNING_PARTY_ARIZONA]: {
        id: MarketType.US_ELECTION_WINNING_PARTY_ARIZONA,
        key: 'winningPartyArizona',
        name: 'Winning party Arizona',
    },
    [MarketType.US_ELECTION_WINNING_PARTY_GEORGIA]: {
        id: MarketType.US_ELECTION_WINNING_PARTY_GEORGIA,
        key: 'winningPartyGeorgia',
        name: 'Winning party Georgia',
    },
    [MarketType.US_ELECTION_WINNING_PARTY_MICHIGAN]: {
        id: MarketType.US_ELECTION_WINNING_PARTY_MICHIGAN,
        key: 'winningPartyMichigan',
        name: 'Winning party Michigan',
    },
    [MarketType.US_ELECTION_WINNING_PARTY_NEVADA]: {
        id: MarketType.US_ELECTION_WINNING_PARTY_NEVADA,
        key: 'winningPartyNevada',
        name: 'Winning party Nevada',
    },
    [MarketType.US_ELECTION_WINNING_PARTY_PENNSYLVANIA]: {
        id: MarketType.US_ELECTION_WINNING_PARTY_PENNSYLVANIA,
        key: 'winningPartyPennsylvania',
        name: 'Winning party Pennsylvania',
    },
    [MarketType.US_ELECTION_WINNING_PARTY_WINSCONSIN]: {
        id: MarketType.US_ELECTION_WINNING_PARTY_WINSCONSIN,
        key: 'winningPartyWinsconsin',
        name: 'Winning party Winsconsin',
    },
    [MarketType.US_ELECTION_WINNING_PARTY_NORTH_CAROLINA]: {
        id: MarketType.US_ELECTION_WINNING_PARTY_NORTH_CAROLINA,
        key: 'winningPartyNorthCarolina',
        name: 'Winning party North Carolina',
    },
    [MarketType.CORRECT_SCORE]: {
        id: MarketType.CORRECT_SCORE,
        key: 'correctScore',
        name: 'Correct score',
    },

    // Total exact per team
    [MarketType.TOTAL_EXACT_HOME_TEAM]: {
        id: MarketType.TOTAL_EXACT_HOME_TEAM,
        key: 'exactTotalHomeTeam',
        name: 'Exact total',
    },
    [MarketType.TOTAL_EXACT_AWAY_TEAM]: {
        id: MarketType.TOTAL_EXACT_AWAY_TEAM,
        key: 'exactTotalAwayTeam',
        name: 'Exact total',
    },

    // Total exact per team - half for soccer
    [MarketType.FIRST_PERIOD_TOTAL_EXACT_HOME_TEAM]: {
        id: MarketType.FIRST_PERIOD_TOTAL_EXACT_HOME_TEAM,
        key: 'firstPeriodExactTotalHomeTeam',
        name: 'Exact total 1st',
    },
    [MarketType.FIRST_PERIOD_TOTAL_EXACT_AWAY_TEAM]: {
        id: MarketType.FIRST_PERIOD_TOTAL_EXACT_AWAY_TEAM,
        key: 'firstPeriodExactTotalAwayTeam',
        name: 'Exact total 1st',
    },
    [MarketType.SECOND_PERIOD_TOTAL_EXACT_HOME_TEAM]: {
        id: MarketType.SECOND_PERIOD_TOTAL_EXACT_HOME_TEAM,
        key: 'secondPeriodExactTotalHomeTeam',
        name: 'Exact total 2nd',
    },
    [MarketType.SECOND_PERIOD_TOTAL_EXACT_AWAY_TEAM]: {
        id: MarketType.SECOND_PERIOD_TOTAL_EXACT_AWAY_TEAM,
        key: 'secondPeriodExactTotalAwayTeam',
        name: 'Exact total 2nd',
    },

    // Futures
    [MarketType.LEAGUE_WINNER]: {
        id: MarketType.LEAGUE_WINNER,
        key: 'leagueWinner',
        name: 'Champion',
    },
    [MarketType.MVP]: {
        id: MarketType.MVP,
        key: 'mvp',
        name: 'MVP',
    },
    [MarketType.CUP_WINNER]: {
        id: MarketType.CUP_WINNER,
        key: 'cupWinner',
        name: 'Cup winner',
    },

    // Spread (handicap) corners
    [MarketType.SPREAD_CORNERS]: {
        id: MarketType.SPREAD_CORNERS,
        key: 'spreadCorners',
        name: 'Handicap corners',
    },
    // Total corners
    [MarketType.TOTAL_CORNERS]: {
        id: MarketType.TOTAL_CORNERS,
        key: 'totalCorners',
        name: 'Total corners',
    },
    // Total corners per team
    [MarketType.TOTAL_CORNERS_HOME_TEAM]: {
        id: MarketType.TOTAL_CORNERS_HOME_TEAM,
        key: 'totalCornersHomeTeam',
        name: 'Total corners',
    },
    [MarketType.TOTAL_CORNERS_AWAY_TEAM]: {
        id: MarketType.TOTAL_CORNERS_AWAY_TEAM,
        key: 'totalCornersAwayTeam',
        name: 'Total corners',
    },
    // Total corners odd/even
    [MarketType.TOTAL_CORNERS_ODD_EVEN]: {
        id: MarketType.TOTAL_CORNERS_ODD_EVEN,
        key: 'totalCornersOddEven',
        name: 'Total corners odd/even',
    },
    // Total corners period - half for soccer
    [MarketType.FIRST_PERIOD_TOTAL_CORNERS]: {
        id: MarketType.FIRST_PERIOD_TOTAL_CORNERS,
        key: 'firstPeriodTotalCorners',
        name: 'Total corners 1st',
    },
    [MarketType.SECOND_PERIOD_TOTAL_CORNERS]: {
        id: MarketType.SECOND_PERIOD_TOTAL_CORNERS,
        key: 'secondPeriodTotalCorners',
        name: 'Total corners 2nd',
    },
    // Total corners per team period - half for soccer
    [MarketType.FIRST_PERIOD_TOTAL_CORNERS_HOME_TEAM]: {
        id: MarketType.FIRST_PERIOD_TOTAL_CORNERS_HOME_TEAM,
        key: 'firstPeriodTotalCornersHomeTeam',
        name: 'Total corners 1st',
    },
    [MarketType.FIRST_PERIOD_TOTAL_CORNERS_AWAY_TEAM]: {
        id: MarketType.FIRST_PERIOD_TOTAL_CORNERS_AWAY_TEAM,
        key: 'firstPeriodTotalCornersAwayTeam',
        name: 'Total corners 1st',
    },
    [MarketType.SECOND_PERIOD_TOTAL_CORNERS_HOME_TEAM]: {
        id: MarketType.SECOND_PERIOD_TOTAL_CORNERS_HOME_TEAM,
        key: 'secondPeriodTotalCornersHomeTeam',
        name: 'Total corners 2nd',
    },
    [MarketType.SECOND_PERIOD_TOTAL_CORNERS_AWAY_TEAM]: {
        id: MarketType.SECOND_PERIOD_TOTAL_CORNERS_AWAY_TEAM,
        key: 'secondPeriodTotalCornersAwayTeam',
        name: 'Total corners 2nd',
    },
    // Spread corners period - half for soccer
    [MarketType.FIRST_PERIOD_SPREAD_CORNERS]: {
        id: MarketType.FIRST_PERIOD_SPREAD_CORNERS,
        key: 'firstPeriodSpreadCorners',
        name: 'Handicap corners 1st',
    },
    [MarketType.SECOND_PERIOD_SPREAD_CORNERS]: {
        id: MarketType.SECOND_PERIOD_SPREAD_CORNERS,
        key: 'secondPeriodSpreadCorners',
        name: 'Handicap corners 2nd',
    },
    // Most corners
    [MarketType.MOST_CORNERS]: {
        id: MarketType.MOST_CORNERS,
        key: 'mostCorners',
        name: 'Most corners',
    },
    // Most corners period - half for soccer
    [MarketType.FIRST_PERIOD_MOST_CORNERS]: {
        id: MarketType.FIRST_PERIOD_MOST_CORNERS,
        key: 'firstPeriodMostCorners',
        name: 'Most corners 1st',
    },
    [MarketType.SECOND_PERIOD_MOST_CORNERS]: {
        id: MarketType.SECOND_PERIOD_MOST_CORNERS,
        key: 'secondPeriodSpreadCorners',
        name: 'Most corners 2nd',
    },

    // Spread (handicap) cards
    [MarketType.SPREAD_CARDS]: {
        id: MarketType.SPREAD_CARDS,
        key: 'spreadCards',
        name: 'Handicap cards',
    },
    // Total cards
    [MarketType.TOTAL_CARDS]: {
        id: MarketType.TOTAL_CARDS,
        key: 'totalCards',
        name: 'Total cards',
    },
    // Total cards per team
    [MarketType.TOTAL_CARDS_HOME_TEAM]: {
        id: MarketType.TOTAL_CARDS_HOME_TEAM,
        key: 'totalCardsHomeTeam',
        name: 'Total cards',
    },
    [MarketType.TOTAL_CARDS_AWAY_TEAM]: {
        id: MarketType.TOTAL_CARDS_AWAY_TEAM,
        key: 'totalCardsAwayTeam',
        name: 'Total cards',
    },
    // Total red cards
    [MarketType.TOTA_RED_CARDS]: {
        id: MarketType.TOTA_RED_CARDS,
        key: 'totalRedCards',
        name: 'Total red cards',
    },
    // Most cards
    [MarketType.MOST_CARDS]: {
        id: MarketType.MOST_CARDS,
        key: 'mostCards',
        name: 'Most cards',
    },
    //First/last card
    [MarketType.FIRST_CARD]: {
        id: MarketType.FIRST_CARD,
        key: 'firstCards',
        name: 'First card',
    },
    [MarketType.LAST_CARD]: {
        id: MarketType.LAST_CARD,
        key: 'lastCard',
        name: 'Last card',
    },

    [MarketType.EMPTY]: {
        id: MarketType.EMPTY,
        key: '',
        name: '',
        description: undefined,
        tooltipKey: undefined,
    },
};

export const PLAYER_PROPS_MARKET_TYPES = [
    MarketType.PLAYER_PROPS_HOMERUNS,
    MarketType.PLAYER_PROPS_BASES,
    MarketType.PLAYER_PROPS_STRIKEOUTS,
    MarketType.PLAYER_PROPS_PASSING_YARDS,
    MarketType.PLAYER_PROPS_PASSING_TOUCHDOWNS,
    MarketType.PLAYER_PROPS_RUSHING_YARDS,
    MarketType.PLAYER_PROPS_RECEIVING_YARDS,
    MarketType.PLAYER_PROPS_TOUCHDOWN_SCORER,
    MarketType.PLAYER_PROPS_FIELD_GOALS_MADE,
    MarketType.PLAYER_PROPS_PITCHER_HITS_ALLOWED,
    MarketType.PLAYER_PROPS_POINTS,
    MarketType.PLAYER_PROPS_SHOTS,
    MarketType.PLAYER_PROPS_GOALS,
    MarketType.PLAYER_PROPS_HITS_RECORDED,
    MarketType.PLAYER_PROPS_REBOUNDS,
    MarketType.PLAYER_PROPS_ASSISTS,
    MarketType.PLAYER_PROPS_DOUBLE_DOUBLE,
    MarketType.PLAYER_PROPS_TRIPLE_DOUBLE,
    MarketType.PLAYER_PROPS_RECEPTIONS,
    MarketType.PLAYER_PROPS_FIRST_TOUCHDOWN,
    MarketType.PLAYER_PROPS_LAST_TOUCHDOWN,
    MarketType.PLAYER_PROPS_3PTS_MADE,
    MarketType.PLAYER_PROPS_BLOCKS,
    MarketType.PLAYER_PROPS_OVER_GOALS,
    MarketType.PLAYER_PROPS_UFC_TAKEDOWNS_LANDED,
    MarketType.PLAYER_PROPS_UFC_SIGNIFICANT_STRIKES_LANDED,
    MarketType.PLAYER_PROPS_INTERCEPTIONS,
    MarketType.PLAYER_PROPS_KICKING_POINTS,
    MarketType.PLAYER_PROPS_PASSING_ATTEMPTS,
    MarketType.PLAYER_PROPS_PASSING_COMPLETIONS,
    MarketType.PLAYER_PROPS_TOUCHDOWNS,
    MarketType.PLAYER_PROPS_SACKS,
    MarketType.PLAYER_PROPS_RUSHING_RECEIVING,
    MarketType.PLAYER_PROPS_PASSING_RUSHING,
    MarketType.PLAYER_PROPS_LONGEST_RECEPTION,
    MarketType.PLAYER_PROPS_EXTRA_POINTS,
    MarketType.PLAYER_PROPS_TACKLES,
    MarketType.PLAYER_PROPS_OUTS,
    MarketType.PLAYER_PROPS_RBIS,
    MarketType.PLAYER_PROPS_HITS_RUNS_RBIS,
    MarketType.PLAYER_PROPS_EARNED_RUNS,
    MarketType.PLAYER_PROPS_DOUBLES,
    MarketType.PLAYER_PROPS_BATTING_WALKS,
    MarketType.PLAYER_PROPS_BATTING_STRIKEOUTS,
    MarketType.PLAYER_PROPS_SINGLES,
    MarketType.PLAYER_PROPS_STOLEN_BASES,
    MarketType.PLAYER_PROPS_RUNS,
    MarketType.PLAYER_PROPS_WALKS,
    MarketType.PLAYER_PROPS_POINTS_ASSISTS,
    MarketType.PLAYER_PROPS_POINTS_REBOUNDS,
    MarketType.PLAYER_PROPS_POINTS_REBOUNDS_ASSISTS,
    MarketType.PLAYER_PROPS_REBOUNDS_ASSISTS,
    MarketType.PLAYER_PROPS_STEALS,
    MarketType.PLAYER_PROPS_STEALS_BLOCKS,
    MarketType.PLAYER_PROPS_CARD_RECEIVER,
    MarketType.PLAYER_PROPS_RED_CARD_RECEIVER,
    MarketType.PLAYER_PROPS_FIRST_SCORER,
    MarketType.PLAYER_PROPS_LAST_SCORER,
    MarketType.PLAYER_PROPS_SHOTS_ON_TARGET,
    MarketType.PLAYER_PROPS_TOTAL_SHOTS,
];

export const ONE_SIDE_PLAYER_PROPS_MARKET_TYPES = [
    MarketType.PLAYER_PROPS_TOUCHDOWN_SCORER,
    MarketType.PLAYER_PROPS_GOALS,
    MarketType.PLAYER_PROPS_FIRST_TOUCHDOWN,
    MarketType.PLAYER_PROPS_LAST_TOUCHDOWN,
    MarketType.PLAYER_PROPS_CARD_RECEIVER,
    MarketType.PLAYER_PROPS_RED_CARD_RECEIVER,
    MarketType.PLAYER_PROPS_FIRST_SCORER,
    MarketType.PLAYER_PROPS_LAST_SCORER,
];

export const YES_NO_PLAYER_PROPS_MARKET_TYPES = [
    MarketType.PLAYER_PROPS_DOUBLE_DOUBLE,
    MarketType.PLAYER_PROPS_TRIPLE_DOUBLE,
];

export const TOTAL_MARKET_TYPES = [
    MarketType.TOTAL,
    MarketType.TOTAL2,
    MarketType.TOTAL_HOME_TEAM,
    MarketType.TOTAL_AWAY_TEAM,
    MarketType.FIRST_PERIOD_TOTAL,
    MarketType.SECOND_PERIOD_TOTAL,
    MarketType.THIRD_PERIOD_TOTAL,
    MarketType.FOURTH_PERIOD_TOTAL,
    MarketType.FIFTH_PERIOD_TOTAL,
    MarketType.SIXTH_PERIOD_TOTAL,
    MarketType.SEVENTH_PERIOD_TOTAL,
    MarketType.EIGHTH_PERIOD_TOTAL,
    MarketType.NINTH_PERIOD_TOTAL,
    MarketType.FIRST_PERIOD_TOTAL2,
    MarketType.SECOND_PERIOD_TOTAL2,
    MarketType.THIRD_PERIOD_TOTAL2,
    MarketType.FOURTH_PERIOD_TOTAL2,
    MarketType.FIFTH_PERIOD_TOTAL2,
    MarketType.SIXTH_PERIOD_TOTAL2,
    MarketType.SEVENTH_PERIOD_TOTAL2,
    MarketType.EIGHTH_PERIOD_TOTAL2,
    MarketType.NINTH_PERIOD_TOTAL2,
    MarketType.FIRST_PERIOD_TOTAL_HOME_TEAM,
    MarketType.FIRST_PERIOD_TOTAL_AWAY_TEAM,
    MarketType.SECOND_PERIOD_TOTAL_HOME_TEAM,
    MarketType.SECOND_PERIOD_TOTAL_AWAY_TEAM,
    MarketType.FIRST_PERIOD_TOTAL2_HOME_TEAM,
    MarketType.FIRST_PERIOD_TOTAL2_AWAY_TEAM,
    MarketType.SECOND_PERIOD_TOTAL2_HOME_TEAM,
    MarketType.SECOND_PERIOD_TOTAL2_AWAY_TEAM,
    MarketType.TOTAL_CORNERS,
    MarketType.TOTAL_CORNERS_HOME_TEAM,
    MarketType.TOTAL_CORNERS_AWAY_TEAM,
    MarketType.FIRST_PERIOD_TOTAL_CORNERS,
    MarketType.SECOND_PERIOD_TOTAL_CORNERS,
    MarketType.FIRST_PERIOD_TOTAL_CORNERS_HOME_TEAM,
    MarketType.FIRST_PERIOD_TOTAL_CORNERS_AWAY_TEAM,
    MarketType.SECOND_PERIOD_TOTAL_CORNERS_HOME_TEAM,
    MarketType.SECOND_PERIOD_TOTAL_CORNERS_AWAY_TEAM,
    MarketType.TOTAL_CARDS,
    MarketType.TOTAL_CARDS_HOME_TEAM,
    MarketType.TOTAL_CARDS_AWAY_TEAM,
    MarketType.TOTA_RED_CARDS,
];

export const TOTAL_ODD_EVEN_MARKET_TYPES = [
    MarketType.TOTAL_ODD_EVEN,
    MarketType.FIRST_PERIOD_TOTAL_ODD_EVEN,
    MarketType.SECOND_PERIOD_TOTAL_ODD_EVEN,
    MarketType.THIRD_PERIOD_TOTAL_ODD_EVEN,
    MarketType.FOURTH_PERIOD_TOTAL_ODD_EVEN,
    MarketType.FIFTH_PERIOD_TOTAL_ODD_EVEN,
    MarketType.SIXTH_PERIOD_TOTAL_ODD_EVEN,
    MarketType.SEVENTH_PERIOD_TOTAL_ODD_EVEN,
    MarketType.EIGHTH_PERIOD_TOTAL_ODD_EVEN,
    MarketType.NINTH_PERIOD_TOTAL_ODD_EVEN,
    MarketType.FIRST_PERIOD_TOTAL2_ODD_EVEN,
    MarketType.SECOND_PERIOD_TOTAL2_ODD_EVEN,
    MarketType.THIRD_PERIOD_TOTAL2_ODD_EVEN,
    MarketType.FOURTH_PERIOD_TOTAL2_ODD_EVEN,
    MarketType.FIFTH_PERIOD_TOTAL2_ODD_EVEN,
    MarketType.SIXTH_PERIOD_TOTAL2_ODD_EVEN,
    MarketType.SEVENTH_PERIOD_TOTAL2_ODD_EVEN,
    MarketType.EIGHTH_PERIOD_TOTAL2_ODD_EVEN,
    MarketType.NINTH_PERIOD_TOTAL2_ODD_EVEN,
    MarketType.TOTAL_CORNERS_ODD_EVEN,
];

export const SPREAD_MARKET_TYPES = [
    MarketType.SPREAD,
    MarketType.SPREAD2,
    MarketType.FIRST_PERIOD_SPREAD,
    MarketType.SECOND_PERIOD_SPREAD,
    MarketType.THIRD_PERIOD_SPREAD,
    MarketType.FOURTH_PERIOD_SPREAD,
    MarketType.FIFTH_PERIOD_SPREAD,
    MarketType.SIXTH_PERIOD_SPREAD,
    MarketType.SEVENTH_PERIOD_SPREAD,
    MarketType.EIGHTH_PERIOD_SPREAD,
    MarketType.NINTH_PERIOD_SPREAD,
    MarketType.FIRST_PERIOD_SPREAD2,
    MarketType.SECOND_PERIOD_SPREAD2,
    MarketType.THIRD_PERIOD_SPREAD2,
    MarketType.FOURTH_PERIOD_SPREAD2,
    MarketType.FIFTH_PERIOD_SPREAD2,
    MarketType.SIXTH_PERIOD_SPREAD2,
    MarketType.SEVENTH_PERIOD_SPREAD2,
    MarketType.EIGHTH_PERIOD_SPREAD2,
    MarketType.NINTH_PERIOD_SPREAD2,
    MarketType.SPREAD_CORNERS,
    MarketType.FIRST_PERIOD_SPREAD_CORNERS,
    MarketType.SECOND_PERIOD_SPREAD_CORNERS,
    MarketType.SPREAD_CARDS,
];

export const COMBINED_POSITIONS_MARKET_TYPES = [
    MarketType.WINNER_TOTAL,
    MarketType.HALFTIME_FULLTIME,
    MarketType.GOALS,
    MarketType.HALFTIME_FULLTIME_GOALS,
];

export const WINNER_MARKET_TYPES = [
    MarketType.WINNER,
    MarketType.DRAW_NO_BET,
    MarketType.WINNER2,
    MarketType.WINNER3,
    MarketType.FIRST_PERIOD_WINNER,
    MarketType.SECOND_PERIOD_WINNER,
    MarketType.THIRD_PERIOD_WINNER,
    MarketType.FOURTH_PERIOD_WINNER,
    MarketType.FIFTH_PERIOD_WINNER,
    MarketType.SIXTH_PERIOD_WINNER,
    MarketType.SEVENTH_PERIOD_WINNER,
    MarketType.EIGHTH_PERIOD_WINNER,
    MarketType.NINTH_PERIOD_WINNER,
    MarketType.FIRST_PERIOD_WINNER2,
    MarketType.SECOND_PERIOD_WINNER2,
    MarketType.THIRD_PERIOD_WINNER2,
    MarketType.FOURTH_PERIOD_WINNER2,
    MarketType.FIFTH_PERIOD_WINNER2,
    MarketType.SIXTH_PERIOD_WINNER2,
    MarketType.SEVENTH_PERIOD_WINNER2,
    MarketType.EIGHTH_PERIOD_WINNER2,
    MarketType.NINTH_PERIOD_WINNER2,
    MarketType.FIRST_PERIOD_DRAW_NO_BET,
    MarketType.SECOND_PERIOD_DRAW_NO_BET,
    MarketType.THIRD_PERIOD_DRAW_NO_BET,
    MarketType.FOURTH_PERIOD_DRAW_NO_BET,
    MarketType.WHO_WILL_QUALIFY,
    MarketType.MOST_CORNERS,
    MarketType.FIRST_PERIOD_MOST_CORNERS,
    MarketType.SECOND_PERIOD_MOST_CORNERS,
    MarketType.MOST_CARDS,
];

export const BOTH_TEAMS_TO_SCORE_MARKET_TYPES = [
    MarketType.BOTH_TEAMS_TO_SCORE,
    MarketType.FIRST_PERIOD_BOTH_TEAMS_TO_SCORE,
    MarketType.SECOND_PERIOD_BOTH_TEAMS_TO_SCORE,
    MarketType.THIRD_PERIOD_BOTH_TEAMS_TO_SCORE,
    MarketType.FOURTH_PERIOD_BOTH_TEAMS_TO_SCORE,
    MarketType.FIFTH_PERIOD_BOTH_TEAMS_TO_SCORE,
    MarketType.SIXTH_PERIOD_BOTH_TEAMS_TO_SCORE,
    MarketType.SEVENTH_PERIOD_BOTH_TEAMS_TO_SCORE,
    MarketType.EIGHTH_PERIOD_BOTH_TEAMS_TO_SCORE,
    MarketType.NINTH_PERIOD_BOTH_TEAMS_TO_SCORE,
];

export const DOUBLE_CHANCE_MARKET_TYPES = [
    MarketType.DOUBLE_CHANCE,
    MarketType.FIRST_PERIOD_DOUBLE_CHANCE,
    MarketType.SECOND_PERIOD_DOUBLE_CHANCE,
];

const DRAW_NO_BET_MARKET_TYPES = [
    MarketType.DRAW_NO_BET,
    MarketType.FIRST_PERIOD_DRAW_NO_BET,
    MarketType.SECOND_PERIOD_DRAW_NO_BET,
    MarketType.THIRD_PERIOD_DRAW_NO_BET,
    MarketType.FOURTH_PERIOD_DRAW_NO_BET,
];

const FIRST_PERIOD_MARKET_TYPES = [
    MarketType.FIRST_PERIOD_WINNER,
    MarketType.FIRST_PERIOD_TOTAL,
    MarketType.FIRST_PERIOD_SPREAD,
    MarketType.FIRST_PERIOD_TOTAL_ODD_EVEN,
    MarketType.FIRST_PERIOD_DOUBLE_CHANCE,
    MarketType.FIRST_PERIOD_TOTAL_HOME_TEAM,
    MarketType.FIRST_PERIOD_TOTAL_AWAY_TEAM,
    MarketType.FIRST_PERIOD_BOTH_TEAMS_TO_SCORE,
    MarketType.FIRST_PERIOD_DRAW_NO_BET,
    MarketType.FIRST_PERIOD_TOTAL_EXACT_HOME_TEAM,
    MarketType.FIRST_PERIOD_TOTAL_EXACT_HOME_TEAM,
    MarketType.FIRST_PERIOD_TOTAL_CORNERS,
    MarketType.FIRST_PERIOD_TOTAL_CORNERS_HOME_TEAM,
    MarketType.FIRST_PERIOD_TOTAL_CORNERS_AWAY_TEAM,
    MarketType.FIRST_PERIOD_SPREAD_CORNERS,
    MarketType.FIRST_PERIOD_MOST_CORNERS,
];

const SECOND_PERIOD_MARKET_TYPES = [
    MarketType.SECOND_PERIOD_WINNER,
    MarketType.SECOND_PERIOD_TOTAL,
    MarketType.SECOND_PERIOD_SPREAD,
    MarketType.SECOND_PERIOD_TOTAL_ODD_EVEN,
    MarketType.SECOND_PERIOD_DOUBLE_CHANCE,
    MarketType.SECOND_PERIOD_TOTAL_HOME_TEAM,
    MarketType.SECOND_PERIOD_TOTAL_AWAY_TEAM,
    MarketType.SECOND_PERIOD_BOTH_TEAMS_TO_SCORE,
    MarketType.SECOND_PERIOD_DRAW_NO_BET,
    MarketType.SECOND_PERIOD_TOTAL_EXACT_HOME_TEAM,
    MarketType.SECOND_PERIOD_TOTAL_EXACT_HOME_TEAM,
    MarketType.SECOND_PERIOD_TOTAL_CORNERS,
    MarketType.SECOND_PERIOD_TOTAL_CORNERS_HOME_TEAM,
    MarketType.SECOND_PERIOD_TOTAL_CORNERS_AWAY_TEAM,
    MarketType.SECOND_PERIOD_SPREAD_CORNERS,
    MarketType.SECOND_PERIOD_MOST_CORNERS,
];

const THIRD_PERIOD_MARKET_TYPES = [
    MarketType.THIRD_PERIOD_WINNER,
    MarketType.THIRD_PERIOD_TOTAL,
    MarketType.THIRD_PERIOD_SPREAD,
    MarketType.THIRD_PERIOD_TOTAL_ODD_EVEN,
    MarketType.THIRD_PERIOD_BOTH_TEAMS_TO_SCORE,
    MarketType.THIRD_PERIOD_DRAW_NO_BET,
];

const FOURTH_PERIOD_MARKET_TYPES = [
    MarketType.FOURTH_PERIOD_WINNER,
    MarketType.FOURTH_PERIOD_TOTAL,
    MarketType.FOURTH_PERIOD_SPREAD,
    MarketType.FOURTH_PERIOD_TOTAL_ODD_EVEN,
    MarketType.FOURTH_PERIOD_BOTH_TEAMS_TO_SCORE,
    MarketType.FOURTH_PERIOD_DRAW_NO_BET,
];

const FIFTH_PERIOD_MARKET_TYPES = [
    MarketType.FIFTH_PERIOD_WINNER,
    MarketType.FIFTH_PERIOD_TOTAL,
    MarketType.FIFTH_PERIOD_SPREAD,
    MarketType.FIFTH_PERIOD_TOTAL_ODD_EVEN,
    MarketType.FIFTH_PERIOD_BOTH_TEAMS_TO_SCORE,
];

const SIXTH_PERIOD_MARKET_TYPES = [
    MarketType.SIXTH_PERIOD_WINNER,
    MarketType.SIXTH_PERIOD_TOTAL,
    MarketType.SIXTH_PERIOD_SPREAD,
    MarketType.SIXTH_PERIOD_TOTAL_ODD_EVEN,
    MarketType.SIXTH_PERIOD_BOTH_TEAMS_TO_SCORE,
];

const SEVENTH_PERIOD_MARKET_TYPES = [
    MarketType.SEVENTH_PERIOD_WINNER,
    MarketType.SEVENTH_PERIOD_TOTAL,
    MarketType.SEVENTH_PERIOD_SPREAD,
    MarketType.SEVENTH_PERIOD_TOTAL_ODD_EVEN,
    MarketType.SEVENTH_PERIOD_BOTH_TEAMS_TO_SCORE,
];

const EIGHTH_PERIOD_MARKET_TYPES = [
    MarketType.EIGHTH_PERIOD_WINNER,
    MarketType.EIGHTH_PERIOD_TOTAL,
    MarketType.EIGHTH_PERIOD_SPREAD,
    MarketType.EIGHTH_PERIOD_TOTAL_ODD_EVEN,
    MarketType.EIGHTH_PERIOD_BOTH_TEAMS_TO_SCORE,
];

const NINTH_PERIOD_MARKET_TYPES = [
    MarketType.NINTH_PERIOD_WINNER,
    MarketType.NINTH_PERIOD_TOTAL,
    MarketType.NINTH_PERIOD_SPREAD,
    MarketType.NINTH_PERIOD_TOTAL_ODD_EVEN,
    MarketType.NINTH_PERIOD_BOTH_TEAMS_TO_SCORE,
];

const FIRST_PERIOD_MARKET_TYPES2 = [
    MarketType.FIRST_PERIOD_WINNER2,
    MarketType.FIRST_PERIOD_TOTAL2,
    MarketType.FIRST_PERIOD_SPREAD2,
    MarketType.FIRST_PERIOD_TOTAL2_ODD_EVEN,
];

export const HOME_TEAM_MARKET_TYPES = [
    MarketType.TOTAL_HOME_TEAM,
    MarketType.FIRST_PERIOD_TOTAL_HOME_TEAM,
    MarketType.SECOND_PERIOD_TOTAL_HOME_TEAM,
    MarketType.FIRST_PERIOD_TOTAL2_HOME_TEAM,
    MarketType.SECOND_PERIOD_TOTAL2_HOME_TEAM,
    MarketType.CLEAN_SHEET_HOME_TEAM,
    MarketType.TOTAL_EXACT_HOME_TEAM,
    MarketType.FIRST_PERIOD_TOTAL_EXACT_HOME_TEAM,
    MarketType.SECOND_PERIOD_TOTAL_EXACT_HOME_TEAM,
    MarketType.TOTAL_CORNERS_HOME_TEAM,
    MarketType.FIRST_PERIOD_TOTAL_CORNERS_HOME_TEAM,
    MarketType.SECOND_PERIOD_TOTAL_CORNERS_HOME_TEAM,
    MarketType.TOTAL_CARDS_HOME_TEAM,
];

export const AWAY_TEAM_MARKET_TYPES = [
    MarketType.TOTAL_AWAY_TEAM,
    MarketType.FIRST_PERIOD_TOTAL_AWAY_TEAM,
    MarketType.SECOND_PERIOD_TOTAL_AWAY_TEAM,
    MarketType.FIRST_PERIOD_TOTAL2_AWAY_TEAM,
    MarketType.SECOND_PERIOD_TOTAL2_AWAY_TEAM,
    MarketType.CLEAN_SHEET_AWAY_TEAM,
    MarketType.TOTAL_EXACT_AWAY_TEAM,
    MarketType.FIRST_PERIOD_TOTAL_EXACT_AWAY_TEAM,
    MarketType.SECOND_PERIOD_TOTAL_EXACT_AWAY_TEAM,
    MarketType.TOTAL_CORNERS_AWAY_TEAM,
    MarketType.FIRST_PERIOD_TOTAL_CORNERS_AWAY_TEAM,
    MarketType.SECOND_PERIOD_TOTAL_CORNERS_AWAY_TEAM,
    MarketType.TOTAL_CARDS_AWAY_TEAM,
];

export const SCORE_MARKET_TYPES = [MarketType.FIRST_SCORE, MarketType.LAST_SCORE];

export const TOTAL_EXACT_MARKET_TYPES = [
    MarketType.TOTAL_EXACT_HOME_TEAM,
    MarketType.TOTAL_EXACT_AWAY_TEAM,
    MarketType.FIRST_PERIOD_TOTAL_EXACT_HOME_TEAM,
    MarketType.FIRST_PERIOD_TOTAL_EXACT_AWAY_TEAM,
    MarketType.SECOND_PERIOD_TOTAL_EXACT_HOME_TEAM,
    MarketType.SECOND_PERIOD_TOTAL_EXACT_AWAY_TEAM,
];

export const OTHER_YES_NO_MARKET_TYPES = [
    MarketType.CLEAN_SHEET_HOME_TEAM,
    MarketType.CLEAN_SHEET_AWAY_TEAM,
    MarketType.WILL_THERE_BE_OVERTIME,
    MarketType.FIRST_INNING_NO_RUNS,
    MarketType.GO_THE_DISTANCE,
    MarketType.WILL_FIGHT_END_IN_FIRST_MINUTE,
    MarketType.WILL_POINT_BE_DEDUCTED,
];

export const UFC_SPECIFIC_MARKET_TYPES = [
    MarketType.WINNING_ROUND,
    MarketType.ENDING_METHOD,
    MarketType.METHOD_OF_VICTORY,
];

export const FUTURES_MARKET_TYPES = [MarketType.LEAGUE_WINNER, MarketType.MVP, MarketType.CUP_WINNER];

export const CORNERS_MARKET_TYPES = [
    MarketType.SPREAD_CORNERS,
    MarketType.TOTAL_CORNERS,
    MarketType.TOTAL_CORNERS_HOME_TEAM,
    MarketType.TOTAL_CORNERS_AWAY_TEAM,
    MarketType.TOTAL_CORNERS_ODD_EVEN,
    MarketType.FIRST_PERIOD_TOTAL_CORNERS,
    MarketType.SECOND_PERIOD_TOTAL_CORNERS,
    MarketType.FIRST_PERIOD_TOTAL_CORNERS_HOME_TEAM,
    MarketType.FIRST_PERIOD_TOTAL_CORNERS_AWAY_TEAM,
    MarketType.SECOND_PERIOD_TOTAL_CORNERS_HOME_TEAM,
    MarketType.SECOND_PERIOD_TOTAL_CORNERS_AWAY_TEAM,
    MarketType.FIRST_PERIOD_SPREAD_CORNERS,
    MarketType.SECOND_PERIOD_SPREAD_CORNERS,
    MarketType.MOST_CORNERS,
    MarketType.FIRST_PERIOD_MOST_CORNERS,
    MarketType.SECOND_PERIOD_MOST_CORNERS,
];

export const CARDS_MARKET_TYPES = [
    MarketType.SPREAD_CARDS,
    MarketType.TOTAL_CARDS,
    MarketType.TOTAL_CARDS_HOME_TEAM,
    MarketType.TOTAL_CARDS_AWAY_TEAM,
    MarketType.TOTA_RED_CARDS,
    MarketType.MOST_CARDS,
    MarketType.FIRST_CARD,
    MarketType.LAST_CARD,
    MarketType.PLAYER_PROPS_CARD_RECEIVER,
    MarketType.PLAYER_PROPS_RED_CARD_RECEIVER,
];

export const MarketTypesBySportFilter: Record<SportFilter, MarketType[]> = {
    [SportFilter.Boosted]: [MarketType.WINNER, MarketType.SPREAD, MarketType.TOTAL],
    [SportFilter.Live]: [MarketType.WINNER, MarketType.SPREAD, MarketType.TOTAL],
    [SportFilter.Favourites]: [MarketType.WINNER, MarketType.SPREAD, MarketType.TOTAL],
    [SportFilter.All]: [MarketType.WINNER, MarketType.SPREAD, MarketType.TOTAL],
    [SportFilter.Soccer]: [
        MarketType.WINNER,
        MarketType.SPREAD,
        MarketType.TOTAL,
        MarketType.DOUBLE_CHANCE,
        MarketType.DRAW_NO_BET,
        MarketType.BOTH_TEAMS_TO_SCORE,
        MarketType.TOTAL_ODD_EVEN,
    ],
    [SportFilter.Football]: [MarketType.WINNER, MarketType.SPREAD, MarketType.TOTAL, MarketType.TOTAL_ODD_EVEN],
    [SportFilter.Basketball]: [MarketType.WINNER, MarketType.SPREAD, MarketType.TOTAL, MarketType.TOTAL_ODD_EVEN],
    [SportFilter.Baseball]: [MarketType.WINNER, MarketType.SPREAD, MarketType.TOTAL, MarketType.WILL_THERE_BE_OVERTIME],
    [SportFilter.Hockey]: [MarketType.WINNER, MarketType.SPREAD, MarketType.TOTAL],
    [SportFilter.Fighting]: [
        MarketType.WINNER,
        MarketType.SPREAD,
        MarketType.TOTAL,
        MarketType.SPREAD2,
        MarketType.GO_THE_DISTANCE,
        MarketType.WILL_FIGHT_END_IN_FIRST_MINUTE,
        MarketType.WILL_POINT_BE_DEDUCTED,
    ],
    [SportFilter.Tennis]: [MarketType.WINNER, MarketType.SPREAD, MarketType.TOTAL],
    [SportFilter.TableTennis]: [MarketType.WINNER, MarketType.SPREAD, MarketType.TOTAL],
    [SportFilter.eSports]: [MarketType.WINNER, MarketType.SPREAD, MarketType.TOTAL],
    [SportFilter.Rugby]: [MarketType.WINNER, MarketType.SPREAD, MarketType.TOTAL],
    [SportFilter.Volleyball]: [MarketType.WINNER, MarketType.SPREAD, MarketType.TOTAL],
    [SportFilter.Handball]: [
        MarketType.WINNER,
        MarketType.SPREAD,
        MarketType.TOTAL,
        MarketType.DOUBLE_CHANCE,
        MarketType.DRAW_NO_BET,
        MarketType.TOTAL_ODD_EVEN,
    ],
    [SportFilter.Waterpolo]: [MarketType.WINNER, MarketType.SPREAD, MarketType.TOTAL],
    [SportFilter.Cricket]: [MarketType.WINNER, MarketType.SPREAD, MarketType.TOTAL],
    [SportFilter.Politics]: [
        MarketType.WINNER,
        MarketType.US_ELECTION_POPULAR_VOTE_WINNER,
        MarketType.US_ELECTION_WINNING_PARTY,
    ],
    [SportFilter.Futures]: FUTURES_MARKET_TYPES,
    [SportFilter.PlayerProps]: PLAYER_PROPS_MARKET_TYPES,
};

export const MarketTypeGroupsBySport: Record<Sport, Partial<Record<MarketTypeGroup, MarketType[]>>> = {
    [Sport.SOCCER]: {
        [MarketTypeGroup.WINNER]: [...WINNER_MARKET_TYPES, ...DOUBLE_CHANCE_MARKET_TYPES, MarketType.HALFTIME_FULLTIME],
        [MarketTypeGroup.TOTALS]: [...TOTAL_MARKET_TYPES, ...TOTAL_ODD_EVEN_MARKET_TYPES],
        [MarketTypeGroup.HANDICAP]: SPREAD_MARKET_TYPES,
        [MarketTypeGroup.DOUBLE_CHANCE]: DOUBLE_CHANCE_MARKET_TYPES,
        [MarketTypeGroup.DRAW_NO_BET]: DRAW_NO_BET_MARKET_TYPES,
        [MarketTypeGroup.BOTH_TEAMS_TO_SCORE]: BOTH_TEAMS_TO_SCORE_MARKET_TYPES,
        [MarketTypeGroup.FIRST_HALF]: FIRST_PERIOD_MARKET_TYPES,
        [MarketTypeGroup.SECOND_HALF]: SECOND_PERIOD_MARKET_TYPES,
        [MarketTypeGroup.PLAYER_PROPS]: PLAYER_PROPS_MARKET_TYPES,
        [MarketTypeGroup.PLAYER_GOALS]: [MarketType.PLAYER_PROPS_OVER_GOALS],
        [MarketTypeGroup.CORNERS]: CORNERS_MARKET_TYPES,
        [MarketTypeGroup.CARDS]: CARDS_MARKET_TYPES,
    },
    [Sport.BASKETBALL]: {
        [MarketTypeGroup.WINNER]: WINNER_MARKET_TYPES,
        [MarketTypeGroup.TOTALS]: [...TOTAL_MARKET_TYPES, ...TOTAL_ODD_EVEN_MARKET_TYPES],
        [MarketTypeGroup.HANDICAP]: SPREAD_MARKET_TYPES,
        [MarketTypeGroup.SGP]: [MarketType.WINNER_TOTAL],
        [MarketTypeGroup.QUARTERS]: [
            ...FIRST_PERIOD_MARKET_TYPES,
            ...SECOND_PERIOD_MARKET_TYPES,
            ...THIRD_PERIOD_MARKET_TYPES,
            ...FOURTH_PERIOD_MARKET_TYPES,
        ],
        [MarketTypeGroup.FIRST_QUARTER]: FIRST_PERIOD_MARKET_TYPES,
        [MarketTypeGroup.SECOND_QUARTER]: SECOND_PERIOD_MARKET_TYPES,
        [MarketTypeGroup.THIRD_QUARTER]: THIRD_PERIOD_MARKET_TYPES,
        [MarketTypeGroup.FOURTH_QUARTER]: FOURTH_PERIOD_MARKET_TYPES,
        [MarketTypeGroup.FIRST_HALF]: [
            MarketType.FIRST_PERIOD_WINNER2,
            MarketType.FIRST_PERIOD_TOTAL2,
            MarketType.FIRST_PERIOD_SPREAD2,
            MarketType.FIRST_PERIOD_TOTAL2_ODD_EVEN,
            MarketType.FIRST_PERIOD_TOTAL2_HOME_TEAM,
            MarketType.FIRST_PERIOD_TOTAL2_AWAY_TEAM,
        ],
        [MarketTypeGroup.SECOND_HALF]: [
            MarketType.SECOND_PERIOD_WINNER2,
            MarketType.SECOND_PERIOD_TOTAL2,
            MarketType.SECOND_PERIOD_SPREAD2,
            MarketType.SECOND_PERIOD_TOTAL2_ODD_EVEN,
            MarketType.SECOND_PERIOD_TOTAL2_HOME_TEAM,
            MarketType.SECOND_PERIOD_TOTAL2_AWAY_TEAM,
        ],
        [MarketTypeGroup.PLAYER_PROPS]: PLAYER_PROPS_MARKET_TYPES,
        [MarketTypeGroup.PLAYER_POINTS]: [
            MarketType.PLAYER_PROPS_POINTS,
            MarketType.PLAYER_PROPS_POINTS_ASSISTS,
            MarketType.PLAYER_PROPS_POINTS_REBOUNDS,
            MarketType.PLAYER_PROPS_POINTS_REBOUNDS_ASSISTS,
        ],
        [MarketTypeGroup.PLAYER_REBOUNDS]: [
            MarketType.PLAYER_PROPS_REBOUNDS,
            MarketType.PLAYER_PROPS_POINTS_REBOUNDS,
            MarketType.PLAYER_PROPS_POINTS_REBOUNDS_ASSISTS,
            MarketType.PLAYER_PROPS_REBOUNDS_ASSISTS,
        ],
        [MarketTypeGroup.PLAYER_ASSISTS]: [
            MarketType.PLAYER_PROPS_ASSISTS,
            MarketType.PLAYER_PROPS_POINTS_ASSISTS,
            MarketType.PLAYER_PROPS_POINTS_REBOUNDS_ASSISTS,
            MarketType.PLAYER_PROPS_REBOUNDS_ASSISTS,
        ],
        [MarketTypeGroup.PLAYER_BLOCKS]: [MarketType.PLAYER_PROPS_BLOCKS, MarketType.PLAYER_PROPS_STEALS_BLOCKS],
        [MarketTypeGroup.PLAYER_STEALS]: [MarketType.PLAYER_PROPS_STEALS, MarketType.PLAYER_PROPS_STEALS_BLOCKS],
        [MarketTypeGroup.PLAYER_THRESS]: [MarketType.PLAYER_PROPS_3PTS_MADE],
        [MarketTypeGroup.PLAYER_DOUBLE_DOUBLE]: [MarketType.PLAYER_PROPS_DOUBLE_DOUBLE],
        [MarketTypeGroup.PLAYER_TRIPLE_DOUBLE]: [MarketType.PLAYER_PROPS_TRIPLE_DOUBLE],
    },
    [Sport.FIGHTING]: {
        [MarketTypeGroup.WINNER]: WINNER_MARKET_TYPES,
        [MarketTypeGroup.TOTALS]: [...TOTAL_MARKET_TYPES, ...TOTAL_ODD_EVEN_MARKET_TYPES],
        [MarketTypeGroup.HANDICAP]: SPREAD_MARKET_TYPES,
        [MarketTypeGroup.WINNING_METHOD]: [MarketType.METHOD_OF_VICTORY],
        [MarketTypeGroup.FIGHT_PROPS]: [
            MarketType.GO_THE_DISTANCE,
            MarketType.WILL_FIGHT_END_IN_FIRST_MINUTE,
            MarketType.WILL_POINT_BE_DEDUCTED,
            MarketType.PLAYER_PROPS_UFC_TAKEDOWNS_LANDED,
            MarketType.PLAYER_PROPS_UFC_SIGNIFICANT_STRIKES_LANDED,
        ],
        [MarketTypeGroup.ROUND_PROPS]: [MarketType.WINNING_ROUND],
    },
    [Sport.TENNIS]: {
        [MarketTypeGroup.WINNER]: WINNER_MARKET_TYPES,
        [MarketTypeGroup.TOTALS]: [...TOTAL_MARKET_TYPES, ...TOTAL_ODD_EVEN_MARKET_TYPES],
        [MarketTypeGroup.HANDICAP]: SPREAD_MARKET_TYPES,
        [MarketTypeGroup.SGP]: [MarketType.WINNER_TOTAL],
        [MarketTypeGroup.SETS]: [
            MarketType.TOTAL2,
            MarketType.SPREAD2,
            MarketType.FIRST_PERIOD_WINNER,
            MarketType.SECOND_PERIOD_WINNER,
            MarketType.THIRD_PERIOD_WINNER,
            MarketType.FIRST_PERIOD_TOTAL,
            MarketType.SECOND_PERIOD_TOTAL,
            MarketType.THIRD_PERIOD_TOTAL,
        ],
        [MarketTypeGroup.GAMES]: [
            MarketType.TOTAL,
            MarketType.SPREAD,
            MarketType.TOTAL_ODD_EVEN,
            MarketType.FIRST_PERIOD_TOTAL,
            MarketType.SECOND_PERIOD_TOTAL,
            MarketType.THIRD_PERIOD_TOTAL,
        ],
        [MarketTypeGroup.FIRST_SET]: [MarketType.FIRST_PERIOD_WINNER, MarketType.FIRST_PERIOD_TOTAL],
        [MarketTypeGroup.SECOND_SET]: [MarketType.SECOND_PERIOD_WINNER, MarketType.SECOND_PERIOD_TOTAL],
        [MarketTypeGroup.THIRD_SET]: [MarketType.THIRD_PERIOD_WINNER, MarketType.THIRD_PERIOD_TOTAL],
    },
    [Sport.TABLE_TENNIS]: {
        [MarketTypeGroup.WINNER]: WINNER_MARKET_TYPES,
        [MarketTypeGroup.TOTALS]: [...TOTAL_MARKET_TYPES, ...TOTAL_ODD_EVEN_MARKET_TYPES],
        [MarketTypeGroup.HANDICAP]: SPREAD_MARKET_TYPES,
        [MarketTypeGroup.SGP]: [MarketType.WINNER_TOTAL],
        [MarketTypeGroup.SETS]: [
            MarketType.TOTAL2,
            MarketType.SPREAD2,
            MarketType.FIRST_PERIOD_WINNER,
            MarketType.SECOND_PERIOD_WINNER,
            MarketType.THIRD_PERIOD_WINNER,
            MarketType.FIRST_PERIOD_TOTAL,
            MarketType.SECOND_PERIOD_TOTAL,
            MarketType.THIRD_PERIOD_TOTAL,
        ],
        [MarketTypeGroup.POINTS]: [
            MarketType.TOTAL,
            MarketType.SPREAD,
            MarketType.TOTAL_ODD_EVEN,
            MarketType.FIRST_PERIOD_TOTAL,
            MarketType.SECOND_PERIOD_TOTAL,
            MarketType.THIRD_PERIOD_TOTAL,
        ],
        [MarketTypeGroup.FIRST_SET]: [MarketType.FIRST_PERIOD_WINNER, MarketType.FIRST_PERIOD_TOTAL],
        [MarketTypeGroup.SECOND_SET]: [MarketType.SECOND_PERIOD_WINNER, MarketType.SECOND_PERIOD_TOTAL],
        [MarketTypeGroup.THIRD_SET]: [MarketType.THIRD_PERIOD_WINNER, MarketType.THIRD_PERIOD_TOTAL],
    },
    [Sport.FOOTBALL]: {
        [MarketTypeGroup.WINNER]: WINNER_MARKET_TYPES,
        [MarketTypeGroup.TOTALS]: [...TOTAL_MARKET_TYPES, ...TOTAL_ODD_EVEN_MARKET_TYPES],
        [MarketTypeGroup.HANDICAP]: SPREAD_MARKET_TYPES,
        [MarketTypeGroup.SGP]: [MarketType.WINNER_TOTAL],
        [MarketTypeGroup.QUARTERS]: [
            ...FIRST_PERIOD_MARKET_TYPES,
            ...SECOND_PERIOD_MARKET_TYPES,
            ...THIRD_PERIOD_MARKET_TYPES,
            ...FOURTH_PERIOD_MARKET_TYPES,
        ],
        [MarketTypeGroup.FIRST_QUARTER]: FIRST_PERIOD_MARKET_TYPES,
        [MarketTypeGroup.SECOND_QUARTER]: SECOND_PERIOD_MARKET_TYPES,
        [MarketTypeGroup.THIRD_QUARTER]: THIRD_PERIOD_MARKET_TYPES,
        [MarketTypeGroup.FOURTH_QUARTER]: FOURTH_PERIOD_MARKET_TYPES,
        [MarketTypeGroup.FIRST_HALF]: [
            MarketType.FIRST_PERIOD_WINNER2,
            MarketType.FIRST_PERIOD_TOTAL2,
            MarketType.FIRST_PERIOD_SPREAD2,
            MarketType.FIRST_PERIOD_TOTAL2_ODD_EVEN,
            MarketType.FIRST_PERIOD_TOTAL2_HOME_TEAM,
            MarketType.FIRST_PERIOD_TOTAL2_AWAY_TEAM,
        ],
        [MarketTypeGroup.SECOND_HALF]: [
            MarketType.SECOND_PERIOD_WINNER2,
            MarketType.SECOND_PERIOD_TOTAL2,
            MarketType.SECOND_PERIOD_SPREAD2,
            MarketType.SECOND_PERIOD_TOTAL2_ODD_EVEN,
            MarketType.SECOND_PERIOD_TOTAL2_HOME_TEAM,
            MarketType.SECOND_PERIOD_TOTAL2_AWAY_TEAM,
        ],
        [MarketTypeGroup.PLAYER_TOUCHDOWN_SCORERS]: [
            MarketType.PLAYER_PROPS_FIRST_TOUCHDOWN,
            MarketType.PLAYER_PROPS_TOUCHDOWN_SCORER,
            MarketType.PLAYER_PROPS_LAST_TOUCHDOWN,
            MarketType.PLAYER_PROPS_TOUCHDOWNS,
        ],
        [MarketTypeGroup.PLAYER_PASSING]: [
            MarketType.PLAYER_PROPS_PASSING_YARDS,
            MarketType.PLAYER_PROPS_PASSING_TOUCHDOWNS,
            MarketType.PLAYER_PROPS_INTERCEPTIONS,
            MarketType.PLAYER_PROPS_PASSING_ATTEMPTS,
            MarketType.PLAYER_PROPS_PASSING_COMPLETIONS,
            MarketType.PLAYER_PROPS_PASSING_RUSHING,
        ],
        [MarketTypeGroup.PLAYER_RUSHING]: [
            MarketType.PLAYER_PROPS_RUSHING_YARDS,
            MarketType.PLAYER_PROPS_PASSING_RUSHING,
            MarketType.PLAYER_PROPS_RUSHING_RECEIVING,
        ],
        [MarketTypeGroup.PLAYER_RECEIVING]: [
            MarketType.PLAYER_PROPS_RECEIVING_YARDS,
            MarketType.PLAYER_PROPS_RECEPTIONS,
            MarketType.PLAYER_PROPS_RUSHING_RECEIVING,
            MarketType.PLAYER_PROPS_LONGEST_RECEPTION,
        ],
        [MarketTypeGroup.PLAYER_DEFENSE_SPECIAL_TEAMS]: [
            MarketType.PLAYER_PROPS_SACKS,
            MarketType.PLAYER_PROPS_TACKLES,
        ],
        [MarketTypeGroup.PLAYER_KICKING]: [
            MarketType.PLAYER_PROPS_FIELD_GOALS_MADE,
            MarketType.PLAYER_PROPS_KICKING_POINTS,
            MarketType.PLAYER_PROPS_EXTRA_POINTS,
        ],
    },
    [Sport.BASEBALL]: {
        [MarketTypeGroup.WINNER]: WINNER_MARKET_TYPES,
        [MarketTypeGroup.TOTALS]: [...TOTAL_MARKET_TYPES, ...TOTAL_ODD_EVEN_MARKET_TYPES],
        [MarketTypeGroup.HANDICAP]: SPREAD_MARKET_TYPES,
        [MarketTypeGroup.SGP]: [MarketType.WINNER_TOTAL],
        [MarketTypeGroup.FIRST_INNING]: FIRST_PERIOD_MARKET_TYPES,
        [MarketTypeGroup.FIRST_FIVE_INNINGS]: FIRST_PERIOD_MARKET_TYPES2,
        [MarketTypeGroup.INNINGS]: [
            ...FIRST_PERIOD_MARKET_TYPES,
            ...SECOND_PERIOD_MARKET_TYPES,
            ...THIRD_PERIOD_MARKET_TYPES,
            ...FOURTH_PERIOD_MARKET_TYPES,
            ...FIFTH_PERIOD_MARKET_TYPES,
            ...SIXTH_PERIOD_MARKET_TYPES,
            ...SEVENTH_PERIOD_MARKET_TYPES,
            ...EIGHTH_PERIOD_MARKET_TYPES,
            ...NINTH_PERIOD_MARKET_TYPES,
        ],
        [MarketTypeGroup.PLAYER_PROPS]: PLAYER_PROPS_MARKET_TYPES,
        [MarketTypeGroup.PLAYER_BATTER]: [
            MarketType.PLAYER_PROPS_HOMERUNS,
            MarketType.PLAYER_PROPS_HITS_RECORDED,
            MarketType.PLAYER_PROPS_BASES,
            MarketType.PLAYER_PROPS_RBIS,
            MarketType.PLAYER_PROPS_HITS_RUNS_RBIS,
            MarketType.PLAYER_PROPS_RUNS,
            MarketType.PLAYER_PROPS_STOLEN_BASES,
            MarketType.PLAYER_PROPS_BATTING_STRIKEOUTS,
            MarketType.PLAYER_PROPS_SINGLES,
            MarketType.PLAYER_PROPS_DOUBLES,
            MarketType.PLAYER_PROPS_BATTING_WALKS,
        ],
        [MarketTypeGroup.PLAYER_PITCHER]: [
            MarketType.PLAYER_PROPS_STRIKEOUTS,
            MarketType.PLAYER_PROPS_OUTS,
            MarketType.PLAYER_PROPS_PITCHER_HITS_ALLOWED,
            MarketType.PLAYER_PROPS_EARNED_RUNS,
            MarketType.PLAYER_PROPS_WALKS,
        ],
    },
    [Sport.HOCKEY]: {
        [MarketTypeGroup.WINNER]: WINNER_MARKET_TYPES,
        [MarketTypeGroup.TOTALS]: [...TOTAL_MARKET_TYPES, ...TOTAL_ODD_EVEN_MARKET_TYPES],
        [MarketTypeGroup.HANDICAP]: SPREAD_MARKET_TYPES,
        [MarketTypeGroup.SGP]: [MarketType.WINNER_TOTAL],
        [MarketTypeGroup.PLAYER_PROPS]: PLAYER_PROPS_MARKET_TYPES,
        [MarketTypeGroup.PLAYER_POINTS]: [MarketType.PLAYER_PROPS_POINTS],
        [MarketTypeGroup.PLAYER_GOALS]: [MarketType.PLAYER_PROPS_GOALS],
        [MarketTypeGroup.PLAYER_SHOTS]: [MarketType.PLAYER_PROPS_SHOTS],
    },
    [Sport.ESPORTS]: {
        [MarketTypeGroup.WINNER]: WINNER_MARKET_TYPES,
        [MarketTypeGroup.TOTALS]: [...TOTAL_MARKET_TYPES, ...TOTAL_ODD_EVEN_MARKET_TYPES],
        [MarketTypeGroup.HANDICAP]: SPREAD_MARKET_TYPES,
    },
    [Sport.RUGBY]: {
        [MarketTypeGroup.WINNER]: WINNER_MARKET_TYPES,
        [MarketTypeGroup.TOTALS]: [...TOTAL_MARKET_TYPES, ...TOTAL_ODD_EVEN_MARKET_TYPES],
        [MarketTypeGroup.HANDICAP]: SPREAD_MARKET_TYPES,
        [MarketTypeGroup.FIRST_HALF]: FIRST_PERIOD_MARKET_TYPES,
    },
    [Sport.VOLLEYBALL]: {
        [MarketTypeGroup.WINNER]: WINNER_MARKET_TYPES,
        [MarketTypeGroup.TOTALS]: [...TOTAL_MARKET_TYPES, ...TOTAL_ODD_EVEN_MARKET_TYPES],
        [MarketTypeGroup.HANDICAP]: SPREAD_MARKET_TYPES,
        [MarketTypeGroup.SETS]: [
            MarketType.TOTAL2,
            MarketType.SPREAD2,
            MarketType.FIRST_PERIOD_WINNER,
            MarketType.SECOND_PERIOD_WINNER,
            MarketType.THIRD_PERIOD_WINNER,
            MarketType.FIRST_PERIOD_TOTAL,
            MarketType.SECOND_PERIOD_TOTAL,
            MarketType.THIRD_PERIOD_TOTAL,
        ],
        [MarketTypeGroup.POINTS]: [
            MarketType.TOTAL,
            MarketType.SPREAD,
            MarketType.TOTAL_ODD_EVEN,
            MarketType.FIRST_PERIOD_TOTAL,
            MarketType.SECOND_PERIOD_TOTAL,
            MarketType.THIRD_PERIOD_TOTAL,
        ],
        [MarketTypeGroup.FIRST_SET]: [MarketType.FIRST_PERIOD_WINNER, MarketType.FIRST_PERIOD_TOTAL],
        [MarketTypeGroup.SECOND_SET]: [MarketType.SECOND_PERIOD_WINNER, MarketType.SECOND_PERIOD_TOTAL],
        [MarketTypeGroup.THIRD_SET]: [MarketType.THIRD_PERIOD_WINNER, MarketType.THIRD_PERIOD_TOTAL],
    },
    [Sport.HANDBALL]: {
        [MarketTypeGroup.WINNER]: WINNER_MARKET_TYPES,
        [MarketTypeGroup.TOTALS]: [...TOTAL_MARKET_TYPES, ...TOTAL_ODD_EVEN_MARKET_TYPES],
        [MarketTypeGroup.HANDICAP]: SPREAD_MARKET_TYPES,
        [MarketTypeGroup.DOUBLE_CHANCE]: DOUBLE_CHANCE_MARKET_TYPES,
        [MarketTypeGroup.DRAW_NO_BET]: DRAW_NO_BET_MARKET_TYPES,
        [MarketTypeGroup.FIRST_HALF]: FIRST_PERIOD_MARKET_TYPES,
        [MarketTypeGroup.SECOND_HALF]: SECOND_PERIOD_MARKET_TYPES,
    },
    [Sport.WATERPOLO]: {
        [MarketTypeGroup.WINNER]: WINNER_MARKET_TYPES,
    },
    [Sport.CRICKET]: {
        [MarketTypeGroup.WINNER]: WINNER_MARKET_TYPES,
        [MarketTypeGroup.TOTALS]: [...TOTAL_MARKET_TYPES, ...TOTAL_ODD_EVEN_MARKET_TYPES],
    },
    [Sport.GOLF]: {
        [MarketTypeGroup.WINNER]: WINNER_MARKET_TYPES,
        [MarketTypeGroup.TOTALS]: [...TOTAL_MARKET_TYPES, ...TOTAL_ODD_EVEN_MARKET_TYPES],
    },
    [Sport.MOTOSPORT]: {
        [MarketTypeGroup.WINNER]: WINNER_MARKET_TYPES,
        [MarketTypeGroup.TOTALS]: [...TOTAL_MARKET_TYPES, ...TOTAL_ODD_EVEN_MARKET_TYPES],
    },
    [Sport.POLITICS]: {
        [MarketTypeGroup.WINNER]: WINNER_MARKET_TYPES,
        [MarketTypeGroup.POPULAR_VOTE_WINNER]: [MarketType.US_ELECTION_POPULAR_VOTE_WINNER],
        [MarketTypeGroup.WINNING_PARTY]: [MarketType.US_ELECTION_WINNING_PARTY],
        [MarketTypeGroup.WINNING_PARTY_STATE]: [
            MarketType.US_ELECTION_WINNING_PARTY_ARIZONA,
            MarketType.US_ELECTION_WINNING_PARTY_GEORGIA,
            MarketType.US_ELECTION_WINNING_PARTY_MICHIGAN,
            MarketType.US_ELECTION_WINNING_PARTY_NEVADA,
            MarketType.US_ELECTION_WINNING_PARTY_PENNSYLVANIA,
            MarketType.US_ELECTION_WINNING_PARTY_WINSCONSIN,
            MarketType.US_ELECTION_WINNING_PARTY_NORTH_CAROLINA,
        ],
    },
    [Sport.FUTURES]: {
        [MarketTypeGroup.WINNER]: [MarketType.WINNER, ...FUTURES_MARKET_TYPES],
    },
    [Sport.EMPTY]: {
        [MarketTypeGroup.WINNER]: WINNER_MARKET_TYPES,
    },
};

export const MarketTypePlayerPropsGroupsBySport: Record<Sport, Partial<Record<MarketTypeGroup, MarketType[]>>> = {
    [Sport.SOCCER]: {
        [MarketTypeGroup.TOTALS]: [...TOTAL_MARKET_TYPES, ...TOTAL_ODD_EVEN_MARKET_TYPES],
        [MarketTypeGroup.HANDICAP]: SPREAD_MARKET_TYPES,
        [MarketTypeGroup.DOUBLE_CHANCE]: DOUBLE_CHANCE_MARKET_TYPES,
        [MarketTypeGroup.DRAW_NO_BET]: DRAW_NO_BET_MARKET_TYPES,
        [MarketTypeGroup.BOTH_TEAMS_TO_SCORE]: BOTH_TEAMS_TO_SCORE_MARKET_TYPES,
        [MarketTypeGroup.FIRST_HALF]: FIRST_PERIOD_MARKET_TYPES,
        [MarketTypeGroup.SECOND_HALF]: SECOND_PERIOD_MARKET_TYPES,
    },
    [Sport.BASKETBALL]: {
        [MarketTypeGroup.TOTALS]: [...TOTAL_MARKET_TYPES, ...TOTAL_ODD_EVEN_MARKET_TYPES],
        [MarketTypeGroup.HANDICAP]: SPREAD_MARKET_TYPES,
        [MarketTypeGroup.QUARTERS]: [
            ...FIRST_PERIOD_MARKET_TYPES,
            ...SECOND_PERIOD_MARKET_TYPES,
            ...THIRD_PERIOD_MARKET_TYPES,
            ...FOURTH_PERIOD_MARKET_TYPES,
        ],
        [MarketTypeGroup.FIRST_QUARTER]: FIRST_PERIOD_MARKET_TYPES,
        [MarketTypeGroup.SECOND_QUARTER]: SECOND_PERIOD_MARKET_TYPES,
        [MarketTypeGroup.THIRD_QUARTER]: THIRD_PERIOD_MARKET_TYPES,
        [MarketTypeGroup.FOURTH_QUARTER]: FOURTH_PERIOD_MARKET_TYPES,
        [MarketTypeGroup.FIRST_HALF]: [
            MarketType.FIRST_PERIOD_WINNER2,
            MarketType.FIRST_PERIOD_TOTAL2,
            MarketType.FIRST_PERIOD_SPREAD2,
            MarketType.FIRST_PERIOD_TOTAL2_ODD_EVEN,
            MarketType.FIRST_PERIOD_TOTAL2_HOME_TEAM,
            MarketType.FIRST_PERIOD_TOTAL2_AWAY_TEAM,
        ],
        [MarketTypeGroup.SECOND_HALF]: [
            MarketType.SECOND_PERIOD_WINNER2,
            MarketType.SECOND_PERIOD_TOTAL2,
            MarketType.SECOND_PERIOD_SPREAD2,
            MarketType.SECOND_PERIOD_TOTAL2_ODD_EVEN,
            MarketType.SECOND_PERIOD_TOTAL2_HOME_TEAM,
            MarketType.SECOND_PERIOD_TOTAL2_AWAY_TEAM,
        ],
        [MarketTypeGroup.PLAYER_POINTS]: [
            MarketType.PLAYER_PROPS_POINTS,
            MarketType.PLAYER_PROPS_POINTS_REBOUNDS_ASSISTS,
            MarketType.PLAYER_PROPS_POINTS_ASSISTS,
            MarketType.PLAYER_PROPS_POINTS_REBOUNDS,
        ],
        [MarketTypeGroup.PLAYER_REBOUNDS]: [
            MarketType.PLAYER_PROPS_REBOUNDS,
            MarketType.PLAYER_PROPS_POINTS_REBOUNDS_ASSISTS,
            MarketType.PLAYER_PROPS_POINTS_REBOUNDS,
            MarketType.PLAYER_PROPS_REBOUNDS_ASSISTS,
        ],
        [MarketTypeGroup.PLAYER_ASSISTS]: [
            MarketType.PLAYER_PROPS_ASSISTS,
            MarketType.PLAYER_PROPS_POINTS_REBOUNDS_ASSISTS,
            MarketType.PLAYER_PROPS_POINTS_ASSISTS,
            MarketType.PLAYER_PROPS_REBOUNDS_ASSISTS,
        ],
        [MarketTypeGroup.PLAYER_BLOCKS]: [MarketType.PLAYER_PROPS_BLOCKS, MarketType.PLAYER_PROPS_STEALS_BLOCKS],
        [MarketTypeGroup.PLAYER_STEALS]: [MarketType.PLAYER_PROPS_STEALS, MarketType.PLAYER_PROPS_STEALS_BLOCKS],
    },
    [Sport.FIGHTING]: {
        [MarketTypeGroup.TOTALS]: [...TOTAL_MARKET_TYPES, ...TOTAL_ODD_EVEN_MARKET_TYPES],
        [MarketTypeGroup.HANDICAP]: SPREAD_MARKET_TYPES,
        [MarketTypeGroup.FIGHT_PROPS]: [
            MarketType.GO_THE_DISTANCE,
            MarketType.WILL_FIGHT_END_IN_FIRST_MINUTE,
            MarketType.WILL_POINT_BE_DEDUCTED,
            MarketType.PLAYER_PROPS_UFC_TAKEDOWNS_LANDED,
            MarketType.PLAYER_PROPS_UFC_SIGNIFICANT_STRIKES_LANDED,
        ],
    },
    [Sport.TENNIS]: {
        [MarketTypeGroup.TOTALS]: [...TOTAL_MARKET_TYPES, ...TOTAL_ODD_EVEN_MARKET_TYPES],
        [MarketTypeGroup.HANDICAP]: SPREAD_MARKET_TYPES,
        [MarketTypeGroup.SETS]: [
            MarketType.TOTAL2,
            MarketType.SPREAD2,
            MarketType.FIRST_PERIOD_WINNER,
            MarketType.SECOND_PERIOD_WINNER,
            MarketType.THIRD_PERIOD_WINNER,
            MarketType.FIRST_PERIOD_TOTAL,
            MarketType.SECOND_PERIOD_TOTAL,
            MarketType.THIRD_PERIOD_TOTAL,
        ],
        [MarketTypeGroup.GAMES]: [
            MarketType.TOTAL,
            MarketType.SPREAD,
            MarketType.TOTAL_ODD_EVEN,
            MarketType.FIRST_PERIOD_TOTAL,
            MarketType.SECOND_PERIOD_TOTAL,
            MarketType.THIRD_PERIOD_TOTAL,
        ],
        [MarketTypeGroup.FIRST_SET]: [MarketType.FIRST_PERIOD_WINNER, MarketType.FIRST_PERIOD_TOTAL],
        [MarketTypeGroup.SECOND_SET]: [MarketType.SECOND_PERIOD_WINNER, MarketType.SECOND_PERIOD_TOTAL],
        [MarketTypeGroup.THIRD_SET]: [MarketType.THIRD_PERIOD_WINNER, MarketType.THIRD_PERIOD_TOTAL],
    },
    [Sport.TABLE_TENNIS]: {
        [MarketTypeGroup.TOTALS]: [...TOTAL_MARKET_TYPES, ...TOTAL_ODD_EVEN_MARKET_TYPES],
        [MarketTypeGroup.HANDICAP]: SPREAD_MARKET_TYPES,
        [MarketTypeGroup.SETS]: [
            MarketType.TOTAL2,
            MarketType.SPREAD2,
            MarketType.FIRST_PERIOD_WINNER,
            MarketType.SECOND_PERIOD_WINNER,
            MarketType.THIRD_PERIOD_WINNER,
            MarketType.FIRST_PERIOD_TOTAL,
            MarketType.SECOND_PERIOD_TOTAL,
            MarketType.THIRD_PERIOD_TOTAL,
        ],
        [MarketTypeGroup.POINTS]: [
            MarketType.TOTAL,
            MarketType.SPREAD,
            MarketType.TOTAL_ODD_EVEN,
            MarketType.FIRST_PERIOD_TOTAL,
            MarketType.SECOND_PERIOD_TOTAL,
            MarketType.THIRD_PERIOD_TOTAL,
        ],
        [MarketTypeGroup.FIRST_SET]: [MarketType.FIRST_PERIOD_WINNER, MarketType.FIRST_PERIOD_TOTAL],
        [MarketTypeGroup.SECOND_SET]: [MarketType.SECOND_PERIOD_WINNER, MarketType.SECOND_PERIOD_TOTAL],
        [MarketTypeGroup.THIRD_SET]: [MarketType.THIRD_PERIOD_WINNER, MarketType.THIRD_PERIOD_TOTAL],
    },
    [Sport.FOOTBALL]: {
        [MarketTypeGroup.TOTALS]: [...TOTAL_MARKET_TYPES, ...TOTAL_ODD_EVEN_MARKET_TYPES],
        [MarketTypeGroup.HANDICAP]: SPREAD_MARKET_TYPES,
        [MarketTypeGroup.QUARTERS]: [
            ...FIRST_PERIOD_MARKET_TYPES,
            ...SECOND_PERIOD_MARKET_TYPES,
            ...THIRD_PERIOD_MARKET_TYPES,
            ...FOURTH_PERIOD_MARKET_TYPES,
        ],
        [MarketTypeGroup.FIRST_QUARTER]: FIRST_PERIOD_MARKET_TYPES,
        [MarketTypeGroup.SECOND_QUARTER]: SECOND_PERIOD_MARKET_TYPES,
        [MarketTypeGroup.THIRD_QUARTER]: THIRD_PERIOD_MARKET_TYPES,
        [MarketTypeGroup.FOURTH_QUARTER]: FOURTH_PERIOD_MARKET_TYPES,
        [MarketTypeGroup.FIRST_HALF]: [
            MarketType.FIRST_PERIOD_WINNER2,
            MarketType.FIRST_PERIOD_TOTAL2,
            MarketType.FIRST_PERIOD_SPREAD2,
            MarketType.FIRST_PERIOD_TOTAL2_ODD_EVEN,
            MarketType.FIRST_PERIOD_TOTAL2_HOME_TEAM,
            MarketType.FIRST_PERIOD_TOTAL2_AWAY_TEAM,
        ],
        [MarketTypeGroup.SECOND_HALF]: [
            MarketType.SECOND_PERIOD_WINNER2,
            MarketType.SECOND_PERIOD_TOTAL2,
            MarketType.SECOND_PERIOD_SPREAD2,
            MarketType.SECOND_PERIOD_TOTAL2_ODD_EVEN,
            MarketType.SECOND_PERIOD_TOTAL2_HOME_TEAM,
            MarketType.SECOND_PERIOD_TOTAL2_AWAY_TEAM,
        ],
        [MarketTypeGroup.PLAYER_TOUCHDOWN_SCORERS]: [
            MarketType.PLAYER_PROPS_FIRST_TOUCHDOWN,
            MarketType.PLAYER_PROPS_TOUCHDOWN_SCORER,
            MarketType.PLAYER_PROPS_LAST_TOUCHDOWN,
            MarketType.PLAYER_PROPS_TOUCHDOWNS,
        ],
        [MarketTypeGroup.PLAYER_PASSING]: [
            MarketType.PLAYER_PROPS_PASSING_YARDS,
            MarketType.PLAYER_PROPS_PASSING_TOUCHDOWNS,
            MarketType.PLAYER_PROPS_INTERCEPTIONS,
            MarketType.PLAYER_PROPS_PASSING_ATTEMPTS,
            MarketType.PLAYER_PROPS_PASSING_COMPLETIONS,
            MarketType.PLAYER_PROPS_PASSING_RUSHING,
        ],
        [MarketTypeGroup.PLAYER_RUSHING]: [
            MarketType.PLAYER_PROPS_RUSHING_YARDS,
            MarketType.PLAYER_PROPS_PASSING_RUSHING,
            MarketType.PLAYER_PROPS_RUSHING_RECEIVING,
        ],
        [MarketTypeGroup.PLAYER_RECEIVING]: [
            MarketType.PLAYER_PROPS_RECEIVING_YARDS,
            MarketType.PLAYER_PROPS_RECEPTIONS,
            MarketType.PLAYER_PROPS_RUSHING_RECEIVING,
            MarketType.PLAYER_PROPS_LONGEST_RECEPTION,
        ],
        [MarketTypeGroup.PLAYER_DEFENSE_SPECIAL_TEAMS]: [
            MarketType.PLAYER_PROPS_SACKS,
            MarketType.PLAYER_PROPS_TACKLES,
        ],
        [MarketTypeGroup.PLAYER_KICKING]: [
            MarketType.PLAYER_PROPS_FIELD_GOALS_MADE,
            MarketType.PLAYER_PROPS_KICKING_POINTS,
            MarketType.PLAYER_PROPS_EXTRA_POINTS,
        ],
    },
    [Sport.BASEBALL]: {
        [MarketTypeGroup.TOTALS]: [...TOTAL_MARKET_TYPES, ...TOTAL_ODD_EVEN_MARKET_TYPES],
        [MarketTypeGroup.HANDICAP]: SPREAD_MARKET_TYPES,
        [MarketTypeGroup.FIRST_INNING]: FIRST_PERIOD_MARKET_TYPES,
        [MarketTypeGroup.FIRST_FIVE_INNINGS]: FIRST_PERIOD_MARKET_TYPES2,
        [MarketTypeGroup.INNINGS]: [
            ...FIRST_PERIOD_MARKET_TYPES,
            ...SECOND_PERIOD_MARKET_TYPES,
            ...THIRD_PERIOD_MARKET_TYPES,
            ...FOURTH_PERIOD_MARKET_TYPES,
            ...FIFTH_PERIOD_MARKET_TYPES,
            ...SIXTH_PERIOD_MARKET_TYPES,
            ...SEVENTH_PERIOD_MARKET_TYPES,
            ...EIGHTH_PERIOD_MARKET_TYPES,
            ...NINTH_PERIOD_MARKET_TYPES,
        ],
        [MarketTypeGroup.PLAYER_BATTER]: [
            MarketType.PLAYER_PROPS_HOMERUNS,
            MarketType.PLAYER_PROPS_HITS_RECORDED,
            MarketType.PLAYER_PROPS_BASES,
            MarketType.PLAYER_PROPS_RBIS,
            MarketType.PLAYER_PROPS_HITS_RUNS_RBIS,
            MarketType.PLAYER_PROPS_RUNS,
            MarketType.PLAYER_PROPS_STOLEN_BASES,
            MarketType.PLAYER_PROPS_BATTING_STRIKEOUTS,
            MarketType.PLAYER_PROPS_SINGLES,
            MarketType.PLAYER_PROPS_DOUBLES,
            MarketType.PLAYER_PROPS_BATTING_WALKS,
        ],
        [MarketTypeGroup.PLAYER_PITCHER]: [
            MarketType.PLAYER_PROPS_STRIKEOUTS,
            MarketType.PLAYER_PROPS_OUTS,
            MarketType.PLAYER_PROPS_PITCHER_HITS_ALLOWED,
            MarketType.PLAYER_PROPS_EARNED_RUNS,
            MarketType.PLAYER_PROPS_WALKS,
        ],
    },
    [Sport.HOCKEY]: {
        [MarketTypeGroup.TOTALS]: [...TOTAL_MARKET_TYPES, ...TOTAL_ODD_EVEN_MARKET_TYPES],
        [MarketTypeGroup.HANDICAP]: SPREAD_MARKET_TYPES,
    },
    [Sport.ESPORTS]: {
        [MarketTypeGroup.TOTALS]: [...TOTAL_MARKET_TYPES, ...TOTAL_ODD_EVEN_MARKET_TYPES],
        [MarketTypeGroup.HANDICAP]: SPREAD_MARKET_TYPES,
    },
    [Sport.RUGBY]: {
        [MarketTypeGroup.TOTALS]: [...TOTAL_MARKET_TYPES, ...TOTAL_ODD_EVEN_MARKET_TYPES],
        [MarketTypeGroup.HANDICAP]: SPREAD_MARKET_TYPES,
        [MarketTypeGroup.FIRST_HALF]: FIRST_PERIOD_MARKET_TYPES,
    },
    [Sport.VOLLEYBALL]: {
        [MarketTypeGroup.TOTALS]: [...TOTAL_MARKET_TYPES, ...TOTAL_ODD_EVEN_MARKET_TYPES],
        [MarketTypeGroup.HANDICAP]: SPREAD_MARKET_TYPES,
        [MarketTypeGroup.SETS]: [
            MarketType.TOTAL2,
            MarketType.SPREAD2,
            MarketType.FIRST_PERIOD_WINNER,
            MarketType.SECOND_PERIOD_WINNER,
            MarketType.THIRD_PERIOD_WINNER,
            MarketType.FIRST_PERIOD_TOTAL,
            MarketType.SECOND_PERIOD_TOTAL,
            MarketType.THIRD_PERIOD_TOTAL,
        ],
        [MarketTypeGroup.POINTS]: [
            MarketType.TOTAL,
            MarketType.SPREAD,
            MarketType.TOTAL_ODD_EVEN,
            MarketType.FIRST_PERIOD_TOTAL,
            MarketType.SECOND_PERIOD_TOTAL,
            MarketType.THIRD_PERIOD_TOTAL,
        ],
        [MarketTypeGroup.FIRST_SET]: [MarketType.FIRST_PERIOD_WINNER, MarketType.FIRST_PERIOD_TOTAL],
        [MarketTypeGroup.SECOND_SET]: [MarketType.SECOND_PERIOD_WINNER, MarketType.SECOND_PERIOD_TOTAL],
        [MarketTypeGroup.THIRD_SET]: [MarketType.THIRD_PERIOD_WINNER, MarketType.THIRD_PERIOD_TOTAL],
    },
    [Sport.HANDBALL]: {
        [MarketTypeGroup.TOTALS]: [...TOTAL_MARKET_TYPES, ...TOTAL_ODD_EVEN_MARKET_TYPES],
        [MarketTypeGroup.HANDICAP]: SPREAD_MARKET_TYPES,
        [MarketTypeGroup.DOUBLE_CHANCE]: DOUBLE_CHANCE_MARKET_TYPES,
        [MarketTypeGroup.DRAW_NO_BET]: DRAW_NO_BET_MARKET_TYPES,
        [MarketTypeGroup.FIRST_HALF]: FIRST_PERIOD_MARKET_TYPES,
        [MarketTypeGroup.SECOND_HALF]: SECOND_PERIOD_MARKET_TYPES,
    },
    [Sport.WATERPOLO]: {},
    [Sport.CRICKET]: {
        [MarketTypeGroup.TOTALS]: [...TOTAL_MARKET_TYPES, ...TOTAL_ODD_EVEN_MARKET_TYPES],
    },
    [Sport.GOLF]: {
        [MarketTypeGroup.TOTALS]: [...TOTAL_MARKET_TYPES, ...TOTAL_ODD_EVEN_MARKET_TYPES],
    },
    [Sport.MOTOSPORT]: {
        [MarketTypeGroup.TOTALS]: [...TOTAL_MARKET_TYPES, ...TOTAL_ODD_EVEN_MARKET_TYPES],
    },
    [Sport.POLITICS]: {
        [MarketTypeGroup.WINNING_PARTY_STATE]: [
            MarketType.US_ELECTION_WINNING_PARTY_ARIZONA,
            MarketType.US_ELECTION_WINNING_PARTY_GEORGIA,
            MarketType.US_ELECTION_WINNING_PARTY_MICHIGAN,
            MarketType.US_ELECTION_WINNING_PARTY_NEVADA,
            MarketType.US_ELECTION_WINNING_PARTY_PENNSYLVANIA,
            MarketType.US_ELECTION_WINNING_PARTY_WINSCONSIN,
            MarketType.US_ELECTION_WINNING_PARTY_NORTH_CAROLINA,
        ],
    },
    [Sport.FUTURES]: {},
    [Sport.EMPTY]: {},
};
