import {
    NUMBER_OF_COUNCIL_MEMBERS,
    NUMBER_OF_COUNCIL_MEMBERS_OLD,
    NUMBER_OF_OIP_COUNCIL_MEMBERS,
    OIP_COUNCIL_START_DATE,
    OIP_PROPOSAL_APPROVAL_VOTES,
    OLD_COUNCIL_END_DATE,
    PROPOSAL_APPROVAL_VOTES,
    PROPOSAL_APPROVAL_VOTES_OLD,
} from 'constants/governance';
import { SpaceKey, StatusEnum } from 'enums/governance';
import { Colors } from 'styles/common';

export const getProposalUrl = (spaceKey: SpaceKey, id: string) => `https://snapshot.org/#/${spaceKey}/proposal/${id}`;

export const getProposalApprovalData = (proposalStartDate: number) => {
    const numberOfCouncilMembers =
        OLD_COUNCIL_END_DATE > new Date(proposalStartDate * 1000)
            ? NUMBER_OF_COUNCIL_MEMBERS_OLD
            : OIP_COUNCIL_START_DATE > new Date(proposalStartDate * 1000)
            ? NUMBER_OF_COUNCIL_MEMBERS
            : NUMBER_OF_OIP_COUNCIL_MEMBERS;
    const proposalApprovalVotes =
        OLD_COUNCIL_END_DATE > new Date(proposalStartDate * 1000)
            ? PROPOSAL_APPROVAL_VOTES_OLD
            : OIP_COUNCIL_START_DATE > new Date(proposalStartDate * 1000)
            ? PROPOSAL_APPROVAL_VOTES
            : OIP_PROPOSAL_APPROVAL_VOTES;
    return { numberOfCouncilMembers, proposalApprovalVotes };
};

export const getStatusColor = (status: string) => {
    switch (status) {
        case StatusEnum.Pending:
            return Colors.BLUE;
        case StatusEnum.Closed:
            return Colors.RED;
        default:
            return Colors.WHITE;
    }
};
