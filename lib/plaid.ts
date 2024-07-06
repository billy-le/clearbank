import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

const plaidConfiguration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    PLAID_CLIENT_ID: process.env.PLAID_CLIENT_ID,
    PLAID_SECRET: process.env.PLAID_SECRET,
  },
});

export const plaidClient = new PlaidApi(plaidConfiguration);
