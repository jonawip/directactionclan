import { uiCopy } from "@/lib/ui/copy";

type Variant = "product" | "clan";

type Props = {
  variant?: Variant;
  logoSize?: number;
  className?: string;
  wordmarkClassName?: string;
};

export function DirectActionBrand({
  variant = "product",
  logoSize = 32,
  className = "",
  wordmarkClassName = "",
}: Props) {
  const { logoSrc, clanName, productName } = uiCopy.brand;
  const label = variant === "product" ? productName : clanName;
  const showGamesSuffix = variant === "product";

  return (
    <span className={`da-brand ${className}`.trim()}>
      <img
        src={logoSrc}
        alt=""
        width={logoSize}
        height={logoSize}
        className="da-brand-logo"
        decoding="async"
      />
      <span className={`da-brand-wordmark font-display ${wordmarkClassName}`.trim()}>
        {showGamesSuffix ? (
          <>
            {clanName}{" "}
            <span className="da-brand-suffix">Games</span>
          </>
        ) : (
          clanName
        )}
      </span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
