"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  PlaidLinkStableEvent,
  usePlaidLink,
  type PlaidLinkOnSuccess,
  type PlaidLinkOptions,
} from "react-plaid-link";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/use-toast";
import {
  createLinkToken,
  exchangePublicToken,
} from "@/lib/actions/user.actions";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

export function PlaidLink({ user, variant }: PlaidLinkProps) {
  const [token, setToken] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const onSuccess = useCallback<PlaidLinkOnSuccess>(
    async (publicToken: string) => {
      if (!user) return;
      await exchangePublicToken({
        publicToken,
        user,
      });

      router.push("/");
    },
    [user, router]
  );

  const config: PlaidLinkOptions = {
    token,
    onSuccess,
    onEvent: (event) => {
      switch (event) {
        case PlaidLinkStableEvent.ERROR: {
          toast({
            title: "Something went wrong",
            description: "Unable to connect to Plaid",
            variant: "destructive",
          });
          setIsLoading(false);
          setIsOpen(false);
          break;
        }
        case PlaidLinkStableEvent.OPEN: {
          setIsLoading(true);
          setIsOpen(true);
          break;
        }
        case PlaidLinkStableEvent.HANDOFF:
        case PlaidLinkStableEvent.EXIT: {
          setIsLoading(false);
          setIsOpen(false);
          break;
        }
        default: {
          break;
        }
      }
    },
  };

  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    if (!user) return;
    const getLinkToken = async () => {
      const data = await createLinkToken(user);
      setToken(data?.linkToken ?? null);
    };

    getLinkToken();
  }, [user]);

  useEffect(() => {
    if (ready) {
      setIsLoading(false);
    }
  }, [ready]);

  function onConnectBankClick() {
    open();
  }

  const isDisabled = !ready || isLoading;

  return (
    <>
      {
        isOpen && createPortal(<div className="fixed inset-0 bg-black-1/50">
          <div className="absolute top-[10%] left-1/2 -translate-y-[10%] -translate-x-1/2 flex flex-col justify-center bg-white rounded-md h-40 min-w-36 p-6">
            <p>To connect a guest account please use the following:</p>
            <p className="text-gray-600">Username: user_good</p>
            <p className="text-gray-600">Password: pass_good</p>
          </div>
        </div>, document.body)
      }
      {variant === "primary" ? (
        <Button
          onClick={onConnectBankClick}
          disabled={isDisabled}
          className="plaidlink-primary"
        >
          Connect Bank
        </Button>
      ) : variant === "ghost" ? (
        <Button
          className="plaidlink-ghost"
          variant="ghost"
          disabled={isDisabled}
          onClick={onConnectBankClick}
        >
          <Image
            src="/icons/connect-bank.svg"
            alt="connect bank"
            width={24}
            height={24}
          />
          <p className="hidden text-base font-semibold text-black-2 xl:block">
            Connect Bank
          </p>
        </Button>
      ) : (
        <Button
          className={cn("plaidlink-default", "px-3")}
          onClick={onConnectBankClick}
          disabled={isDisabled}
        >
          <Image
            src="/icons/connect-bank.svg"
            alt="connect bank"
            width={24}
            height={24}
          />
          <p className="text-base font-semibold text-black-2">Connect Bank</p>
        </Button>
      )}
    </>
  );
}
