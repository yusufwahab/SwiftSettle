const payoutRequestService = require("../services/payoutRequestService");

// POST /api/payouts/request
async function createPayoutRequest(req, res, next) {
  try {
    const payoutRequest = await payoutRequestService.createPayoutRequest(req.worker.id);
    res.json({ payout_request: payoutRequest });
  } catch (err) {
    next(err);
  }
}

// GET /api/payouts/mine
async function listMine(req, res, next) {
  try {
    const requests = await payoutRequestService.listForWorker(req.worker.id);
    res.json({ payout_requests: requests });
  } catch (err) {
    next(err);
  }
}

// GET /api/payouts/all — admin only
async function listAll(req, res, next) {
  try {
    const requests = await payoutRequestService.listAll();
    res.json({ payout_requests: requests });
  } catch (err) {
    next(err);
  }
}

// POST /api/payouts/:id/process — admin only
async function process(req, res, next) {
  try {
    const payoutRequest = await payoutRequestService.processPayoutRequest({
      payoutRequestId: req.params.id,
      adminWorkerId: req.worker.id,
      paidAmount: Number(req.body.amount),
    });
    res.json({ payout_request: payoutRequest });
  } catch (err) {
    next(err);
  }
}

module.exports = { createPayoutRequest, listMine, listAll, process };
