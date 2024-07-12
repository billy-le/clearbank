import Script from "next/script";

export function Analytics() {
  return (
    <Script
      defer
      data-domain="clearbank.billyle.dev"
      src="https://plausible.billyle.dev/js/script.js"
      strategy="beforeInteractive"
    />
  );
}
