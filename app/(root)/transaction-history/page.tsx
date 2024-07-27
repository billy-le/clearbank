"use client";

import { HeaderBox } from "@/components/HeaderBox";
import { Pagination } from "@/components/Pagination";
import { TransactionsTable } from "@/components/TransactionsTable";
import { useGetAccountDetails } from "@/lib/hooks/useAccountDetails";
import { useAppState } from "@/lib/providers/app.provider";
import { formatAmount } from "@/lib/utils";

const rowsPerPage = 10;

export default async function TransactionHistory({
  searchParams: { id, page },
}: SearchParamProps) {
  const {
    state: { accountDetails },
  } = useAppState();

  useGetAccountDetails(id as string);

  let account: Account | null = null;
  let transactions: Transaction[] = [];
  if (id) {
    account = accountDetails[id as string]?.info;
    transactions = accountDetails[id as string]?.transactions ?? [];
  } else {
    transactions = Object.entries(accountDetails)
      .flatMap(([, accountDetails]) => accountDetails.transactions)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  const pageNum = parseInt(page as string, 10);
  const currentPage = page && !isNaN(pageNum) ? pageNum : 1;

  const totalPages = Math.ceil(transactions.length / rowsPerPage);
  const indexOfLastTransaction = currentPage * rowsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPage;
  const currentTransactions = transactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  return (
    <section className="transactions">
      <div className="transactions-header">
        <HeaderBox
          title="Transaction History"
          subtext="See your bank details and transactions"
        />
      </div>
      <div className="space-y-6">
        <div className="transactions-account">
          <div className="flex flex-col gap-2">
            <h2 className="text-19 font-bold text-white">{account?.name}</h2>
            <p className="text-14 text-blue-25">{account?.officialName}</p>
            {account && (
              <p className="text-14 font-semibold tracking-[1.1px] text-white">
                ●●●● ●●●● ●●●● <span className="text-16">{account.mask}</span>
              </p>
            )}
          </div>
          <div className="transactions-account-balance">
            <p className="text-14">Current Balance</p>
            <p className="text-24 text-center font-bold">
              {account ? formatAmount(account.currentBalance!) : "$0.00"}
            </p>
          </div>
        </div>

        <section className="flex w-full flex-col gap-6">
          <TransactionsTable transactions={currentTransactions} />
          <Pagination page={currentPage} totalPages={totalPages} />
        </section>
      </div>
    </section>
  );
}
