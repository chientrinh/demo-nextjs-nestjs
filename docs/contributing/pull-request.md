# Pull Request

## Nhánh

| Loại | Mẫu | Ví dụ |
| --- | --- | --- |
| Tính năng | `feat/<mô-tả>` | `feat/labour-cost-ledger` |
| Sửa lỗi | `fix/<mô-tả>` | `fix/weekly-trend-missing-days` |
| Tài liệu | `docs/<mô-tả>` | `docs/ops-docker` |
| Bảo trì | `chore/<mô-tả>` | `chore/bump-prisma` |

Nhánh nền: `main`. Giữ nhánh nhỏ, ngắn ngày.

## Commit

- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- Một commit một ý; thông điệp nêu *vì sao* trong phần thân nếu cần.
- Không commit `.env`, secrets, hay `node_modules`.

## Trước khi mở PR

```bash
npm run lint
npm run test
```

- [ ] Nhánh đã cập nhật `main` (rebase/merge, không tạo conflict).
- [ ] Lint + test xanh.
- [ ] Đã cập nhật tài liệu liên quan trong `docs/` nếu hành vi/schema/tham số thay đổi.
- [ ] Không có thay đổi ngoài phạm vi.

## Nội dung PR

Điền mô tả gồm:

1. **Mục tiêu** — PR giải quyết gì.
2. **Thay đổi** — danh sách ngắn.
3. **Kiểm chứng** — cách test/reviewer xác nhận (lệnh, ảnh chụp nếu là UI).
4. **Ảnh hưởng** — schema/migration, API, biến môi trường (nếu có).
5. **Liên quan** — issue/PR khác.

Mẫu:

```markdown
## Mục tiêu
Thêm form ghi chi phí nhân công.

## Thay đổi
- API POST /api/labour + GET /api/labour
- Component LabourCostForm + LabourLedgerTable
- Test validate amount > 0

## Kiểm chứng
- `npm run test` (backend + frontend)
- Ghi một khoản, thấy xuất hiện trong sổ và trên biểu đồ

## Ảnh hưởng
- Không đổi schema
```

## Review

Chuẩn review (`code-review` skill):

- Tiền tố bình luận: **`blocker:`** (phải sửa), **`suggestion:`** (nên cân nhắc), **`nit:`** (nhỏ, không chặn), **`question:`** (cần làm rõ), **`praise:`** (ghi nhận điều tốt).
- Reviewer kiểm: đúng phạm vi, ràng buộc nghiệp vụ (title ≤ 80, quy tắc `amount`, quyền theo vai trò), test, tài liệu, bảo mật (không lộ secret).
- **Ít nhất một phê duyệt** trước khi merge.
- Phản hồi mọi bình luận `blocker`.

## Merge

- Ưu tiên **squash** cho PR nhiều commit lộn xộn; **merge commit** khi cần giữ lịch sử rõ.
- Xóa nhánh sau khi merge.
- Không force-push lên `main`.

## Liên quan

- [`../.agents/skills/git-workflow/SKILL.md`](../../.agents/skills/git-workflow/SKILL.md)
- [`../.agents/skills/code-review/SKILL.md`](../../.agents/skills/code-review/SKILL.md)
- [`testing-guidelines.md`](./testing-guidelines.md)
