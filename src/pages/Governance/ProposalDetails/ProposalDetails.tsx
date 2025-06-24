import { SpaceKey, StatusEnum } from 'enums/governance';
import useVotingPowerQuery from 'queries/governance/useVotingPowerQuery';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getIsBiconomy } from 'redux/modules/wallet';
import { Remarkable } from 'remarkable';
import { linkify } from 'remarkable/linkify';
import { FlexDivRow } from 'styles/common';
import { formatCurrencyWithKey } from 'thales-utils';
import { Proposal } from 'types/governance';
import { getProposalApprovalData } from 'utils/governance';
import useBiconomy from 'utils/smartAccount/hooks/useBiconomy';
import { useAccount } from 'wagmi';
import ProposalHeader from './ProposalHeader';
import WeightedVoting from './Voting/WeightedVoting';
import { Body, Container, DetailsTitle, Divider, VoteHeader, VoteNote, VotingPowerTitle } from './styled-components';

type ProposalDetailsProps = {
    proposal: Proposal;
};

const ProposalDetails: React.FC<ProposalDetailsProps> = ({ proposal }) => {
    const { t } = useTranslation();
    const isMobile = useSelector(getIsMobile);
    const isBiconomy = useSelector(getIsBiconomy);

    const { address, isConnected } = useAccount();
    const { smartAddress } = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddress : address) || '';
    const { numberOfCouncilMembers, proposalApprovalVotes } = getProposalApprovalData(proposal.start);

    const votingPowerQuery = useVotingPowerQuery(proposal, walletAddress, {
        enabled: isConnected,
    });
    const votingPower: number = votingPowerQuery.isSuccess && votingPowerQuery.data ? votingPowerQuery.data : 0;

    const getRawMarkup = (value?: string | null) => {
        const remarkable = new Remarkable({
            html: false,
            breaks: true,
            typographer: false,
        }).use(linkify);

        if (!value) return { __html: '' };

        return { __html: remarkable.render(value) };
    };

    return (
        <>
            <ProposalHeader proposal={proposal} />
            <Container topMargin={isMobile ? 30 : 10}>
                <DetailsTitle>{proposal.title}</DetailsTitle>
                <Body dangerouslySetInnerHTML={getRawMarkup(proposal.body)}></Body>
                {proposal.state === StatusEnum.Active && (
                    <>
                        <VoteHeader>
                            <FlexDivRow>
                                <DetailsTitle>{t(`governance.proposal.vote-label`)}</DetailsTitle>
                                {proposal.space.id === SpaceKey.OIPS && (
                                    <VoteNote>
                                        (
                                        {t(`governance.proposal.vote-note`, {
                                            approvalVotes: proposalApprovalVotes,
                                            totalVotes: numberOfCouncilMembers,
                                        })}
                                        )
                                    </VoteNote>
                                )}
                            </FlexDivRow>
                            <VotingPowerTitle>{`${t(`governance.proposal.voting-power-label`)}: ${
                                isConnected && !votingPowerQuery.isLoading
                                    ? formatCurrencyWithKey(proposal.space.symbol, votingPower)
                                    : '-'
                            }`}</VotingPowerTitle>
                        </VoteHeader>
                        <Divider />
                    </>
                )}
                <WeightedVoting proposal={proposal} hasVotingRights={votingPower > 0} />
            </Container>
        </>
    );
};

export default ProposalDetails;
