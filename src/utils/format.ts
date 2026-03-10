/**
 * Định dạng tiền VND: số lớn (triệu, tỷ) hiển thị gọn dạng 1M, 1B cho dễ nhìn.
 * - >= 1 tỷ → 1B, 1.5B
 * - >= 1 triệu → 1M, 2.5M
 * - >= 1 nghìn → 1K, 500K
 * - dưới 1 nghìn → hiển thị đủ số
 */
export function formatVND(num: number): string {
  if (num == null || Number.isNaN(num)) return '0 VNĐ';
  if (num >= 1_000_000_000) {
    const b = num / 1_000_000_000;
    return (b % 1 === 0 ? b.toString() : b.toFixed(1)) + 'B VNĐ';
  }
  if (num >= 1_000_000) {
    const m = num / 1_000_000;
    return (m % 1 === 0 ? m.toString() : m.toFixed(1)) + 'M VNĐ';
  }
  if (num >= 1_000) {
    const k = num / 1_000;
    return (k % 1 === 0 ? k.toString() : k.toFixed(1)) + 'K VNĐ';
  }
  return num.toLocaleString('vi-VN') + 'VNĐ';
}
