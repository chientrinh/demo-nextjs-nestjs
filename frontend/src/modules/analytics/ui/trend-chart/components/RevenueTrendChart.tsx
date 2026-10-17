"use client";

import type { ApexAnnotations, ApexOptions } from "apexcharts";
import type ApexCharts from "apexcharts";
import dynamic from "next/dynamic";
import React, {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  forwardRef,
} from "react";

import { useTheme } from "@/shared/providers/theme-provider";
import { formatCompactUsd, formatUsd } from "@/modules/shared";
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

const DEFAULT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DEFAULT_POS = [0, 0, 0, 0, 0, 0, 0];
const DEFAULT_EATCLUB = [0, 0, 0, 0, 0, 0, 0];
const DEFAULT_LABOUR = [0, 0, 0, 0, 0, 0, 0];

const DEFAULT_PREV_POS = [0, 0, 0, 0, 0, 0, 0];
const DEFAULT_PREV_EATCLUB = [0, 0, 0, 0, 0, 0, 0];
const DEFAULT_PREV_LABOUR = [0, 0, 0, 0, 0, 0, 0];

const TREND_ICON_SVG = {
  gain: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#F0FDF4" stroke="#BBF7D0" stroke-width="1.5"/><g transform="translate(4.5, 4.5) scale(0.625)"><path d="M23 6l-9.5 9.5-5-5L1 18m22-12h-6m6 0v6" fill="none" stroke="#16A34A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`,
  drop: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#FFF1F2" stroke="#FECDD3" stroke-width="1.5"/><g transform="translate(4.5, 4.5) scale(0.625)"><path d="M23 18l-9.5-9.5-5 5L1 6m22 12h-6m6 0v-6" fill="none" stroke="#E11D48" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`,
} as const;

const trendIconDataUri = (type: "gain" | "drop") =>
  `data:image/svg+xml;utf8,${encodeURIComponent(TREND_ICON_SVG[type])}`;

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
    const containerRef = useRef<HTMLDivElement | null>(null);
    // Plot-area width, read off the ApexCharts instance after render, used to
    // centre the per-day impact icons over the revenue column instead of the
    // group centre. This bundle never calls `chart.events.mounted/updated`, so
    // the instance is captured via react-apexcharts' `chartRef` prop and polled
    // until the chart has measured itself.
    const [gridWidth, setGridWidth] = useState(0);

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
    // Per-day impact badge: green when the day's revenue-minus-cost beats the
    // same weekday last week, red otherwise. Rendered straight through
    // ApexCharts point annotations. `marker.size = 0` alone still paints the
    // default 2px marker stroke, which showed up as mystery dots on the column
    // tops — so `strokeWidth` must be zeroed too. The badge itself comes from
    // the `image` data URI.
    const annotationPoints = useMemo<NonNullable<ApexAnnotations["points"]>>(() => {
      const xDivision = gridWidth / categories.length;
      // The group's first (revenue) column sits left of the group centre at a
      // fixed fraction of one slot: -0.17 of a slot for the 2-group layout
      // (68% columnWidth) and -0.27 for the 4-group compare layout (72%).
      // The <style> block below nudges the revenue bars with a CSS
      // translateX(-2px | -4px), which the annotation coordinate space does not
      // include, so fold that shift in to land on the column's visual centre.
      const columnOffset = isCompare ? -0.27 : -0.17;
      const cssShift = isCompare ? -4 : -2;

      return categories.map((day, dayIdx) => {
        const currentProfit = posData[dayIdx] + eatclubData[dayIdx] - labourData[dayIdx];
        const previousProfit =
          prevPosData[dayIdx] + prevEatclubData[dayIdx] - prevLabourData[dayIdx];
        const type: "gain" | "drop" = currentProfit > previousProfit ? "gain" : "drop";
        const topOfColumn =
          (showPos ? posData[dayIdx] : 0) + (showEatclub ? eatclubData[dayIdx] : 0);

        return {
          x: day,
          y: topOfColumn,
          marker: { size: 0, strokeWidth: 0 },
          image: {
            path: trendIconDataUri(type),
            width: 24,
            height: 24,
            offsetX: columnOffset * xDivision + cssShift,
            offsetY: -16,
          },
        };
      });
    }, [
      gridWidth,
      isCompare,
      categories,
      posData,
      eatclubData,
      labourData,
      prevPosData,
      prevEatclubData,
      prevLabourData,
      showPos,
      showEatclub,
    ]);

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
              if (hasLiveData) return formatCompactUsd(val);
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
              return formatUsd(val);
            },
          },
        },
        annotations: {
          points: annotationPoints,
        },
      }),
      [
        annotationPoints,
        categories,
        colors,
        hasLiveData,
        isDark,
        isCompare,
      ],
    );

    // Keep `gridWidth` in step with the rendered plot area. There is no chart
    // event to hook here (see note above), so poll on the next frame until the
    // instance exposes its layout, and re-read on container resize.
    useEffect(() => {
      const read = () => {
        const ctx = chartInstanceRef.current as unknown as
          | { w?: { layout?: { gridWidth?: number } } }
          | null;
        const gw = ctx?.w?.layout?.gridWidth;
        if (typeof gw === "number" && gw > 0) {
          setGridWidth((prev) => (prev === gw ? prev : gw));
          return true;
        }
        return false;
      };

      let raf = 0;
      let tries = 0;
      const poll = () => {
        // ~2s of frames: enough for the chart to measure itself, but bounded so
        // a placeholder (chart not yet mounted) cannot spin forever.
        if (!read() && tries++ < 120) raf = requestAnimationFrame(poll);
      };
      raf = requestAnimationFrame(poll);

      const el = containerRef.current;
      const ro =
        el && typeof ResizeObserver !== "undefined"
          ? new ResizeObserver(() => {
            cancelAnimationFrame(raf);
            tries = 0;
            raf = requestAnimationFrame(poll);
          })
          : null;
      ro?.observe(el as Element);

      return () => {
        cancelAnimationFrame(raf);
        ro?.disconnect();
      };
    }, [options, series]);

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
          <Chart
            chartRef={chartInstanceRef}
            options={options}
            series={series}
            type="bar"
            height={360}
            width="100%"
          />
        )}
      </div>
    );
  },
);

RevenueTrendChart.displayName = "RevenueTrendChart";

export default RevenueTrendChart;
