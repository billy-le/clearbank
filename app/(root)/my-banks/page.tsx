"use client";

import { BankCard } from "@/components/BankCard";
import { HeaderBox } from "@/components/HeaderBox";
import { useAppState } from "@/lib/providers/app.provider";

export default async function MyBanks() {
  const {
    state: { user, accounts },
  } = useAppState();

  return (
    <section className="flex">
      <div className="my-banks">
        <HeaderBox
          title="My Bank Accounts"
          subtext="Effortlessly manage your banking activities."
        />
        <div className="space-y-4">
          <h2 className="header-2">Your cards</h2>
          <div className="flex flex-wrap gap-6">
            {accounts.map((account) => (
              <BankCard
                key={account.id}
                account={account}
                userName={`${user?.firstName} ${user?.lastName}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
