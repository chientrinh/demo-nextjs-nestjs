"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import CurrencyInput from "@/shared/components/form/CurrencyInput";
import Input from "@/shared/components/form/input/InputField";
import TextArea from "@/shared/components/form/input/TextArea";
import Label from "@/shared/components/form/Label";
import Select from "@/shared/components/form/Select";
import Button from "@/shared/components/ui/button/Button";
import {
  DEPARTMENTS,
  DEPARTMENT_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  readEnglishAmount,
} from "@/modules/shared";
import { ROUTES } from "@/shared/constants/routes";
import { ERROR_CODES, isApiError } from "@/shared/utils/errors";
import { todayKey } from "@/shared/utils/time";

import { labourCostSchema } from "../../../domain/labour";
import type { LabourCostInput } from "../../../domain/labour";
import { useCreateLabourCost } from "../hooks/use-create-labour-cost";

const DEPARTMENT_OPTIONS = DEPARTMENTS.map((department) => ({
  value: department,
  label: DEPARTMENT_LABELS[department],
}));

const PAYMENT_OPTIONS = PAYMENT_METHODS.map((method) => ({
  value: method,
  label: PAYMENT_METHOD_LABELS[method],
}));

const defaultValues: LabourCostInput = {
  entryDate: todayKey(),
  amount: 0,
  department: "FOH",
  paymentMethod: "CASH_TILL",
  note: "",
};

export const LabourCostForm: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const createLabour = useCreateLabourCost();

  const {
    control,
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LabourCostInput>({
    resolver: zodResolver(labourCostSchema),
    defaultValues,
  });

  const onSubmit = handleSubmit(async (values) => {
    setSaved(false);
    try {
      await createLabour.mutateAsync(values);
      setSaved(true);
      reset({
        ...defaultValues,
        entryDate: values.entryDate,
        department: values.department,
      });
    } catch (error) {
      if (isApiError(error) && error.code === ERROR_CODES.validationError) {
        error.validationDetails.forEach((detail) =>
          setError(detail.field as keyof LabourCostInput, {
            message: detail.message,
          }),
        );
        return;
      }
      setError("root", {
        message: isApiError(error)
          ? error.message
          : "Không thể lưu chi phí nhân công",
      });
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {saved ? (
        <div
          role="status"
          className="rounded-xl border border-success-500/40 bg-success-50 px-4 py-3 text-sm text-success-700 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-400"
        >
          Đã lưu chi phí nhân công.{" "}
          <Link href={ROUTES.home} className="font-medium underline">
            Về trang tổng quan
          </Link>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="labour-date">Ngày</Label>
          <Input
            id="labour-date"
            type="date"
            error={Boolean(errors.entryDate)}
            hint={errors.entryDate?.message}
            {...register("entryDate")}
          />
        </div>

        <div>
          <Label htmlFor="labour-amount">Số tiền ($)</Label>
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <>
                <CurrencyInput
                  id="labour-amount"
                  value={field.value}
                  onChange={field.onChange}
                  error={Boolean(errors.amount)}
                  hint={errors.amount?.message}
                />
                <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                  {readEnglishAmount(field.value || 0)}
                </p>
              </>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="labour-department">Bộ phận</Label>
          <Controller
            control={control}
            name="department"
            render={({ field }) => (
              <Select
                key={`department-${field.value}`}
                options={DEPARTMENT_OPTIONS}
                defaultValue={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {errors.department ? (
            <p className="mt-1.5 text-xs text-error-500">
              {errors.department.message}
            </p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="labour-payment">Phương thức thanh toán</Label>
          <Controller
            control={control}
            name="paymentMethod"
            render={({ field }) => (
              <Select
                key={`payment-${field.value}`}
                options={PAYMENT_OPTIONS}
                defaultValue={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {errors.paymentMethod ? (
            <p className="mt-1.5 text-xs text-error-500">
              {errors.paymentMethod.message}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <Label htmlFor="labour-note">Ghi chú</Label>
        <Controller
          control={control}
          name="note"
          render={({ field }) => (
            <TextArea
              placeholder="Mô tả ngắn (tối đa 500 ký tự)"
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
          {isSubmitting ? "Đang lưu..." : "Lưu chi phí"}
        </Button>
      </div>
    </form>
  );
};
