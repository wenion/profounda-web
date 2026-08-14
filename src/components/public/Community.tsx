"use client";

import { useTranslations } from "next-intl";

export function Community() {
  const t = useTranslations("Home.community");

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#101521] px-10 py-14 text-center">
      <h3 className="font-serif text-2xl font-semibold text-[#EDEAE1]">
        {t("comingSoon")}
      </h3>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#8B92A6]">
        {t("description")}
      </p>
    </div>
  );
}