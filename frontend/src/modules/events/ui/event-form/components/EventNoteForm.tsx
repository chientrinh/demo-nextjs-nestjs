"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import Button from "@/shared/components/ui/button/Button";
import CurrencyInput from "@/shared/components/form/CurrencyInput";
import Input from "@/shared/components/form/input/InputField";
import Radio from "@/shared/components/form/input/Radio";
import TextArea from "@/shared/components/form/input/TextArea";
import Label from "@/shared/components/form/Label";
import Select from "@/shared/components/form/Select";
import {
  REVENUE_SOURCES,
  REVENUE_SOURCE_LABELS,
  WORK_SHIFTS,
  WORK_SHIFT_LABELS,
  readVietnameseAmount,
} from "@/modules/shared";
import { ROUTES } from "@/shared/constants/routes";
import { isApiError, ERROR_CODES } from "@/shared/utils/errors";
import { todayKey } from "@/shared/utils/time";

import { eventNoteSchema } from "../../../domain/event";
import type { EventNoteInput } from "../../../domain/event";
import { useCreateEvent } from "../hooks/use-create-event";

const SHIFT_OPTIONS = WORK_SHIFTS.map((shift) => ({
  value: shift,
  label: WORK_SHIFT_LABELS[shift],
}));

const PRESETS: { label: string; values: Partial<EventNoteInput> }[] = [
  {
    label: "Live nhạc tối",
    values: { title: "Live nhạc tối", source: "POS", shift: "CA_TOI", amount: 500_000 },
  },
  {
    label: "Khuyến mãi trưa",
    values: { title: "Khuyến mãi trưa", source: "EATCLUB", shift: "CA_TRUA", amount: 200_000 },
  },
  {
    label: "Sự kiện tư nhân",
    values: { title: "Sự kiện tư nhân", source: "POS", shift: "CA_DEM", amount: 1_500_000 },
  },
];

const defaultValues: EventNoteInput = {
  title: "",
  source: "POS",
  amount: 0,
  eventDate: todayKey(),
  shift: "CA_NGAY",
  note: "",
};

export const EventNoteForm: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const createEvent = useCreateEvent();

  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EventNoteInput>({
    resolver: zodResolver(eventNoteSchema),
    defaultValues,
  });

  const shift = watch("shift");
  const source = watch("source");
  const amount = watch("amount");

  const onSubmit = handleSubmit(async (values) => {
    setSaved(false);
    try {
      await createEvent.mutateAsync(values);
      setSaved(true);
      reset(defaultValues);
    } catch (error) {
      if (isApiError(error) && error.code === ERROR_CODES.validationError) {
        error.validationDetails.forEach((detail) =>
          setError(detail.field as keyof EventNoteInput, {
            message: detail.message,
          }),
        );
        return;
      }
      setError("root", {
        message: isApiError(error) ? error.message : "Không thể lưu sự kiện",
      });
    }
  });

  const applyPreset = (values: Partial<EventNoteInput>) => {
    setSaved(false);
    (Object.keys(values) as (keyof EventNoteInput)[]).forEach((key) => {
      setValue(key, values[key] as never, { shouldValidate: true });
    });
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {saved ? (
        <div
          role="status"
          className="rounded-xl border border-success-500/40 bg-success-50 px-4 py-3 text-sm text-success-700 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-400"
        >
          Đã lưu ghi chú sự kiện.{" "}
          <Link href={ROUTES.home} className="font-medium underline">
            Về trang tổng quan
          </Link>
        </div>
      ) : null}

      <div>
        <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
          Điền nhanh
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              size="sm"
              variant="outline"
              onClick={() => applyPreset(preset.values)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="event-title">Tiêu đề</Label>
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <Input
              id="event-title"
              placeholder="Ví dụ: Live nhạc cuối tuần"
              value={field.value}
              onChange={field.onChange}
              error={Boolean(errors.title)}
              hint={errors.title?.message}
            />
          )}
        />
      </div>

      <div>
        <Label htmlFor="event-source-pos">Nguồn doanh thu</Label>
        <div className="flex flex-wrap gap-6 pt-1">
          {REVENUE_SOURCES.map((option) => (
            <Radio
              key={option}
              id={`event-source-${option.toLowerCase()}`}
              name="source"
              value={option}
              label={REVENUE_SOURCE_LABELS[option]}
              checked={source === option}
              onChange={() => setValue("source", option, { shouldValidate: true })}
            />
          ))}
        </div>
        {errors.source ? (
          <p className="mt-1.5 text-xs text-error-500">
            {errors.source.message}
          </p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="event-amount">Số tiền (VND)</Label>
        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <CurrencyInput
              id="event-amount"
              value={field.value}
              onChange={field.onChange}
              error={Boolean(errors.amount)}
              hint={errors.amount?.message}
            />
          )}
        />
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          {readVietnameseAmount(amount || 0)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="event-date">Ngày diễn ra</Label>
          <Input
            id="event-date"
            type="date"
            error={Boolean(errors.eventDate)}
            hint={errors.eventDate?.message}
            {...register("eventDate")}
          />
        </div>

        <div>
          <Label htmlFor="event-shift">Ca</Label>
          <Select
            key={`shift-${shift}`}
            options={SHIFT_OPTIONS}
            defaultValue={shift}
            onChange={(value) =>
              setValue("shift", value as EventNoteInput["shift"], {
                shouldValidate: true,
              })
            }
          />
          {errors.shift ? (
            <p className="mt-1.5 text-xs text-error-500">
              {errors.shift.message}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <Label htmlFor="event-note">Ghi chú</Label>
        <Controller
          control={control}
          name="note"
          render={({ field }) => (
            <TextArea
              placeholder="Mô tả ngắn về sự kiện (tối đa 500 ký tự)"
              value={field.value ?? ""}
              onChange={field.onChange}
              error={Boolean(errors.note)}
              hint={errors.note?.message}
            />
          )}
        />
      </div>

      {errors.root ? (
        <p className="text-sm text-error-500">{errors.root.message}</p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang lưu..." : "Lưu ghi chú"}
        </Button>
      </div>
    </form>
  );
};
