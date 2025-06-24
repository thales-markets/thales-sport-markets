import { SNAPSHOT_GRAPHQL_URL } from 'constants/governance';
import request, { gql } from 'graphql-request';
import { useCallback, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Proposal } from 'types/governance';
import ProposalDetails from './ProposalDetails';
import { Container, MainContentContainer, MainContentWrapper } from './styled-components';

export type GovernanceProps = RouteComponentProps<{
    space: string;
    id: string;
}>;

const Governance: React.FC<GovernanceProps> = (props) => {
    const [selectedProposal, setSelectedProposal] = useState<Proposal | undefined>(undefined);

    // const isMobile = false;

    const fetchPreloadedProposal = useCallback(() => {
        const fetch = async () => {
            const { params } = props.match;
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
                { id: params.id }
            );
            setSelectedProposal(proposal);
        };
        fetch();
    }, [props.match]);

    useEffect(() => {
        const { params } = props.match;

        if (params && params.space) {
            if (params.id) {
                fetchPreloadedProposal();
            } else {
                setSelectedProposal(undefined);
            }
        } else {
            setSelectedProposal(undefined);
        }
    }, [props.match, fetchPreloadedProposal]);

    const isOverviewPage = !selectedProposal;

    return (
        <Container id="proposal-details">
            <MainContentContainer isOverviewPage={isOverviewPage} isThalesStakersPage={false}>
                <MainContentWrapper isOverviewPage={isOverviewPage}>
                    {selectedProposal && <ProposalDetails proposal={selectedProposal} />}
                </MainContentWrapper>
            </MainContentContainer>
        </Container>
    );
};

export default Governance;
