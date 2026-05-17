import { DirectActionBrand } from "@/components/DirectActionBrand";
import { LoginForm } from "./LoginForm";
import { uiCopy } from "@/lib/ui/copy";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <section className="max-w-md">
      <DirectActionBrand
        className="da-brand--hero mb-6"
        logoSize={56}
        wordmarkClassName="text-2xl"
      />
      <h1 className="font-display text-2xl text-[var(--acid)] mb-2">
        {uiCopy.login.title}
      </h1>
      <p className="text-[var(--fg-dim)] mb-8">{uiCopy.login.body}</p>
      <LoginForm nextPath={next} />
    </section>
  );
}
