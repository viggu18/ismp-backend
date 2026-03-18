const assert = require("node:assert/strict");
const { test } = require("node:test");

const {
  ContentSubmissionStatus,
  OfferStatus,
  PaymentStatus,
} = require("@prisma/client");
const { AppError } = require("../dist/common/errors/app-error");
const {
  ensureContentActionAllowed,
  ensureOfferTransition,
  ensurePaymentTransition,
} = require("../dist/common/utils/workflow");

test("offer workflow allows valid transitions", () => {
  assert.doesNotThrow(() =>
    ensureOfferTransition(OfferStatus.PENDING, OfferStatus.ACCEPTED),
  );
  assert.doesNotThrow(() =>
    ensureOfferTransition(OfferStatus.COUNTERED, OfferStatus.PENDING),
  );
});

test("offer workflow rejects invalid transitions", () => {
  assert.throws(
    () => ensureOfferTransition(OfferStatus.ACCEPTED, OfferStatus.COUNTERED),
    AppError,
  );
});

test("payment workflow allows escrow and release flow", () => {
  assert.doesNotThrow(() =>
    ensurePaymentTransition(PaymentStatus.PENDING, PaymentStatus.IN_ESCROW),
  );
  assert.doesNotThrow(() =>
    ensurePaymentTransition(PaymentStatus.IN_ESCROW, PaymentStatus.RELEASED),
  );
});

test("payment workflow rejects invalid transitions", () => {
  assert.throws(
    () => ensurePaymentTransition(PaymentStatus.RELEASED, PaymentStatus.PENDING),
    AppError,
  );
});

test("content workflow only allows actions on submitted drafts", () => {
  assert.doesNotThrow(() =>
    ensureContentActionAllowed(ContentSubmissionStatus.SUBMITTED, "approve"),
  );
  assert.throws(
    () =>
      ensureContentActionAllowed(
        ContentSubmissionStatus.REVISION_REQUESTED,
        "approve",
      ),
    AppError,
  );
});
