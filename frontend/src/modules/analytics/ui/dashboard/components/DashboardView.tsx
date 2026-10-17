"use client";

import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

import { addDays, startOfWeek, todayKey } from "@/shared/utils/time";
import { formatNumber, formatUsd } from "@/modules/shared";
import { useSummary } from "../hooks/use-summary";
import { useWeeklyTrend } from "../hooks/use-weekly-trend";
import {
  RevenueTrendChart,
  type RevenueTrendChartRef,
} from "../../trend-chart/components/RevenueTrendChart";

export const DashboardView: React.FC = () => {
  const searchParams = useSearchParams();
  const weekStart = startOfWeek(searchParams.get("week") ?? todayKey());
  const weekEnd = addDays(weekStart, 6);

  const prevWeekStart = addDays(weekStart, -7);
  const prevWeekEnd = addDays(prevWeekStart, 6);

  const summary = useSummary(weekStart, weekEnd);
  const trend = useWeeklyTrend(weekStart);
  const prevSummary = useSummary(prevWeekStart, prevWeekEnd);
  const prevTrend = useWeeklyTrend(prevWeekStart);

  const [showPos, setShowPos] = useState(true);
  const [showEatclub, setShowEatclub] = useState(true);
  const [showLabour, setShowLabour] = useState(true);
  const [isCompare, setIsCompare] = useState(false);

  const chartRef = useRef<RevenueTrendChartRef>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const handleToggleCompare = () => {
    setIsCompare((prev) => !prev);
  };

  const handleExportPng = async () => {
    const el = chartContainerRef.current;
    if (!el) return;
    try {
      const { toPng } = await import("html-to-image");
      const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
      const dataUrl = await toPng(el, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: isDark ? "#111827" : "#ffffff",
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `xu-huong-doanh-thu-${weekStart}${isCompare ? "-vs-truoc" : ""}.png`;
      link.click();
    } catch {
      chartRef.current?.exportPng();
    }
  };

  // KPI Data & Deltas matching docs/design/home.html & docs/design/home_compare.html
  const hasLiveSummary = !!(summary.data && summary.data.totalRevenue > 0);

  const revKpi = (() => {
    if (hasLiveSummary) {
      const cur = summary.data?.totalRevenue ?? 0;
      const prev = prevSummary.data?.totalRevenue ?? 0;
      let delta = null;
      if (isCompare && prev > 0) {
        const pct = ((cur - prev) / prev) * 100;
        delta = {
          prefix: `vs ${formatUsd(prev)}`,
          pct: `(${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%)`,
          isPositive: pct >= 0,
        };
      }
      return { value: formatUsd(cur), delta };
    }
    return {
      value: isCompare ? "$16,469" : "$16,110",
      delta: isCompare ? { prefix: "vs $15,126", pct: "(+8.9%)", isPositive: true } : null,
    };
  })();

  const avgKpi = (() => {
    if (hasLiveSummary) {
      const cur = summary.data?.averagePerDay ?? 0;
      const prev = prevSummary.data?.averagePerDay ?? 0;
      let delta = null;
      if (isCompare && prev > 0) {
        const pct = ((cur - prev) / prev) * 100;
        delta = {
          prefix: `vs ${formatUsd(prev)}`,
          pct: `(${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%)`,
          isPositive: pct >= 0,
        };
      }
      return { value: formatUsd(cur), delta };
    }
    return {
      value: isCompare ? "$2,353" : "$2,301",
      delta: isCompare ? { prefix: "vs $2,161", pct: "(+8.9%)", isPositive: true } : null,
    };
  })();

  const covKpi = (() => {
    if (hasLiveSummary) {
      const cur = summary.data?.totalCovers ?? 0;
      const prev = prevSummary.data?.totalCovers ?? 0;
      let delta = null;
      if (isCompare && prev > 0) {
        const pct = ((cur - prev) / prev) * 100;
        delta = {
          prefix: `vs ${formatNumber(prev)}`,
          pct: `(${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%)`,
          isPositive: pct >= 0,
        };
      }
      return { value: formatNumber(cur), delta };
    }
    return {
      value: isCompare ? "911" : "905",
      delta: isCompare ? { prefix: "vs 837", pct: "(+8.8%)", isPositive: true } : null,
    };
  })();

  return (
    <div className="w-full max-w-[1400px] mx-auto min-w-0">
      <div className="bg-white rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 p-5 sm:p-8 md:p-10 dark:bg-gray-900/60 dark:border-gray-800 w-full max-w-full overflow-hidden min-w-0">
        {/* Top Header Row */}
        <div className="flex gap-4">
          <h1 className="flex-3 min-w-0 text-[22px] font-bold text-[#111827] tracking-tight font-headline-md leading-tight dark:text-white">
            {isCompare
              ? "This Week's Revenue Trend vs Previous Period"
              : "This Week's Revenue Trend"}
          </h1>
          <div className="flex-7 min-w-0 flex flex-wrap items-start justify-start gap-x-3 gap-y-2">
            {/* POS Revenue Toggle */}
            <div
              onClick={() => setShowPos(!showPos)}
              className="flex items-center gap-1.5 cursor-pointer select-none text-[13px] text-gray-800 font-medium dark:text-gray-200"
            >
              <div
                className={`w-4 h-4 rounded ${showPos
                  ? "bg-[#27272A] text-white"
                  : "border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600"
                  } flex items-center justify-center transition-colors`}
              >
                {showPos && (
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
              <span className="w-3 h-[2.5px] bg-[#27272A] rounded-full"></span>
              <span>POS Revenue</span>
            </div>

            {/* Eatclub Revenue Toggle */}
            <div
              onClick={() => setShowEatclub(!showEatclub)}
              className="flex items-center gap-1.5 cursor-pointer select-none text-[13px] text-gray-800 font-medium dark:text-gray-200"
            >
              <div
                className={`w-4 h-4 rounded ${showEatclub
                  ? "bg-[#27272A] text-white"
                  : "border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600"
                  } flex items-center justify-center transition-colors`}
              >
                {showEatclub && (
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
              <span className="w-3 h-[2.5px] bg-[#525FE1] rounded-full"></span>
              <span>Eatclub Revenue</span>
            </div>

            {/* Labour Costs Toggle */}
            <div
              onClick={() => setShowLabour(!showLabour)}
              className="flex items-center gap-1.5 cursor-pointer select-none text-[13px] text-gray-800 font-medium dark:text-gray-200"
            >
              <div
                className={`w-4 h-4 rounded ${showLabour
                  ? "bg-[#27272A] text-white"
                  : "border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600"
                  } flex items-center justify-center transition-colors`}
              >
                {showLabour && (
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
              <span className="w-3 h-[2.5px] bg-[#EA580C] rounded-full"></span>
              <span>Labour Costs</span>
            </div>

            {/* Compare to Previous Button */}
            <button
              type="button"
              onClick={handleToggleCompare}
              className={`inline-flex relative -top-1.25 items-center gap-1.5 px-3 py-1 rounded-2xl font-medium text-[13px] transition-all cursor-pointer shadow-sm ${isCompare
                ? "bg-[#27272A] text-white dark:bg-white dark:text-gray-900"
                : "bg-yellow-400 border border-[#E5E7EB] hover:bg-orange-200 text-[#374151] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 19h4V9H4v10zm6 0h4V5h-4v14zm6 0h4v-7h-4v7z"></path>
              </svg>
              <span>Compare to Previous</span>
            </button>

            {/* Export PNG Button */}
            <button
              type="button"
              onClick={handleExportPng}
              className="inline-flex relative -top-1.25 items-center gap-1.5 px-3 py-1 rounded-2xl bg-white border border-[#E5E7EB] hover:bg-gray-50 text-[#374151] font-medium text-[13px] transition-colors cursor-pointer dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <svg
                className="w-3.5 h-3.5 stroke-current fill-none"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"></path>
              </svg>
              <span>Export PNG</span>
            </button>
          </div>
        </div>

        {/* Export Container: KPI Row (3 Cards) + Chart + Legend */}
        <div ref={chartContainerRef} className="w-full bg-white dark:bg-gray-900 rounded-2xl pt-2 pb-6">
          {/* KPI Row (3 Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-4">
            <div className="bg-[#f9f6f5] rounded-2xl p-6 dark:bg-gray-800/50">
              <span className="text-[14px] font-normal text-gray-600 block mb-1 dark:text-gray-400">
                Total Revenue
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-xl font-bold text-gray-900 tracking-tight dark:text-white">
                  {revKpi.value}
                </span>
                {revKpi.delta && (
                  <span className="text-[13px] text-gray-900 dark:text-gray-100">
                    {revKpi.delta.prefix}{" "}
                    <span
                      className={`font-semibold ${revKpi.delta.isPositive ? "text-[#16A34A]" : "text-[#E11D48]"}`}
                    >
                      {revKpi.delta.pct}
                    </span>
                  </span>
                )}
              </div>
            </div>
            <div className="bg-[#f9f6f5] rounded-2xl p-6 dark:bg-gray-800/50">
              <span className="text-[14px] font-normal text-gray-600 block mb-1 dark:text-gray-400">
                Average per Day
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-xl font-bold text-gray-900 tracking-tight dark:text-white">
                  {avgKpi.value}
                </span>
                {avgKpi.delta && (
                  <span className="text-[13px] text-gray-900 dark:text-gray-100">
                    {avgKpi.delta.prefix}{" "}
                    <span
                      className={`font-semibold ${avgKpi.delta.isPositive ? "text-[#16A34A]" : "text-[#E11D48]"}`}
                    >
                      {avgKpi.delta.pct}
                    </span>
                  </span>
                )}
              </div>
            </div>
            <div className="bg-[#f9f6f5] rounded-2xl p-6 dark:bg-gray-800/50">
              <span className="text-[14px] font-normal text-gray-600 block mb-1 dark:text-gray-400">
                Total Covers
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-xl font-bold text-gray-900 tracking-tight dark:text-white">
                  {covKpi.value}
                </span>
                {covKpi.delta && (
                  <span className="text-[13px] text-gray-900 dark:text-gray-100">
                    {covKpi.delta.prefix}{" "}
                    <span
                      className={`font-semibold ${covKpi.delta.isPositive ? "text-[#16A34A]" : "text-[#E11D48]"}`}
                    >
                      {covKpi.delta.pct}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="relative w-full max-w-full min-w-0 overflow-hidden pt-6 pb-2">
            <RevenueTrendChart
              ref={chartRef}
              weekStart={weekStart}
              days={trend.data?.days ?? []}
              prevDays={prevTrend.data?.days ?? []}
              events={trend.data?.events ?? []}
              showPos={showPos}
              showEatclub={showEatclub}
              showLabour={showLabour}
              isCompare={isCompare}
              loading={trend.isLoading || (isCompare && prevTrend.isLoading)}
            />
          </div>

          {/* Bottom Legend matching docs/design/home.html & docs/design/home_compare.html */}
          {isCompare ? (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[13px] text-gray-700 font-medium dark:text-gray-300">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#27272A]"></span>
                <span>POS Revenue (Current)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#525FE1]"></span>
                <span>Eatclub Revenue (Current)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]"></span>
                <span>Labour Costs (Current)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#9CA3AF]"></span>
                <span>Direct Revenue (Previous)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C7D2FE]"></span>
                <span>Total Revenue (Previous)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FED7AA]"></span>
                <span>Labour Costs (Previous)</span>
              </div>
              <div className="h-4 w-px bg-gray-300 mx-1 dark:bg-gray-700"></div>
              <div className="flex items-center gap-2 text-[#16A34A]">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M23 6l-9.5 9.5-5-5L1 18m22-12h-6m6 0v6"></path>
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Positive Event Impact</span>
              </div>
              <div className="flex items-center gap-2 text-[#E11D48]">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M23 18l-9.5-9.5-5 5L1 6m22 12h-6m6 0v-6"></path>
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Negative Event Impact</span>
              </div>
            </div>
          ) : (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[14px] text-gray-700 font-medium dark:text-gray-300">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-[#27272A]"></span>
                <span>POS Revenue</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-[#525FE1]"></span>
                <span>Eatclub Revenue</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-[#EA580C]"></span>
                <span>Labour Costs</span>
              </div>
              <div className="h-4 w-px bg-gray-300 mx-1 dark:bg-gray-700"></div>
              <div className="flex items-center gap-2 text-[#16A34A]">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M23 6l-9.5 9.5-5-5L1 18m22-12h-6m6 0v6"></path>
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Positive Event Impact</span>
              </div>
              <div className="flex items-center gap-2 text-[#E11D48]">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M23 18l-9.5-9.5-5 5L1 6m22 12h-6m6 0v-6"></path>
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Negative Event Impact</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
