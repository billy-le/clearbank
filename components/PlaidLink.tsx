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

export function PlaidLink({ user, variant }: PlaidLinkProps) {
  const [token, setToken] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState(true);
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
          break;
        }
        case PlaidLinkStableEvent.OPEN: {
          setIsLoading(true);
          break;
        }
        case PlaidLinkStableEvent.HANDOFF:
        case PlaidLinkStableEvent.EXIT: {
          setIsLoading(false);
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

  return (
    <>
      {variant === "primary" ? (
        <Button
          onClick={() => open()}
          disabled={!ready || isLoading}
          className="plaidlink-primary"
        >
          Connect Bank
        </Button>
      ) : variant === "ghost" ? (
        <Button
          className="plaidlink-ghost"
          variant="ghost"
          disabled={!ready || isLoading}
          onClick={() => open()}
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
          onClick={() => open()}
          disabled={!ready || isLoading}
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
