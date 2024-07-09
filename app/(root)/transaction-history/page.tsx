import { HeaderBox } from "@/components/HeaderBox";
import { Pagination } from "@/components/Pagination";
import { TransactionsTable } from "@/components/TransactionsTable";
import { getAccount, getAccounts } from "@/lib/actions/bank.actions";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import { formatAmount } from "@/lib/utils";

const rowsPerPage = 10;

export default async function TransactionHistory({
  searchParams: { id, page },
}: SearchParamProps) {
  const pageNum = parseInt(page as string, 10);
  const currentPage = page && !isNaN(pageNum) ? pageNum : 1;
  const user = await getLoggedInUser();
  const accounts = await getAccounts({ userId: user!.$id });

  if (!accounts) return null;

  const accountsData = accounts.data;
  const appwriteItemId = (id as string) ?? accountsData?.[0]?.appwriteItemId;
  const account = await getAccount({ appwriteItemId });

  const totalPages = Math.ceil(
    (account?.transactions?.length ?? 1) / rowsPerPage
  );
  const indexOfLastTransaction = currentPage * rowsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPage;
  const currentTransactions =
    account?.transactions?.slice(
      indexOfFirstTransaction,
      indexOfLastTransaction
    ) ?? [];

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
            <h2 className="text-19 font-bold text-white">
              {account?.data?.name}
            </h2>
            <p className="text-14 text-blue-25">{account?.data.officialName}</p>
            <p className="text-14 font-semibold tracking-[1.1px] text-white">
              ●●●● ●●●● ●●●●{" "}
              <span className="text-16">{account?.data.mask}</span>
            </p>
          </div>
          <div className="transactions-account-balance">
            <p className="text-14">Current Balance</p>
            <p className="text-24 text-center font-bold">
              {formatAmount(account?.data?.currentBalance!)}
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
