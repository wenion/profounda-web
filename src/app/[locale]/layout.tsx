import type { ReactNode } from "react";

import {
  NextIntlClientProvider,
  hasLocale,
} from "next-intl";
import { notFound } from "next/navigation";

import { routing } from "@/i18n/routing";

type LocaleLayoutProps = {
  children: ReactNode;

  params: Promise<{
    locale: string;
  }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = (
    await import(
      `../../../messages/${locale}.json`
    )
  ).default;

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
    >
      {children}
    </NextIntlClientProvider>
  );
}