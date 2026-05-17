import Link from "next/link";
import { AuthButtons } from "@/components/AuthButtons";
import { DirectActionBrand } from "@/components/DirectActionBrand";
import { uiCopy } from "@/lib/ui/copy";

export function Nav() {
  return (
    <header className="site-nav">
      <nav
        className="flex flex-wrap items-center justify-between border-b border-[var(--line)]"
        aria-label="Main"
      >
        <Link href="/" className="da-brand-link no-underline">
          <DirectActionBrand
            className="da-brand--nav"
            logoSize={24}
            wordmarkClassName="text-sm"
          />
        </Link>
        <ul className="flex flex-wrap items-center list-none m-0 p-0">
          <li>
            <Link href="/games/new" className="btn btn-primary text-sm">
              {uiCopy.nav.postGame}
            </Link>
          </li>
          <li>
            <Link href="/leaderboard" className="btn text-sm">
              {uiCopy.nav.leaderboard}
            </Link>
          </li>
          <li>
            <Link href="/profile" className="btn text-sm">
              {uiCopy.nav.profile}
            </Link>
          </li>
          <li>
            <AuthButtons />
          </li>
        </ul>
      </nav>
    </header>
  );
}
