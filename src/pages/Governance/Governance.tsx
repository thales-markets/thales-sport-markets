import Modal from 'components/Modal';
import { SNAPSHOT_GRAPHQL_URL, VOTING_COUNCIL_PROPOSAL_ID } from 'constants/governance';
import request, { gql } from 'graphql-request';
import { useCallback, useEffect, useState } from 'react';
import { Proposal } from 'types/governance';
import ProposalDetails from './ProposalDetails';
import { Container, MainContentContainer, MainContentWrapper } from './styled-components';

export type GovernanceProps = {
    onClose: () => void;
};

const Governance: React.FC<GovernanceProps> = ({ onClose }) => {
    const [selectedProposal, setSelectedProposal] = useState<Proposal | undefined>(undefined);

    const fetchPreloadedProposal = useCallback(() => {
        const fetch = async () => {
            const { proposal }: { proposal: Proposal } = await request(
                SNAPSHOT_GRAPHQL_URL,
                gql`
                    query Proposals($id: String!) {
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
                            space {
                                id
                                name
                                symbol
                                network
                            }
                            strategies {
                                name
                                network
                                params
                            }
                        }
                    }
                `,
                { id: VOTING_COUNCIL_PROPOSAL_ID }
            );
            setSelectedProposal(proposal);
        };
        fetch();
    }, []);

    useEffect(() => {
        fetchPreloadedProposal();
    }, [fetchPreloadedProposal]);

    return (
        <Modal
            customStyle={{
                overlay: {
                    zIndex: 1000,
                },
            }}
            containerStyle={{
                border: 'none',
            }}
            title="Elections for Overtime Council"
            onClose={onClose}
        >
            <Container>
                <MainContentContainer>
                    <MainContentWrapper>
                        {selectedProposal && <ProposalDetails proposal={selectedProposal} />}
                    </MainContentWrapper>
                </MainContentContainer>
            </Container>
        </Modal>
    );
};

export default Governance;
