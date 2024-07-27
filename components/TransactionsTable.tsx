import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  cn,
  formatAmount,
  formatDateTime,
  getTransactionStatus,
} from "@/lib/utils";
import { transactionCategoryStyles } from "@/constants";

function CategoryBadge({ category }: CategoryBadgeProps) {
  const { backgroundColor, borderColor, chipBackgroundColor, textColor } =
    transactionCategoryStyles[
      category as keyof typeof transactionCategoryStyles
    ] || transactionCategoryStyles.default;
  return (
    <Badge
      className={cn("category-badge", chipBackgroundColor, borderColor)}
      variant="outline"
    >
      <span
        className={cn("size-2 rounded-full inline-block", backgroundColor)}
      ></span>
      <span className={cn("text-xs font-medium", textColor)}>{category}</span>
    </Badge>
  );
}

export function TransactionsTable({ transactions }: TransactionTableProps) {
  const accounts = new Set(transactions.map((t) => t.accountId));

  return (
    <Table>
      <TableHeader className="bg-slate-50">
        <TableRow>
          {accounts.size > 1 && <TableHead className="px-2">Account</TableHead>}
          <TableHead className="px-2">Transaction</TableHead>
          <TableHead className="px-2">Amount</TableHead>
          <TableHead className="px-2">Status</TableHead>
          <TableHead className="px-2">Date</TableHead>
          <TableHead className="px-2 max-md:hidden">Channel</TableHead>
          <TableHead className="px-2 max-md:hidden">Category</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => {
          const status = getTransactionStatus(new Date(transaction.date));
          const amount = formatAmount(transaction.amount);
          return (
            <TableRow key={transaction.id}>
              {accounts.size > 1 && (
                <TableCell className="w-16 pl-2 pr-8">
                  <p className="truncate w-full">
                    {transaction.accountId
                      .substring(0, 4)
                      .replaceAll(/[a-zA-Z0-9]/gi, "●")}
                    {transaction.accountId.substring(
                      transaction.accountId.length - 4
                    )}
                  </p>
                </TableCell>
              )}
              <TableCell className="max-w-[250px] pl-2 pr-8">
                {transaction.image ? (
                  <Avatar>
                    <AvatarImage src={transaction.image} />
                  </Avatar>
                ) : (
                  <p className="truncate w-full">{transaction.name}</p>
                )}
              </TableCell>
              <TableCell
                className={`pl-2 pr-10 min-w-32 font-semibold ${
                  amount[0] === "-" ? "text-red-400" : "text-green-400"
                }`}
              >
                {amount}
              </TableCell>
              <TableCell className="pl-2 pr-10">
                <CategoryBadge category={status} />
              </TableCell>
              <TableCell className="pl-2 pr-10 min-w-32">
                {formatDateTime(new Date(transaction.date)).dateTime}
              </TableCell>
              <TableCell className="pl-2 pr-10 min-w-24 capitalize">
                {transaction.paymentChannel}
              </TableCell>
              <TableCell className="pl-2 pr-10 max-md:hidden">
                <CategoryBadge category={transaction.category} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
