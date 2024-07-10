"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../server/appwrite";
import { parseStringify, handleError } from "../utils";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_TRANSACTION_COLLECTION_ID: TRANSACTION_COLLECTION_ID,
} = process.env;

export async function createTransaction(transaction: CreateTransactionParams) {
  try {
    const { database } = await createAdminClient();

    const newTransaction = await database.createDocument(
      DATABASE_ID!,
      TRANSACTION_COLLECTION_ID!,
      ID.unique(),
      {
        channel: "online",
        category: "Transfer",
        ...transaction,
      }
    );

    return parseStringify(newTransaction) as Transaction;
  } catch (err) {
    handleError("Creating Transaction failed:", err);
    return null;
  }
}

export async function getTransactionsByBankId({
  bankId,
}: GetTransactionsByBankIdParams): Promise<{
  total: number;
  documents: Transaction[];
}> {
  try {
    const { database } = await createAdminClient();

    const senderTransactions = await database.listDocuments(
      DATABASE_ID!,
      TRANSACTION_COLLECTION_ID!,
      [Query.equal("senderBankId", bankId)]
    );

    const receiverTransactions = await database.listDocuments(
      DATABASE_ID!,
      TRANSACTION_COLLECTION_ID!,
      [Query.equal("receiverBankId", bankId)]
    );

    const transactions = {
      total: senderTransactions.total + receiverTransactions.total,
      documents: [
        ...senderTransactions.documents,
        ...receiverTransactions.documents,
      ],
    };

    return parseStringify(transactions);
  } catch (err) {
    handleError("Get Transacation By Bank ID failed:", err);
    return { total: 0, documents: [] as Transaction[] };
  }
}
