"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "@/lib/server/appwrite";
import { cookies } from "next/headers";
import {
  encryptId,
  extractCustomerIdFromUrl,
  parseStringify,
  handleError,
} from "../utils";
import { APPWRITE_SESSION } from "@/constants";
import { plaidClient } from "../plaid";
import {
  LinkTokenCreateRequest,
  CountryCode,
  Products,
  ProcessorTokenCreateRequest,
  ProcessorTokenCreateRequestProcessorEnum,
} from "plaid";
import { revalidatePath } from "next/cache";
import {
  addFundingSource,
  createDwollaCustomer,
  findDwollaCustomer,
} from "./dwolla.actions";

import type { Models } from "node-appwrite";

const {
  APPWRITE_BANK_COLLECTION_ID,
  APPWRITE_DATABASE_ID,
  APPWRITE_USER_COLLECTION_ID,
  PLAID_CLIENT_ID,
  PLAID_SECRET,
} = process.env;

const MAX_AGE = 60 * 60;

export async function getUserInfo({
  userId,
}: GetUserInfoParams): Promise<User | null> {
  const { database } = await createAdminClient();
  const users = await database.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_USER_COLLECTION_ID,
    [Query.equal("userId", userId)]
  );

  if (users.documents.length) {
    const data = users.documents[0] as unknown as User;
    return data;
  }
  return null;
}

export async function signIn({ email, password }: SignInProps) {
  try {
    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);
    cookies().set(APPWRITE_SESSION, session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      maxAge: MAX_AGE,
    });

    const user = await getUserInfo({ userId: session.userId });

    return user;
  } catch (err) {
    handleError("Sign in failed:", err);
    return null;
  }
}

export async function signUp({
  password,
  ...data
}: SignUpParams): Promise<User | null> {
  let newUserAccount: Models.User<Models.Preferences>;
  try {
    const { account, database } = await createAdminClient();

    newUserAccount = await account.create(
      ID.unique(),
      data.email,
      password,
      `${data.firstName} ${data.lastName}`
    );
    if (!newUserAccount) throw new Error("Error creating user");

    const existingDwollaCustomer = await findDwollaCustomer(data.email);

    let dwollaCustomerId: string;
    if (existingDwollaCustomer) {
      dwollaCustomerId = existingDwollaCustomer.id;
    } else {
      const dwollaCustomerUrl = await createDwollaCustomer({
        ...data,
        type: "personal",
      });
      if (!dwollaCustomerUrl) throw new Error("Error creating Dwolla Customer");
      dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);
    }

    if (!dwollaCustomerId) {
      throw new Error("Error retrieving Dwolla Customer ID");
    }

    const newUser = await database.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_USER_COLLECTION_ID,
      ID.unique(),
      {
        ...data,
        userId: newUserAccount.$id,
        dwollaCustomerId,
      }
    );

    const session = await account.createEmailPasswordSession(
      data.email,
      password
    );

    cookies().set(APPWRITE_SESSION, session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      maxAge: MAX_AGE,
    });

    return parseStringify(newUser);
  } catch (err) {
    handleError("Sign up failed:", err);
    return null;
  }
}

export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    const userAccount = await account.get();
    return await getUserInfo({ userId: userAccount.$id });
  } catch (err) {
    handleError("Get Logged In User failed:", err);
    return null;
  }
}

export async function signOut() {
  try {
    const { account } = await createSessionClient();
    cookies().delete(APPWRITE_SESSION);
    return await account.deleteSession("current");
  } catch (err) {
    handleError("Sign out failed:", err);
    return null;
  }
}

export async function createLinkToken(
  user: User
): Promise<{ linkToken: string } | null> {
  try {
    const tokenParams: LinkTokenCreateRequest = {
      user: {
        client_user_id: user.$id,
      },
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
      client_name: `${user.firstName} ${user.lastName}`,
      products: [Products.Auth],
      language: "en",
      country_codes: [CountryCode.Us],
    };

    const res = await plaidClient.linkTokenCreate(tokenParams);

    return parseStringify({ linkToken: res.data.link_token });
  } catch (err) {
    handleError("Create Link Token failed:", err);
    return null;
  }
}

export async function createBankAccount(
  params: CreateBankAccountParams
): Promise<Bank | null> {
  try {
    const { database } = await createAdminClient();

    const bankAccount = await database.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_BANK_COLLECTION_ID,
      ID.unique(),
      params
    );

    return parseStringify(bankAccount);
  } catch (err) {
    handleError("Create Bank Account failed:", err);
    return null;
  }
}

export async function exchangePublicToken({
  publicToken,
  user,
}: ExchangePublicTokenParams): Promise<{
  publicExchangeToken: "complete";
} | null> {
  try {
    const publicTokenRes = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const { access_token: accessToken, item_id: itemId } = publicTokenRes.data;
    const accountsRes = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accountData = accountsRes.data.accounts[0];

    const processorTokenCreateRequest: ProcessorTokenCreateRequest = {
      access_token: accessToken,
      account_id: accountData.account_id,
      processor: ProcessorTokenCreateRequestProcessorEnum.Dwolla,
    };

    const processorTokenRes = await plaidClient.processorTokenCreate(
      processorTokenCreateRequest
    );

    const { processor_token: processorToken } = processorTokenRes.data;

    const fundingSourceUrl = await addFundingSource({
      dwollaCustomerId: user.dwollaCustomerId,
      processorToken,
      bankName: accountData.name,
    });

    if (!fundingSourceUrl) throw Error();

    await createBankAccount({
      userId: user.$id,
      bankId: itemId,
      accountId: accountData.account_id,
      accessToken,
      fundingSourceUrl,
      shareableId: encryptId(accountData.account_id),
    });

    revalidatePath("/");

    return parseStringify({
      publicTokenExchange: "complete",
    });
  } catch (err) {
    handleError("Exchange Public Token failed:", err);
    return null;
  }
}

export async function getBanks({ userId }: GetBanksParams) {
  try {
    const { database } = await createAdminClient();

    const banks = await database.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_BANK_COLLECTION_ID,
      [Query.equal("userId", [userId])]
    );

    return parseStringify(banks.documents) as Bank[];
  } catch (err) {
    handleError("Get Banks failed:", err);
    return [];
  }
}

export async function getBank({
  documentId,
}: GetBankParams): Promise<any | null> {
  try {
    const { database } = await createAdminClient();

    const bank = await database.getDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_BANK_COLLECTION_ID,
      documentId
    );

    return parseStringify(bank);
  } catch (err) {
    handleError("Get Bank by ID Failed:", err);
    return null;
  }
}

export async function getBankByAccountId({
  accountId,
}: GetBankByAccountIdParams): Promise<any | null> {
  try {
    const { database } = await createAdminClient();

    const bank = await database.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_BANK_COLLECTION_ID,
      [Query.equal("accountId", [accountId])]
    );

    if (bank.total !== 1) {
      return null;
    }

    return parseStringify(bank.documents[0]);
  } catch (err) {
    handleError("Get Bank Account By Account ID failed:", err);
    return null;
  }
}
