import { useEffect } from "react";
import { getAccount } from "../actions/bank.actions";
import { useAppState } from "../providers/app.provider";

export function useGetAccountDetails(id: string) {
  const {
    state: { accountDetails },
    dispatch,
  } = useAppState();

  useEffect(() => {
    async function fetchAccount() {
      const accountRes = await getAccount({ appwriteItemId: id });
      if (accountRes) {
        dispatch({ type: "SET_ACCOUNT", payload: accountRes });
      }
    }

    if (id && !accountDetails[id]) {
      fetchAccount();
    }
  }, [id]);
}
