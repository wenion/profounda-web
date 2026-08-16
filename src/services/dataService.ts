import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import type {
  EquityCurvePoint,
  HeadlineData,
  HoldingsData,
  RebalanceEntry,
  SignalData,
} from "@/types/performance";

export type PerformanceDataType =
  | "headline"
  | "rebalance_log"
  | "equity_curve_live"
  | "equity_curve_backtest"
  | "holdings"
  | "signal";

export type PerformanceDataMetadata = {
  updatedAt: Date | null;
};

const COLLECTION_NAME =
  "performanceData";


export class DataService {
  async getMetadata(
    type: PerformanceDataType,
  ): Promise<PerformanceDataMetadata | null> {
    const snapshot = await getDoc(
      doc(
        db,
        COLLECTION_NAME,
        type,
      ),
    );

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();

    return {
      updatedAt:
        data.updatedAt instanceof Timestamp
          ? data.updatedAt.toDate()
          : null,
    };
  }

  /* =======================================================
   * Headline
   * ===================================================== */

  async getHeadline():
    Promise<HeadlineData | null> {
    const snapshot = await getDoc(
      doc(
        db,
        COLLECTION_NAME,
        "headline",
      ),
    );

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data()
      .data as HeadlineData;
  }


  async setHeadline(
    data: HeadlineData,
  ): Promise<void> {
    await setDoc(
      doc(
        db,
        COLLECTION_NAME,
        "headline",
      ),
      {
        data,
        updatedAt: serverTimestamp(),
      },
    );
  }


  /* =======================================================
   * Rebalance Log
   * ===================================================== */

  async getRebalanceLog():
    Promise<RebalanceEntry[]> {
    const snapshot = await getDoc(
      doc(
        db,
        COLLECTION_NAME,
        "rebalance_log",
      ),
    );

    if (!snapshot.exists()) {
      return [];
    }

    return snapshot.data()
      .data as RebalanceEntry[];
  }


  async setRebalanceLog(
    data: RebalanceEntry[],
  ): Promise<void> {
    await setDoc(
      doc(
        db,
        COLLECTION_NAME,
        "rebalance_log",
      ),
      {
        data,
        updatedAt: serverTimestamp(),
      },
    );
  }


  /* =======================================================
   * Live Equity Curve
   * ===================================================== */

  async getEquityCurveLive():
    Promise<EquityCurvePoint[]> {
    const snapshot = await getDoc(
      doc(
        db,
        COLLECTION_NAME,
        "equity_curve_live",
      ),
    );

    if (!snapshot.exists()) {
      return [];
    }

    return snapshot.data()
      .data as EquityCurvePoint[];
  }


  async setEquityCurveLive(
    data: EquityCurvePoint[],
  ): Promise<void> {
    await setDoc(
      doc(
        db,
        COLLECTION_NAME,
        "equity_curve_live",
      ),
      {
        data,
        updatedAt: serverTimestamp(),
      },
    );
  }


  /* =======================================================
   * Backtest Equity Curve
   * ===================================================== */

  async getEquityCurveBacktest():
    Promise<EquityCurvePoint[]> {
    const snapshot = await getDoc(
      doc(
        db,
        COLLECTION_NAME,
        "equity_curve_backtest",
      ),
    );

    if (!snapshot.exists()) {
      return [];
    }

    return snapshot.data()
      .data as EquityCurvePoint[];
  }


  async setEquityCurveBacktest(
    data: EquityCurvePoint[],
  ): Promise<void> {
    await setDoc(
      doc(
        db,
        COLLECTION_NAME,
        "equity_curve_backtest",
      ),
      {
        data,
        updatedAt: serverTimestamp(),
      },
    );
  }

  /* =======================================================
  * Holdings
  * ===================================================== */

  async getHoldings():
    Promise<HoldingsData | null> {
    const snapshot = await getDoc(
      doc(
        db,
        COLLECTION_NAME,
        "holdings",
      ),
    );

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data()
      .data as HoldingsData;
  }


  async setHoldings(
    data: HoldingsData,
  ): Promise<void> {
    await setDoc(
      doc(
        db,
        COLLECTION_NAME,
        "holdings",
      ),
      {
        data,
        updatedAt: serverTimestamp(),
      },
    );
  }


  /* =======================================================
  * Signal
  * ===================================================== */

  async getSignal():
    Promise<SignalData | null> {
    const snapshot = await getDoc(
      doc(
        db,
        COLLECTION_NAME,
        "signal",
      ),
    );

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data()
      .data as SignalData;
  }


  async setSignal(
    data: SignalData,
  ): Promise<void> {
    await setDoc(
      doc(
        db,
        COLLECTION_NAME,
        "signal",
      ),
      {
        data,
        updatedAt: serverTimestamp(),
      },
    );
  }
}


export const dataService =
  new DataService();