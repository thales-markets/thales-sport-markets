import { SpaceKey } from 'enums/governance';

export type SpaceData = {
    id: SpaceKey;
    domain: string;
    filters: {
        onlyMembers: boolean;
        minScore: number;
    };
    members: string[];
    name: string;
    network: string;
    skin: string;
    strategies: SpaceStrategy[];
    symbol: string;
};

export type SpaceStrategy = {
    name: string;
    params: {
        address?: string;
        decimals: number;
        symbol: string;
        blockOptimism?: number;
        blockArbitrum?: number;
    };
};

export type Proposal = {
    id: string;
    author: string;
    created: number;
    space: SpaceData;
    network: string;
    strategies: SpaceStrategy[];
    plugins: any;
    title: string;
    body: string;
    choices: string[];
    start: number;
    end: number;
    snapshot: string;
    state: string;
    type: string;
    scores: number[];
};

export type Vote = {
    id: string;
    voter: string;
    created: number;
    space: SpaceData;
    proposal: string;
    choice: any;
    metadata: any;
    vp_by_strategy: any;
};

export interface MappedVotes extends Vote {
    scores: number[];
    balance: number;
}

export type ProposalResults = {
    choices: any;
    spaceSymbol: any;
    votes: any;
    results: any;
    start: number;
};

export type Staker = {
    id: string;
    timestamp: number;
    stakedAmount: number;
    escrowedAmount: number;
    totalStakedAmount: number;
    unstakingAmount: number;
    ensName: string | null;
};

export type Stakers = Staker[];

export type EnsNames = Record<string, string | null>;
