import { HeaderBox } from "@/components/HeaderBox";
import { PaymentTransferForm } from "@/components/PaymentTransferForm";
import { getAccounts } from "@/lib/actions/bank.actions";
import { getLoggedInUser } from "@/lib/actions/user.actions";

export default async function PaymentTransfer() {
  const user = await getLoggedInUser();
  const accounts = await getAccounts({ userId: user!.$id });
  return (
    <section className="payment-transfer">
      <HeaderBox
        title="Payment Transfer"
        subtext="Please provide any specific details or notes related to the payment transfer"
      />
      <div className="size-full pt-5">
        <PaymentTransferForm accounts={accounts?.data ?? []} />
      </div>
    </section>
  );
}
