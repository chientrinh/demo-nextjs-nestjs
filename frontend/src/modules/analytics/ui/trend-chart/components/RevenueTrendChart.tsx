"use client";

import type { ApexOptions } from "apexcharts";
import type ApexCharts from "apexcharts";
import dynamic from "next/dynamic";
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  forwardRef,
} from "react";

import { useTheme } from "@/shared/providers/theme-provider";
import { formatCompactVnd, formatVnd } from "@/modules/shared";
import type { TrendEvent, WeeklyTrendDay } from "../../../domain/types";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export type RevenueTrendChartRef = {
  exportPng: () => Promise<void>;
};

type RevenueTrendChartProps = {
  weekStart: string;
  days: WeeklyTrendDay[];
  prevDays?: WeeklyTrendDay[];
  events: TrendEvent[];
  showPos?: boolean;
  showEatclub?: boolean;
  showLabour?: boolean;
  isCompare?: boolean;
  loading?: boolean;
};

// Default fallback values matching docs/design/home.html & docs/design/home_compare.html
const DEFAULT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DEFAULT_POS = [1720, 1820, 1820, 2030, 1980, 2360, 2400];
const DEFAULT_EATCLUB = [520, 380, 380, 420, 360, 780, 440];
const DEFAULT_LABOUR = [680, 650, 920, 740, 660, 940, 1220];

// Previous period mock matching docs/design/home_compare.html
const DEFAULT_PREV_POS = [1640, 1540, 1620, 1510, 1640, 2050, 2030];
const DEFAULT_PREV_EATCLUB = [480, 360, 380, 340, 360, 700, 420];
const DEFAULT_PREV_LABOUR = [640, 540, 800, 550, 600, 800, 1050];

