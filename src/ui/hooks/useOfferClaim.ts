import { useCallback, useState } from "react";
import { claimService, ClaimService } from "../../core/claim/ClaimService";

/**
 * Thin React adapter over ClaimService.
 *
 * Owns only the modal's UI state; all decision logic (platform detection,
 * redirect + timeout fallback) lives in ClaimService. Components call
 * openClaim(url) and render <ClaimLinkModal open={claimModalOpen} .../>.
 */
export function useOfferClaim(service: ClaimService = claimService) {
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimUrl, setClaimUrl] = useState("");

  const openClaim = useCallback(
    (url: string) => {
      service.claim(url, {
        onShowModal: (resolvedUrl) => {
          setClaimUrl(resolvedUrl);
          setClaimModalOpen(true);
        },
      });
    },
    [service],
  );

  const closeClaim = useCallback(() => setClaimModalOpen(false), []);

  return { claimModalOpen, claimUrl, openClaim, closeClaim };
}
