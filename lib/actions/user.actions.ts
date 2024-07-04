"use server";

import { ID } from "node-appwrite";
import { createAdminClient, createSessionClient } from "@/lib/server/appwrite";
import { cookies } from "next/headers";
import { parseStringify } from "../utils";
import { APPWRITE_SESSION } from "@/constants";

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

export async function signUp({
  email,
  password,
  firstName,
  lastName,
}: SignUpParams) {
  try {
    const { account } = await createAdminClient();

    const newUserAccount = await account.create(
      ID.unique(),
      email,
      password,
      `${firstName} ${lastName}`
    );
    const session = await account.createEmailPasswordSession(email, password);

    cookies().set(APPWRITE_SESSION, session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify(newUserAccount);
  } catch (error) {
    console.error("Error", error);
  }
}

export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();

    return await account.get();
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
