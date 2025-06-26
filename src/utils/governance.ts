import { LINKS } from 'constants/links';
import { SpaceKey } from 'enums/governance';

export const getProposalUrl = (spaceKey: SpaceKey, id: string) => `https://snapshot.org/#/${spaceKey}/proposal/${id}`;

export const getOvertimeDapProposalUrl = (spaceKey: SpaceKey, id: string) => `${LINKS.Overtime}dao/${spaceKey}/${id}`;
