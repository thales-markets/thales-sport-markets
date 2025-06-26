import { MappedVotes, Proposal, SpaceStrategy } from 'types/governance';

export function percentageOfTotal(i: number, values: any, total: any) {
    const reducedTotal: any = total.reduce((a: any, b: any) => a + b, 0);
    const percent = (values[i] / reducedTotal) * 100;
    return isNaN(percent) ? 0 : percent;
}

function weightedPower(i: number, choice: any, balance: number) {
    return (percentageOfTotal(i + 1, choice, Object.values(choice)) / 100) * balance;
}

export default class WeightedVoting {
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

    resultsByVoteBalance() {
        const results = this.proposal.choices.map((_, i) =>
            this.votes.map((vote) => weightedPower(i, vote.choice, vote.balance)).reduce((a, b: any) => a + b, 0)
        );

        return results
            .map((_, i) => percentageOfTotal(i, results, results))
            .map((p) => (this.sumOfResultsBalance() / 100) * p);
    }

    resultsByStrategyScore() {
        const results = this.proposal.choices
            .map((_, i) =>
                this.strategies.map((_, sI) =>
                    this.votes
                        .map((vote) => weightedPower(i, vote.choice, vote.scores[sI]))
                        .reduce((a, b: any) => a + b, 0)
                )
            )
            .map((arr) => arr.map((pwr) => [pwr]));

        return results.map((_, i) =>
            this.strategies
                .map((_, sI) => [percentageOfTotal(0, results[i][sI], results.flat(2))])
                .map((p: any) => [(this.sumOfResultsBalance() / 100) * p])
        );
    }

    sumOfResultsBalance() {
        return this.votes.reduce((a, b: any) => a + b.balance, 0);
    }

    getChoiceString() {
        return this.proposal.choices
            .map((choice, i) => {
                if (this.selected[i + 1]) {
                    return `${
                        Math.round(percentageOfTotal(i + 1, this.selected, Object.values(this.selected)) * 10) / 10
                    }% for ${choice}`;
                }
            })
            .filter((el) => el != null)
            .join(', ');
    }
}
