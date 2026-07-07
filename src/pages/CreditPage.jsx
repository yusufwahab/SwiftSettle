import { useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import FinancialScoreCard from "../components/FinancialScoreCard";
import IdentityProgressTracker from "../components/IdentityProgressTracker";
import VerifiedIncomeCertificate from "../components/VerifiedIncomeCertificate";
import CreditEligibility from "../components/CreditEligibility";
import CreditRequestModal from "../components/CreditRequestModal";
import SettlementReliabilityChart from "../components/SettlementReliabilityChart";
import CreditGuide from "../components/CreditGuide";
import { financialService, creditService } from "../services";
import { useAsync } from "../hooks/useAsync";

export default function CreditPage() {
  const [modalOpen, setModalOpen] = useState(false);

  const scoreState = useAsync(() => financialService.getScore(), []);
  const identityState = useAsync(() => financialService.getIdentityStatus(), []);
  const certificateState = useAsync(
    () => financialService.getCertificate().catch((err) => (err.code === "no_certificate" ? null : Promise.reject(err))),
    []
  );
  const eligibilityState = useAsync(() => creditService.getEligibility(), []);

  return (
    <AppLayout title="Financial Identity & Credit" breadcrumb="Credit">
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <FinancialScoreCard state={scoreState} />
          <SettlementReliabilityChart state={scoreState} />
          <VerifiedIncomeCertificate state={certificateState} />
        </div>

        <div className="flex flex-col gap-5">
          <IdentityProgressTracker state={identityState} />
          <CreditEligibility state={eligibilityState} onRequestCredit={() => setModalOpen(true)} />
          <CreditGuide />
        </div>
      </div>

      <CreditRequestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        eligibility={eligibilityState.data}
        onApproved={() => {
          scoreState.reload();
          eligibilityState.reload();
        }}
      />
    </AppLayout>
  );
}
