"use server";

import { ID } from "node-appwrite";
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

    return session;
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
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USER_COLLECTION_ID,
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
    const { account, database } = await createAdminClient();
    const user = await database.getDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USER_COLLECTION_ID,
      "",
      [""]
    );

    return await user.get((await account.get()).$id);
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
    console.error("Error", error);
    return null;
  }
}

export async function createLinkToken(user: User) {
  try {
    const tokenParams: LinkTokenCreateRequest = {
      user: {
        client_user_id: user.$id,
      },
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET,
      client_name: `${user.firstName} ${user.lastName}`,
      products: [Products.Auth],
      language: "en",
      country_codes: [CountryCode.Us],
    };

    const res = await plaidClient.linkTokenCreate(tokenParams);

    return parseStringify({ linkToken: res.data.link_token });
  } catch (error) {
    console.error("Error", error);
  }
}

export async function createBankAccount(params: CreateBankAccountParams) {
  try {
    const { database } = await createAdminClient();

    const bankAccount = await database.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_BANK_COLLECTION_ID,
      ID.unique(),
      params
    );

    return parseStringify(bankAccount);
  } catch (error) {
    console.error("Error", error);
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

    await createBankAccount({
      userId: user.$id,
      bankId: itemId,
      accountId: accountData.account_id,
      accessToken,
      fundingSourceUrl,
      sharableId: encryptId(accountData.account_id),
    });

    revalidatePath("/");

    return parseStringify({
      publicTokenExchange: "complete",
    });
  } catch (error) {
    console.error("Error", error);
  }
}
