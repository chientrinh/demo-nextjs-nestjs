import { describe, expect, it } from "vitest";
import {
  formatCompactUsd,
  formatDate,
  formatNumber,
  formatUsd,
  readEnglishAmount,
  truncate,
} from "./format";

describe("formatUsd", () => {
  it("định dạng USD theo en-US", () => {
    expect(formatUsd(16110)).toBe("$16,110");
  });

  it("thêm dấu trừ cho số âm", () => {
    expect(formatUsd(-16110)).toBe("-$16,110");
  });

  it("hiển thị $0 cho giá trị 0", () => {
    expect(formatUsd(0)).toBe("$0");
  });
});

describe("formatNumber", () => {
  it("phân tách hàng nghìn", () => {
    expect(formatNumber(1234567)).toBe("1,234,567");
  });
});

describe("formatCompactUsd", () => {
  it("rút gọn theo nghìn/million/tỷ", () => {
    expect(formatCompactUsd(800)).toBe("$800");
    expect(formatCompactUsd(8000)).toBe("$8K");
    expect(formatCompactUsd(1200000)).toBe("$1.2M");
    expect(formatCompactUsd(1500000000)).toBe("$1.5B");
  });
});

describe("formatDate", () => {
  it("đổi YYYY-MM-DD sang DD/MM/YYYY", () => {
    expect(formatDate("2026-10-17")).toBe("17/10/2026");
  });
});

describe("readEnglishAmount", () => {
  it("đọc các mốc theo đặc tả", () => {
    expect(readEnglishAmount(0)).toBe("Zero dollars");
    expect(readEnglishAmount(1000)).toBe("One thousand dollars");
    expect(readEnglishAmount(1500000)).toBe("One million five hundred thousand dollars");
    expect(readEnglishAmount(1800000)).toBe("One million eight hundred thousand dollars");
    expect(readEnglishAmount(1234567)).toBe(
      "One million two hundred thirty-four thousand five hundred sixty-seven dollars",
    );
  });
});

describe("truncate", () => {
  it("cắt chuỗi dài và thêm dấu ba chấm", () => {
    expect(truncate("abcdef", 4)).toBe("abc…");
  });

  it("giữ nguyên chuỗi ngắn", () => {
    expect(truncate("abc", 4)).toBe("abc");
  });
});
