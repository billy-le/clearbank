"use server";

import { CountryCode, Institution } from "plaid";

import { plaidClient } from "../plaid";
import { parseStringify } from "../utils";

import { getTransactionsByBankId } from "./transaction.actions";
import { getBanks, getBank } from "./user.actions";
import { handleError } from "../utils";

export async function getAccounts({ userId }: GetAccountsParams) {
	try {
		const banks = await getBanks({ userId });
		const bankRequests: Account[] = [];
		for (const bank of banks ?? []) {
			const accountsResponse = await plaidClient.accountsGet({
				access_token: bank.accessToken,
			});
			const accountData = accountsResponse.data.accounts[0];

			// get institution info from plaid
			const institution = await getInstitution({
				institutionId: accountsResponse.data.item.institution_id!,
			});

			const account: Account = {
				id: accountData.account_id,
				availableBalance: accountData.balances.available!,
				currentBalance: accountData.balances.current!,
				institutionId: institution?.institution_id!,
				name: accountData.name,
				officialName: accountData.official_name!,
				mask: accountData.mask!,
				type: accountData.type as string,
				subtype: accountData.subtype! as string,
				appwriteItemId: bank.$id,
				shareableId: bank.shareableId,
			};

			bankRequests?.push(account);
		}

		const accounts = await Promise.all(bankRequests);

		const totalBanks = accounts.length;
		const totalCurrentBalance = accounts.reduce((total, account) => {
			return total + account.currentBalance;
		}, 0);

		return parseStringify({
			data: accounts,
			totalBanks,
			totalCurrentBalance,
		}) as { data: Account[]; totalBanks: number; totalCurrentBalance: number };
	} catch (error) {
		handleError("An error occurred while getting the accounts:", error);
	}
}

export async function getAccount({
	appwriteItemId,
}: GetAccountParams): Promise<{
	data: Account;
	transactions: Transaction[];
} | null> {
	try {
		// get bank from db
		const bank: Bank = await getBank({ documentId: appwriteItemId });

		// get account info from plaid
		const accountsResponse = await plaidClient.accountsGet({
			access_token: bank?.accessToken!,
		});

		const accountData = accountsResponse.data.accounts[0];

		// get transfer transactions from appwrite
		const transferTransactionsData = await getTransactionsByBankId({
			bankId: bank?.$id!,
		});

		const transferTransactions = transferTransactionsData.documents.map(
			(transferData: Transaction) => ({
				id: transferData.$id,
				name: transferData.name!,
				amount: transferData.amount!,
				date: transferData.$createdAt,
				paymentChannel: transferData.channel,
				category: transferData.category,
				type: transferData.senderBankId === bank?.$id ? "debit" : "credit",
			}),
		);

		// get institution info from plaid
		const institution = await getInstitution({
			institutionId: accountsResponse.data.item.institution_id!,
		});

		const transactions = await getTransactions({
			accessToken: bank?.accessToken!,
		});

		const account: Account = {
			id: accountData.account_id,
			availableBalance: accountData.balances.available!,
			currentBalance: accountData.balances.current!,
			institutionId: institution?.institution_id!,
			name: accountData.name,
			officialName: accountData.official_name ?? "",
			mask: accountData.mask!,
			type: accountData.type as string,
			subtype: accountData.subtype! as string,
			appwriteItemId: bank?.$id,
			shareableId: bank.shareableId,
		};

		// sort transactions by date such that the most recent transaction is first
		const allTransactions = [...transactions, ...transferTransactions].sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
		);

		return parseStringify({
			data: account,
			transactions: allTransactions,
		});
	} catch (error) {
		handleError("An error occurred while getting the account:", error);
		console.log("bad?");
		return null;
	}
}

export async function getInstitution({ institutionId }: GetInstitutionParams) {
	try {
		const institutionResponse = await plaidClient.institutionsGetById({
			institution_id: institutionId,
			country_codes: ["US"] as CountryCode[],
		});

		const intitution = institutionResponse.data.institution;

		return parseStringify(intitution) as Institution;
	} catch (error) {
		handleError("An error occurred while getting the accounts:", error);
		return null;
	}
}

export async function getTransactions({ accessToken }: GetTransactionsParams) {
	let hasMore = true;
	let transactions: any[] = [];

	try {
		// Iterate through each page of new transaction updates for item
		while (hasMore) {
			const response = await plaidClient.transactionsSync({
				access_token: accessToken,
			});

			const data = response.data;

			transactions = response.data.added.map((transaction) => ({
				id: transaction.transaction_id,
				name: transaction.name,
				paymentChannel: transaction.payment_channel,
				type: transaction.payment_channel,
				accountId: transaction.account_id,
				amount: transaction.amount,
				pending: transaction.pending,
				category: transaction.category ? transaction.category[0] : "",
				date: transaction.date,
				image: transaction.logo_url,
			}));

			hasMore = data.has_more;
		}

		return parseStringify(transactions) as any[];
	} catch (error) {
		handleError("An error occurred while getting the transactions:", error);
		return [] as any[];
	}
}
