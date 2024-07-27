"use client";

import { HeaderBox } from "@/components/HeaderBox";
import { PaymentTransferForm } from "@/components/PaymentTransferForm";
import { useAppState } from "@/lib/providers/app.provider";

export default async function PaymentTransfer() {
  const {
    state: { accounts },
  } = useAppState();

  return (
    <section className="payment-transfer">
      <HeaderBox
        title="Payment Transfer"
        subtext="Please provide any specific details or notes related to the payment transfer"
      />
      <div className="size-full pt-5">
        <PaymentTransferForm accounts={accounts} />
      </div>
    </section>
  );
}
