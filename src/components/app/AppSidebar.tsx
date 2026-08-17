"use client";

import { useTranslations } from "next-intl";

import {
  Link,
  usePathname,
} from "@/i18n/navigation";

const mainNavigation = [
  {
    labelKey: "dashboard",
    href: "/dashboard",
    icon: HomeIcon,
  },
  {
    labelKey: "portfolio",
    href: "/portfolio",
    icon: PortfolioIcon,
  },
  {
    labelKey: "rebalance",
    href: "/rebalance",
    icon: RebalanceIcon,
  },
] as const;

const secondaryNavigation = [
  {
    labelKey: "account",
    href: "/account",
    icon: UserIcon,
  },
  {
    labelKey: "billing",
    href: "/billing",
    icon: BillingIcon,
  },
] as const;

export function AppSidebar() {
  const t = useTranslations(
    "AppNavigation",
  );

  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/10 bg-[#0B0F1A] md:flex md:flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <Link
          href="/dashboard"
          className="font-serif text-xl font-semibold tracking-wide text-[#EDEAE1]"
        >
          Pro
          <span className="text-[#C9A15C]">
            found
          </span>
          a
        </Link>
      </div>

      <nav className="flex flex-1 flex-col px-3 py-6">
        {/* Main */}
        <div className="space-y-1">
          {mainNavigation.map((item) => (
            <NavigationItem
              key={item.href}
              label={t(item.labelKey)}
              href={item.href}
              icon={item.icon}
              active={isActive(
                pathname,
                item.href,
              )}
            />
          ))}
        </div>

        <div className="my-6 border-t border-white/10" />

        {/* Secondary */}
        <div className="space-y-1">
          {secondaryNavigation.map(
            (item) => (
              <NavigationItem
                key={item.href}
                label={t(item.labelKey)}
                href={item.href}
                icon={item.icon}
                active={isActive(
                  pathname,
                  item.href,
                )}
              />
            ),
          )}
        </div>

        <div className="mt-auto px-3 pt-8">
          <p className="text-xs leading-5 text-[#5A6178]">
            Profounda
            <br />
            Investor Consensus + Momentum
          </p>
        </div>
      </nav>
    </aside>
  );
}

type NavigationItemProps = {
  label: string;
  href:
    | "/dashboard"
    | "/portfolio"
    | "/rebalance"
    | "/account"
    | "/billing";
  icon: React.ComponentType<{
    className?: string;
  }>;
  active: boolean;
};

function NavigationItem({
  label,
  href,
  icon: Icon,
  active,
}: NavigationItemProps) {
  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition",
        active
          ? "bg-[#C9A15C]/10 text-[#E4BC7A]"
          : "text-[#8B92A6] hover:bg-white/5 hover:text-[#EDEAE1]",
      ].join(" ")}
    >
      <Icon className="h-[18px] w-[18px]" />

      <span>{label}</span>
    </Link>
  );
}

function isActive(
  pathname: string,
  href: string,
) {
  return (
    pathname === href ||
    pathname.startsWith(
      `${href}/`,
    )
  );
}

function HomeIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={className}
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9 21v-7h6v7" />
    </svg>
  );
}

function PortfolioIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={className}
    >
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20H2" />
    </svg>
  );
}

function RebalanceIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={className}
    >
      <path d="M4 7h12" />
      <path d="m13 4 3 3-3 3" />
      <path d="M20 17H8" />
      <path d="m11 14-3 3 3 3" />
    </svg>
  );
}

function UserIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={className}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c.8-4.2 3.5-6 8-6s7.2 1.8 8 6" />
    </svg>
  );
}

function BillingIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={className}
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />
      <path d="M3 10h18" />
    </svg>
  );
}