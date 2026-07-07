const supabase = require("../config/database");
const platformService = require("../services/platformService");
const scoringService = require("../services/scoringService");
const reconciliationService = require("../services/reconciliationService");
const logger = require("../utils/logger");

// POST /api/webhooks/nomba
// Handles the real Nomba event set (verified against developer.nomba.com):
// payout_success / payout_failed confirm a settlement's outcome;
// payment_success confirms a deposit into a worker's dedicated virtual
// account and runs it through reconciliationService (matches against the
// oldest pending platform-reported order, handles exact/under/overpayment).
// payment_reversal / payout_refund are acknowledged but not acted on yet.
async function handleNombaWebhook(req, res, next) {
  try {
    const { event_type: eventType, data } = req.body;
    const transactionId = data?.transaction?.transactionId;

    if (eventType === "payment_success") {
      const workerId = reconciliationService.workerIdFromAccountRef(data?.transaction?.aliasAccountReference);
      if (!workerId) {
        logger.warn("payment_success webhook with unrecognized aliasAccountReference", {
          aliasAccountReference: data?.transaction?.aliasAccountReference,
        });
        return res.status(200).json({ received: true });
      }

      await reconciliationService.reconcileDeposit({
        workerId,
        receivedAmount: Number(data.transaction.transactionAmount),
        nombaTransactionId: transactionId,
      });
    } else if (eventType === "payout_success" || eventType === "payout_failed") {
      const { data: settlement } = await supabase
        .from("settlements")
        .select("*")
        .eq("nomba_transfer_id", transactionId)
        .maybeSingle();

      if (!settlement) {
        logger.warn("Nomba webhook referenced an unknown settlement", { transactionId, eventType });
        return res.status(200).json({ received: true }); // ack anyway — Nomba retries on non-2xx
      }

      const isSuccess = eventType === "payout_success";
      await supabase
        .from("settlements")
        .update({
          status: isSuccess ? "completed" : "failed",
          settled_at: isSuccess ? data.transaction.time : null,
          error_message: isSuccess ? null : data.transaction.responseCodeMessage || "Transfer failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", settlement.id);

      await platformService.updateBehavioralData(settlement.worker_id);
      await scoringService.calculateScore(settlement.worker_id).catch((err) =>
        logger.error("Score recalculation after settlement webhook failed", { error: err.message })
      );
    } else {
      logger.info("Unhandled Nomba webhook event acknowledged", { eventType });
    }

    res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
}

// POST /api/webhooks/platform
async function handlePlatformWebhook(req, res, next) {
  try {
    const { order_id: orderId, worker_id: workerId, amount, platform } = req.body;
    const result = await platformService.recordEarning({ workerId, platform, orderId, amount });
    res.status(200).json({ received: true, duplicate: result.duplicate });
  } catch (err) {
    next(err);
  }
}

module.exports = { handleNombaWebhook, handlePlatformWebhook };
