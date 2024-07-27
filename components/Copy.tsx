"use client";
import { useState } from "react";

import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Copy({ title }: { title: string }) {
  const [hasCopied, setHasCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(title);
    setHasCopied(true);

    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  };

  return (
    <div className="flex items-center gap-4 mt-3 max-w-[320px]">
      <p className="truncate text-xs font-medium text-black-2">{title}</p>
      <TooltipProvider>
        <Tooltip open={hasCopied}>
          <TooltipTrigger>
            <Button
              data-state="closed"
              variant="secondary"
              onClick={copyToClipboard}
            >
              {!hasCopied ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 size-4"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 size-4"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent asChild side="bottom">
            <p>Copied</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
