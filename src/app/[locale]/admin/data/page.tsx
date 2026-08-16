"use client";

import {
  ChangeEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  dataService,
  type PerformanceDataType,
} from "@/services/dataService";
import {
  validatePerformanceData,
} from "@/utils/validatePerformanceData";

import type {
  EquityCurvePoint,
  HeadlineData,
  HoldingsData,
  RebalanceEntry,
  SignalData,
} from "@/types/performance";


type DataItem = {
  type: PerformanceDataType;
  title: string;
  filename: string;
  description: string;
};


type MetadataMap = Partial<
  Record<
    PerformanceDataType,
    Date | null
  >
>;


const DATA_ITEMS: DataItem[] = [
  {
    type: "headline",
    title: "Headline",
    filename: "headline.json",
    description:
      "Backtest and live-account headline performance metrics.",
  },
  {
    type: "holdings",
    title: "Holdings",
    filename: "holdings.json",
    description:
      "Current portfolio holdings, cash, market values, weights, and P&L.",
  },
  {
    type: "signal",
    title: "Signal",
    filename: "signal.json",
    description:
      "Current market regime, target allocation, stock picks, and signal information.",
  },
  {
    type: "equity_curve_live",
    title: "Live Equity Curve",
    filename: "equity_curve_live.json",
    description:
      "Daily live-account equity and SPY benchmark values.",
  },
  {
    type: "equity_curve_backtest",
    title: "Backtest Equity Curve",
    filename: "equity_curve_backtest.json",
    description:
      "Historical backtest equity and SPY benchmark values.",
  },
  {
    type: "rebalance_log",
    title: "Rebalance Log",
    filename: "rebalance_log.json",
    description:
      "Quarterly portfolio rebalance history.",
  },
];


