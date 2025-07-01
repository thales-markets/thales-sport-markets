import { Proposal, MappedVotes, SpaceStrategy } from 'types/governance';

export default class SingleChoiceVoting {
    public proposal: Proposal;
    public votes: MappedVotes[];
    public strategies: SpaceStrategy[];
    public selected;

    constructor(proposal: Proposal, votes: MappedVotes[], strategies: SpaceStrategy[], selected: any) {
        this.proposal = proposal;
        this.votes = votes;
        this.strategies = strategies;
        this.selected = selected;
    }

    //  Returns an array with the results for each choice
    resultsByVoteBalance() {
        return this.proposal.choices.map((_, i) =>
            this.votes.filter((vote: any) => vote.choice === i + 1).reduce((a, b: any) => a + b.balance, 0)
        );
    }

    //  Returns an array with the results for each choice
    //  and for each strategy
    resultsByStrategyScore() {
        return this.proposal.choices.map((_, i) =>
            this.strategies.map((_, sI) =>
                this.votes.filter((vote: any) => vote.choice === i + 1).reduce((a, b: any) => a + b.scores[sI], 0)
            )
        );
    }

    // Returns the total amount of the results
    sumOfResultsBalance() {
        return this.votes.reduce((a, b: any) => a + b.balance, 0);
    }

    //  Returns a string of all choices
    getChoiceString() {
        return this.proposal.choices[this.selected - 1];
    }
}
