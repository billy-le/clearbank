"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "@/lib/server/appwrite";
import { cookies } from "next/headers";
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils";
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
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";

import type { Models } from "node-appwrite";

const {
  APPWRITE_BANK_COLLECTION_ID,
  APPWRITE_DATABASE_ID,
  APPWRITE_TRANSACTION_COLLECTION_ID,
  APPWRITE_USER_COLLECTION_ID,
  PLAID_CLIENT_ID,
  PLAID_SECRET,
} = process.env;

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
    });

    const user = await getUserInfo({ userId: session.userId });

    return user;
  } catch (error) {
    console.error("Error", error);
  }
}

export async function signUp({ password, ...data }: SignUpParams) {
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

    const dwollaCustomerUrl = await createDwollaCustomer({
      ...data,
      type: "personal",
    });
    if (!dwollaCustomerUrl) throw new Error("Error creating dwolla customer");

    const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);

    const newUser = await database.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_USER_COLLECTION_ID,
      ID.unique(),
      {
        ...data,
        userId: newUserAccount.$id,
        dwollaCustomerId,
        dwollaCustomerUrl,
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
    });

    return parseStringify(newUser);
  } catch (error) {
    console.error("Error", error);
  }
}

export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    const userAccount = await account.get();
    return await getUserInfo({ userId: userAccount.$id });
  } catch (error) {
    console.error("Error", error);
    return null;
  }
}

export async function signOut() {
  try {
    const { account } = await createSessionClient();
    cookies().delete(APPWRITE_SESSION);
    return await account.deleteSession("current");
  } catch (error) {
    console.error("Error", error.message);
    return null;
  }
}

export async function createLinkToken(user: User) {
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
  } catch (error) {
    console.error("Error", error.message);
  }
}

export async function createBankAccount(params: CreateBankAccountParams) {
  try {
    const { database } = await createAdminClient();

    const bankAccount = await database.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_BANK_COLLECTION_ID,
      ID.unique(),
      params
    );

    return parseStringify(bankAccount);
  } catch (error) {
    console.error("Error", error.message);
  }
}

export async function exchangePublicToken({
  publicToken,
  user,
}: ExchangePublicTokenParams) {
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

    const bank = await createBankAccount({
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
  } catch (error) {
    console.error("Error", error.message);
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
  } catch (error) {
    console.error(error.message);
  }
}

export async function getBank({
  documentId,
}: GetBankParams): Promise<Bank | undefined> {
  try {
    const { database } = await createAdminClient();

    const bank = await database.getDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_BANK_COLLECTION_ID,
      documentId
    );

    return parseStringify(bank) as Bank;
  } catch (error) {
    console.error(error.message);
  }
}
