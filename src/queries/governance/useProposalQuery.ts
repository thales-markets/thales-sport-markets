import snapshot from '@snapshot-labs/snapshot.js';
import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import {
    BLOCK_ARBITRUM,
    BLOCK_OPTIMISM,
    SNAPSHOT_GRAPHQL_URL,
    SNAPSHOT_SCORE_URL,
    VOTING_COUNCIL_PROPOSAL_ID,
} from 'constants/governance';
import QUERY_KEYS from 'constants/queryKeys';
import { SpaceKey, StatusEnum } from 'enums/governance';
import request, { gql } from 'graphql-request';
import { uniqBy } from 'lodash';
import { MappedVotes, Proposal, ProposalResults, SpaceData, SpaceStrategy, Vote } from 'types/governance';
import voting from 'utils/voting';
import { getAddress } from 'viem';

const useProposalQuery = (
    spaceKey: SpaceKey,
    hash: string,
    walletAddress: string,
    options?: UseQueryOptions<ProposalResults>
) => {
    return useQuery<ProposalResults>({
        queryKey: QUERY_KEYS.Governance.Proposal(spaceKey, hash, walletAddress),
        queryFn: async () => {
            const { proposal }: { proposal: Proposal } = await request(
                SNAPSHOT_GRAPHQL_URL,
                gql`
                    query Proposal($id: String!) {
                        proposal(id: $id) {
                            id
                            title
                            body
                            choices
                            start
                            end
                            snapshot
                            state
                            author
                            type
                            scores
                            strategies {
                                name
                                network
                                params
                            }
                            space {
                                id
                                name
                                network
                            }
                            network
                        }
                    }
                `,
                { id: hash }
            );

            const { space }: { space: SpaceData } = await request(
                SNAPSHOT_GRAPHQL_URL,
                gql`
                    query Space($spaceKey: String!) {
                        space(id: $spaceKey) {
                            domain
                            about
                            members
                            name
                            network
                            skin
                            symbol
                            strategies {
                                name
                                params
                            }
                            filters {
                                minScore
                                onlyMembers
                            }
                        }
                    }
                `,
                { spaceKey: spaceKey }
            );

            const { votes }: { votes: Vote[] } = await request(
                SNAPSHOT_GRAPHQL_URL,
                gql`
                    query Votes($proposal: String!) {
                        votes(first: 1000, where: { proposal: $proposal }) {
                            id
                            voter
                            choice
                            vp_by_strategy
                        }
                    }
                `,
                { proposal: proposal.id }
            );

            const voterAddresses = votes.map((e: Vote) => getAddress(e.voter));

            const block = parseInt(proposal.snapshot);

            // TODO - the logic for scores needs refactoring because `getScores` has some bugs
            const finalScores = [] as any;
            proposal.strategies.forEach((_: SpaceStrategy, key: number) => {
                finalScores.push({});
                votes.forEach((vote: Vote) => {
                    finalScores[key][vote.voter] = vote.vp_by_strategy[key];
                });
            });

            if (proposal.id === VOTING_COUNCIL_PROPOSAL_ID && proposal.state !== StatusEnum.Closed) {
                proposal.strategies[0].params = {
                    ...proposal.strategies[0].params,
                    blockOptimism: BLOCK_OPTIMISM,
                    blockArbitrum: BLOCK_ARBITRUM,
                };
            }

            const scores =
                proposal.state === StatusEnum.Closed
                    ? finalScores
                    : await snapshot.utils.getScores(
                          spaceKey,
                          proposal.strategies,
                          proposal.network,
                          voterAddresses,
                          block,
                          SNAPSHOT_SCORE_URL
                      );

            let mappedVotes = votes as MappedVotes[];

            mappedVotes = uniqBy(
                mappedVotes
                    .map((vote) => {
                        vote.scores = proposal.strategies.map(
                            (_: SpaceStrategy, key: number) => scores[key][getAddress(vote.voter)] || 0
                        );
                        vote.balance = vote.scores.reduce((a: number, b: number) => a + b, 0);
                        return vote;
                    })
                    .filter((vote) => vote.balance > 0)
                    .sort((a, b) => b.balance - a.balance),
                (a) => getAddress(a.voter)
            );

            /* Get results */
            //@ts-ignore
            const votingClass = new voting[proposal.type](proposal, mappedVotes, proposal.strategies);
            const results = {
                resultsByVoteBalance: votingClass.resultsByVoteBalance(),
                resultsByStrategyScore: votingClass.resultsByStrategyScore(),
                sumOfResultsBalance: votingClass.sumOfResultsBalance(),
            };

            const returnVoteHistory = () => {
                if (walletAddress && voterAddresses.includes(getAddress(walletAddress))) {
                    const index = mappedVotes.findIndex((a) => getAddress(a.voter) === getAddress(walletAddress));
                    const currentUserVote = mappedVotes[index];
                    mappedVotes.splice(index, 1);
                    mappedVotes.unshift(currentUserVote);
                }
                return mappedVotes;
            };

            const voteList = returnVoteHistory();

            const proposalResults = {
                choices: proposal.choices,
                spaceSymbol: space.symbol,
                results,
                votes: voteList,
                start: proposal.start,
            };

            return proposalResults;
        },
        ...options,
    });
};

export default useProposalQuery;
