"use client";

import { formatAmount } from "@/lib/utils";
import CountUp from "react-countup";

export function AnimatedCounter({ amount }: { amount: number }) {
  return (
    <CountUp
      className="w-full"
      formattingFn={formatAmount}
      end={amount}
      decimals={2}
    />
  );
}