export const RevenueTrendChart = forwardRef<RevenueTrendChartRef, RevenueTrendChartProps>(
  (
    {
      weekStart,
      days,
      prevDays,
      showPos = true,
      showEatclub = true,
      showLabour = true,
      isCompare = false,
      loading = false,
    },
    ref,
  ) => {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const chartInstanceRef = useRef<ApexCharts | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    type IconPos = { cx: number; cy: number };
    const [iconPositions, setIconPositions] = useState<{
      drop: IconPos | null;
      gain: IconPos | null;
    }>({ drop: null, gain: null });

    const hasLiveData =
      days && days.length === 7 && days.some((d) => d.posRevenue > 0 || d.eatclubRevenue > 0);
    const hasPrevLiveData =
      prevDays && prevDays.length === 7 && prevDays.some((d) => d.posRevenue > 0 || d.eatclubRevenue > 0);

    const categories = DEFAULT_DAYS;

    const posData = useMemo(
      () => (hasLiveData ? days.map((d) => d.posRevenue) : DEFAULT_POS),
      [hasLiveData, days],
    );

    const eatclubData = useMemo(
      () => (hasLiveData ? days.map((d) => d.eatclubRevenue) : DEFAULT_EATCLUB),
      [hasLiveData, days],
    );

    const labourData = useMemo(
      () => (hasLiveData ? days.map((d) => d.labourCost) : DEFAULT_LABOUR),
      [hasLiveData, days],
    );

    const prevPosData = useMemo(
      () => (hasPrevLiveData ? prevDays.map((d) => d.posRevenue) : DEFAULT_PREV_POS),
      [hasPrevLiveData, prevDays],
    );

    const prevEatclubData = useMemo(
      () => (hasPrevLiveData ? prevDays.map((d) => d.eatclubRevenue) : DEFAULT_PREV_EATCLUB),
      [hasPrevLiveData, prevDays],
    );

    const prevLabourData = useMemo(
      () => (hasPrevLiveData ? prevDays.map((d) => d.labourCost) : DEFAULT_PREV_LABOUR),
      [hasPrevLiveData, prevDays],
    );

    useImperativeHandle(ref, () => ({
      exportPng: async () => {
        if (!chartInstanceRef.current) return;
        try {
          const result = await chartInstanceRef.current.dataURI();
          const imgURI = "imgURI" in result ? result.imgURI : "";
          if (!imgURI) return;
          const link = document.createElement("a");
          link.href = imgURI;
          link.download = `xu-huong-doanh-thu-${weekStart}${isCompare ? "-vs-truoc" : ""}.png`;
          link.click();
        } catch {
          // Fallback export if dataURI is unavailable
        }
      },
    }));

    // ApexCharts grouped-stacked-column series
    const { series, colors } = useMemo(() => {
      const s: { name: string; group: string; data: number[] }[] = [];
      const c: string[] = [];

      if (!isCompare) {
        if (showPos) {
          s.push({
            name: "POS Revenue",
            group: "revenue",
            data: posData,
          });
          c.push("#27272A");
        }
        if (showEatclub) {
          s.push({
            name: "Eatclub Revenue",
            group: "revenue",
            data: eatclubData,
          });
          c.push("#525FE1");
        }
        if (showLabour) {
          s.push({
            name: "Labour Costs",
            group: "labour",
            data: labourData,
          });
          c.push("#EA580C");
        }
      } else {
        // Current Period Series
        if (showPos) {
          s.push({
            name: "POS Revenue (Current)",
            group: "current_revenue",
            data: posData,
          });
          c.push("#27272A");
        }
        if (showEatclub) {
          s.push({
            name: "Eatclub Revenue (Current)",
            group: "current_revenue",
            data: eatclubData,
          });
          c.push("#525FE1");
        }
        if (showLabour) {
          s.push({
            name: "Labour Costs (Current)",
            group: "current_labour",
            data: labourData,
          });
          c.push("#EA580C");
        }

        // Previous Period Series matching docs/design/home_compare.html
        if (showPos) {
          s.push({
            name: "Direct Revenue (Previous)",
            group: "prev_revenue",
            data: prevPosData,
          });
          c.push("#9CA3AF");
        }
        if (showEatclub) {
          s.push({
            name: "Total Revenue (Previous)",
            group: "prev_revenue",
            data: prevEatclubData,
          });
          c.push("#C7D2FE");
        }
        if (showLabour) {
          s.push({
            name: "Labour Costs (Previous)",
            group: "prev_labour",
            data: prevLabourData,
          });
          c.push("#FED7AA");
        }
      }

      return { series: s, colors: c };
    }, [
      isCompare,
      showPos,
      showEatclub,
      showLabour,
      posData,
      eatclubData,
      labourData,
      prevPosData,
      prevEatclubData,
      prevLabourData,
    ]);
    // Compute which day index is the biggest drop/gain for compare mode
    const compareTargets = useMemo(() => {
      if (!isCompare) return { dropIdx: 4, gainIdx: 5 };
      const deltas = posData.map((pos, i) => {
        const curr = pos + eatclubData[i];
        const prev = prevPosData[i] + prevEatclubData[i];
        return prev > 0 ? ((curr - prev) / prev) * 100 : 0;
      });
      let dropIdx = 0;
      let gainIdx = 0;
      deltas.forEach((d, i) => {
        if (d < deltas[dropIdx]) dropIdx = i;
        if (d > deltas[gainIdx]) gainIdx = i;
      });
      return { dropIdx, gainIdx };
    }, [isCompare, posData, eatclubData, prevPosData, prevEatclubData]);

    // Read actual SVG bar positions after chart renders
    const readIconPositions = useCallback(() => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const cRect = container.getBoundingClientRect();

      // The topmost stacked series: Eatclub Revenue (or Total Revenue for prev period)
      const topSeriesSelector = isCompare
        ? '.apexcharts-series[seriesName*="Eatclub"][seriesName*="Current"]'
        : '.apexcharts-series[seriesName*="Eatclub"]';

      const topSeries = container.querySelector(topSeriesSelector);
      if (!topSeries) return;

      const paths = topSeries.querySelectorAll<SVGPathElement>("path");
      if (paths.length < 7) return;

      const getPos = (idx: number): IconPos | null => {
        const path = paths[idx];
        if (!path) return null;
        const r = path.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return null;
        return {
          cx: r.left + r.width / 2 - cRect.left,   // center-x of bar
          cy: r.top - cRect.top - 28,               // 28px above bar top (icon height + 4px gap)
        };
      };

      const { dropIdx, gainIdx } = compareTargets;
      setIconPositions({
        drop: getPos(isCompare ? dropIdx : 4),
        gain: getPos(isCompare ? gainIdx : 5),
      });
    }, [isCompare, compareTargets]);

    const options: ApexOptions = useMemo(
      () => ({
        chart: {
          type: "bar",
          height: 360,
          width: "100%",
          stacked: true,
          fontFamily: "inherit",
          toolbar: { show: false },
          background: "transparent",
          events: {
            mounted: (chart) => {
              chartInstanceRef.current = chart;
              setTimeout(readIconPositions, 150);
            },
            updated: (chart) => {
              chartInstanceRef.current = chart;
              setTimeout(readIconPositions, 150);
            },
            animationEnd: () => {
              readIconPositions();
            },
          },
        },
        colors,
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: isCompare ? "72%" : "68%",
            borderRadius: 0,
          },
        },
        stroke: {
          show: false,
          width: 0,
        },
        dataLabels: {
          enabled: false,
        },
        legend: {
          show: false, // Using the custom legend in DashboardView matching home.html
        },
        grid: {
          borderColor: isDark ? "#374151" : "#E5E7EB",
          strokeDashArray: 4,
          xaxis: {
            lines: {
              show: false,
            },
          },
          yaxis: {
            lines: {
              show: true,
            },
          },
        },
        xaxis: {
          categories,
          axisBorder: { show: false },
          axisTicks: { show: false },
          labels: {
            style: {
              colors: isDark ? "#9ca3af" : "#6B7280",
              fontSize: "13px",
              fontWeight: 400,
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: isDark ? "#9ca3af" : "#9CA3AF",
              fontSize: "12px",
            },
            formatter: (val: number) => {
              if (hasLiveData) return formatCompactVnd(val);
              if (val >= 1000) return `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 2)}k`;
              return `${val}k`;
            },
          },
        },
        tooltip: {
          theme: isDark ? "dark" : "light",
          shared: true,
          intersect: false,
          y: {
            formatter: (val: number) => {
              if (val == null) return "";
              return hasLiveData ? formatVnd(val) : `$${val.toLocaleString()}`;
            },
          },
        },
        annotations: {
          // Annotation markers only — labels replaced by HTML icon overlays
          points: isCompare
            ? []
            : [
              {
                x: "Fri",
                y: hasLiveData ? undefined : 2340,
                marker: {
                  size: 0, // marker hidden; icon overlay handles the visual
                },
              },
              {
                x: "Sat",
                y: hasLiveData ? undefined : 3140,
                marker: {
                  size: 0,
                },
              },
            ],
        },
      }),
      [categories, colors, hasLiveData, isDark, isCompare, readIconPositions],
    );

    // Re-read icon positions whenever data or mode changes
    useEffect(() => {
      const timer = setTimeout(readIconPositions, 200);
      return () => clearTimeout(timer);
    }, [series, isCompare, readIconPositions]);

    return (
      <div
        ref={containerRef}
        className={[
          "relative w-full max-w-full min-w-0 overflow-hidden",
          isCompare ? "trend-chart-compare" : "trend-chart-no-compare",
          showPos ? "has-pos" : "",
          showEatclub ? "has-eatclub" : "",
        ].join(" ")}
      >
        <style>{`
          /* ── Horizontal 4px gap between Revenue and Labour columns ── */
          .trend-chart-no-compare .apexcharts-series[seriesName*="Revenue"] path {
            transform: translateX(-2px);
          }
          .trend-chart-no-compare .apexcharts-series[seriesName*="Labour"] path {
            transform: translateX(2px);
          }
          .trend-chart-compare .apexcharts-series[seriesName*="Current"]:not([seriesName*="Labour"]) path {
            transform: translateX(-4px);
          }
          .trend-chart-compare .apexcharts-series[seriesName*="Current"][seriesName*="Labour"] path {
            transform: translateX(-2px);
          }
          .trend-chart-compare .apexcharts-series[seriesName*="Previous"]:not([seriesName*="Labour"]) path {
            transform: translateX(2px);
          }
          .trend-chart-compare .apexcharts-series[seriesName*="Previous"][seriesName*="Labour"] path {
            transform: translateX(4px);
          }

          /*
           * ── Corner rounding: Eatclub (top) + POS (bottom) = one unified block ──
           *
           * Case 1 — BOTH visible: Eatclub rounds top, POS rounds bottom.
           * Case 2 — Only Eatclub: it stands alone → round all 4 corners.
           * Case 3 — Only POS: it stands alone → round all 4 corners.
           */

          /* Case 1: both present – Eatclub only rounds top */
          .has-pos.has-eatclub .apexcharts-series[seriesName*="Eatclub"] path,
          .has-pos.has-eatclub .apexcharts-series[seriesName*="Total"] path {
            clip-path: inset(0 0 0 0 round 4px 4px 0 0);
          }

          /* Case 1: both present – POS only rounds bottom */
          .has-pos.has-eatclub .apexcharts-series[seriesName*="POS"] path,
          .has-pos.has-eatclub .apexcharts-series[seriesName*="Direct"] path {
            clip-path: inset(0 0 0 0 round 0 0 4px 4px);
          }

          /* Case 2: only Eatclub visible – round all 4 corners */
          .has-eatclub:not(.has-pos) .apexcharts-series[seriesName*="Eatclub"] path,
          .has-eatclub:not(.has-pos) .apexcharts-series[seriesName*="Total"] path {
            clip-path: inset(0 0 0 0 round 4px 4px 4px 4px);
          }

          /* Case 3: only POS visible – round all 4 corners */
          .has-pos:not(.has-eatclub) .apexcharts-series[seriesName*="POS"] path,
          .has-pos:not(.has-eatclub) .apexcharts-series[seriesName*="Direct"] path {
            clip-path: inset(0 0 0 0 round 4px 4px 4px 4px);
          }

          /* Labour Costs: standalone column → round all 4 corners */
          .apexcharts-series[seriesName*="Labour"] path {
            clip-path: inset(0 0 0 0 round 4px 4px 4px 4px);
          }
        `}</style>
        {loading ? (
          <div className="h-[360px] w-full animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
        ) : (
          <>
            <Chart options={options} series={series} type="bar" height={360} width="100%" />

            {/* Trend icon overlays: drop (red) + gain (green) — compare mode only */}
            {isCompare && (iconPositions.drop || iconPositions.gain) && (
              <div className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
                {iconPositions.drop && (
                  <div
                    className="absolute flex items-center justify-center"
                    style={{
                      left: `${iconPositions.drop.cx}px`,
                      top: `${iconPositions.drop.cy}px`,
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#FFF1F2] border border-[#FECDD3] flex items-center justify-center text-[#E11D48] shadow-sm">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M23 18l-9.5-9.5-5 5L1 6m22 12h-6m6 0v-6" />
                      </svg>
                    </div>
                  </div>
                )}
                {iconPositions.gain && (
                  <div
                    className="absolute flex items-center justify-center"
                    style={{
                      left: `${iconPositions.gain.cx}px`,
                      top: `${iconPositions.gain.cy}px`,
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#16A34A] shadow-sm">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M23 6l-9.5 9.5-5-5L1 18m22-12h-6m6 0v6" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  },
);

RevenueTrendChart.displayName = "RevenueTrendChart";

export default RevenueTrendChart;
