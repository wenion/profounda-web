// src/services/siteConfigService.ts

import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export type HomeConfig = {
  currentRebalance: string;
  nextRebalance: string;

  cagr: number;
  liveReturn: number;
  spyReturn: number;
  maxDrawdown: number;
  sharpe: number;
};

export const siteConfigService = {
  async getHomeConfig(): Promise<HomeConfig> {
    const ref = doc(
      db,
      "siteConfig",
      "home",
    );

    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      throw new Error(
        "Home config not found",
      );
    }

    return snapshot.data() as HomeConfig;
  },

  async updateHomeConfig(
    updates: Partial<HomeConfig>,
  ): Promise<void> {
    const ref = doc(
      db,
      "siteConfig",
      "home",
    );

    await updateDoc(ref, updates);
  },
};