export default function AdminDataPage() {
  const [uploading, setUploading] =
    useState<PerformanceDataType | null>(
      null,
    );

  const [success, setSuccess] =
    useState<PerformanceDataType | null>(
      null,
    );

  const [error, setError] =
    useState("");

  const [metadata, setMetadata] =
    useState<MetadataMap>({});

  const [viewing, setViewing] =
    useState<PerformanceDataType | null>(
      null,
    );

  const [viewData, setViewData] =
    useState<unknown>(null);

  const [loadingView, setLoadingView] =
    useState(false);


  /* =======================================================
   * Metadata
   * ===================================================== */

  const loadMetadata =
    useCallback(async () => {
      try {
        const entries =
          await Promise.all(
            DATA_ITEMS.map(
              async item => {
                const result =
                  await dataService.getMetadata(
                    item.type,
                  );

                return [
                  item.type,
                  result?.updatedAt ?? null,
                ] as const;
              },
            ),
          );

        setMetadata(
          Object.fromEntries(entries),
        );
      } catch (error) {
        console.error(
          "Unable to load metadata:",
          error,
        );
      }
    }, []);


  useEffect(() => {
    void loadMetadata();
  }, [loadMetadata]);


  /* =======================================================
   * Upload
   * ===================================================== */

  const handleFileChange = async (
    type: PerformanceDataType,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (
      !file.name
        .toLowerCase()
        .endsWith(".json")
    ) {
      setError(
        "Please select a JSON file.",
      );
      return;
    }

    setUploading(type);
    setSuccess(null);
    setError("");

    try {
      const text =
        await file.text();

      const data: unknown =
        JSON.parse(text);

      // Validate before writing to Firestore
      validatePerformanceData(
        type,
        data,
      );

      await saveData(
        type,
        data,
      );

      setSuccess(type);

      // Refresh updatedAt
      await loadMetadata();

      // If currently viewing this dataset,
      // refresh the view as well.
      if (viewing === type) {
        setViewData(data);
      }
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update performance data.",
      );
    } finally {
      setUploading(null);
    }
  };


  /* =======================================================
   * View
   * ===================================================== */

  const handleView = async (
    type: PerformanceDataType,
  ) => {
    if (viewing === type) {
      setViewing(null);
      setViewData(null);
      return;
    }

    setViewing(type);
    setViewData(null);
    setLoadingView(true);
    setError("");

    try {
      const data =
        await getData(type);

      setViewData(data);
    } catch (error) {
      console.error(error);

      setViewing(null);

      setError(
        "Unable to load performance data.",
      );
    } finally {
      setLoadingView(false);
    }
  };


  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#C9A15C]">
          Admin
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#EDEAE1]">
          Performance Data
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#8B92A6]">
          Manage the performance data used
          throughout Profounda. Uploading a
          JSON file replaces the corresponding
          dataset in Firestore.
        </p>
      </div>


      {/* Error */}
      {error && (
        <div className="mt-8 rounded-lg border border-[#C1614F]/30 bg-[#C1614F]/10 px-4 py-3 text-sm text-[#D98070]">
          {error}
        </div>
      )}


      {/* Data cards */}
      <div className="mt-10 space-y-4">
        {DATA_ITEMS.map(item => {
          const isUploading =
            uploading === item.type;

          const isSuccess =
            success === item.type;

          const isViewing =
            viewing === item.type;

          const updatedAt =
            metadata[item.type];

          return (
            <div
              key={item.type}
              className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#101521]"
            >
              <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
                {/* Info */}
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-medium text-[#EDEAE1]">
                      {item.title}
                    </h2>

                    {isSuccess && (
                      <span className="text-xs font-medium text-[#7FA37A]">
                        ✓ Updated
                      </span>
                    )}
                  </div>

                  <p className="mt-1 font-mono text-xs text-[#C9A15C]">
                    {item.filename}
                  </p>

                  <p className="mt-2 text-sm text-[#6F768A]">
                    {item.description}
                  </p>

                  <p className="mt-2 text-xs text-[#5A6178]">
                    Last updated:{" "}
                    {updatedAt
                      ? formatDate(updatedAt)
                      : "Not uploaded"}
                  </p>
                </div>


                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleView(
                        item.type,
                      )
                    }
                    className="cursor-pointer rounded-lg border border-white/[0.1] px-4 py-2 text-sm font-medium text-[#A8AEBE] transition hover:bg-white/[0.05] hover:text-[#EDEAE1]"
                  >
                    {isViewing
                      ? "Hide"
                      : "View"}
                  </button>

                  <label
                    className={[
                      "inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium transition",
                      isUploading
                        ? "cursor-not-allowed border-white/[0.08] text-[#5A6178]"
                        : "cursor-pointer border-[#C9A15C]/30 text-[#E4BC7A] hover:bg-[#C9A15C]/10",
                    ].join(" ")}
                  >
                    {isUploading
                      ? "Uploading..."
                      : "Replace JSON"}

                    <input
                      type="file"
                      accept=".json,application/json"
                      disabled={
                        isUploading
                      }
                      onChange={event =>
                        handleFileChange(
                          item.type,
                          event,
                        )
                      }
                      className="hidden"
                    />
                  </label>
                </div>
              </div>


              {/* JSON View */}
              {isViewing && (
                <div className="border-t border-white/[0.08] bg-[#0B0F1A] p-5">
                  {loadingView ? (
                    <p className="text-sm text-[#5A6178]">
                      Loading...
                    </p>
                  ) : viewData === null ? (
                    <p className="text-sm text-[#5A6178]">
                      No data uploaded.
                    </p>
                  ) : (
                    <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-6 text-[#A8AEBE]">
                      {JSON.stringify(
                        viewData,
                        null,
                        2,
                      )}
                    </pre>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>


      {/* Warning */}
      <div className="mt-8 rounded-lg border border-[#C9A15C]/15 bg-[#C9A15C]/[0.04] px-5 py-4">
        <p className="text-sm text-[#8B92A6]">
          Replacing a dataset takes effect
          immediately. Make sure the JSON file
          contains the correct data before
          uploading it.
        </p>
      </div>
    </div>
  );
}


/* =========================================================
 * Read
 * ======================================================= */

async function getData(
  type: PerformanceDataType,
): Promise<unknown> {
  switch (type) {
    case "headline":
      return dataService.getHeadline();

    case "holdings":
      return dataService.getHoldings();

    case "signal":
      return dataService.getSignal();

    case "rebalance_log":
      return dataService.getRebalanceLog();

    case "equity_curve_live":
      return dataService.getEquityCurveLive();

    case "equity_curve_backtest":
      return dataService.getEquityCurveBacktest();
  }
}


/* =========================================================
 * Save
 * ======================================================= */

async function saveData(
  type: PerformanceDataType,
  data: unknown,
): Promise<void> {
  switch (type) {
    case "headline":
      await dataService.setHeadline(
        data as HeadlineData,
      );
      return;

    case "holdings":
      await dataService.setHoldings(
        data as HoldingsData,
      );
      return;

    case "signal":
      await dataService.setSignal(
        data as SignalData,
      );
      return;

    case "rebalance_log":
      await dataService.setRebalanceLog(
        data as RebalanceEntry[],
      );
      return;

    case "equity_curve_live":
      await dataService.setEquityCurveLive(
        data as EquityCurvePoint[],
      );
      return;

    case "equity_curve_backtest":
      await dataService.setEquityCurveBacktest(
        data as EquityCurvePoint[],
      );
      return;
  }
}


/* =========================================================
 * Formatting
 * ======================================================= */

function formatDate(
  date: Date,
): string {
  return date.toLocaleString();
}