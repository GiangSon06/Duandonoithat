"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Truck,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  X,
  CreditCard,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Printer,
  CheckSquare,
  Square,
  AlertTriangle,
  RotateCcw,
  Edit,
  Save,
  FileText,
  DollarSign,
  Package,
} from "lucide-react";
import { adminService, ApiOrder } from "@/services/api";
import { formatPrice } from "@/lib/products";

const STATUS_TABS = [
  { key: "all", label: "Tất Cả" },
  { key: "pending", label: "Chờ Xác Nhận" },
  { key: "confirmed", label: "Đã Xác Nhận" },
  { key: "shipping", label: "Đang Giao" },
  { key: "completed", label: "Hoàn Thành" },
  { key: "cancelled", label: "Đã Hủy" },
];

const STATUS_CONFIG: Record<
  string,
  { label: string; badge: string; dot: string }
> = {
  pending: {
    label: "Chờ Xác Nhận",
    badge: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    dot: "bg-amber-400",
  },
  confirmed: {
    label: "Đã Xác Nhận",
    badge: "bg-purple-500/15 text-purple-300 border border-purple-500/30",
    dot: "bg-purple-400",
  },
  processing: {
    label: "Đang Xử Lý",
    badge: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
    dot: "bg-blue-400",
  },
  shipping: {
    label: "Đang Giao",
    badge: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30",
    dot: "bg-cyan-400",
  },
  completed: {
    label: "Hoàn Thành",
    badge: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  cancelled: {
    label: "Đã Hủy",
    badge: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
    dot: "bg-rose-400",
  },
  refunded: {
    label: "Đã Hoàn Tiền",
    badge: "bg-gray-500/15 text-gray-300 border border-gray-500/30",
    dot: "bg-gray-400",
  },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState<number | "all">(10);
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    lastPage: 1,
  });

  // Selected orders for bulk action
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Single order delete confirm dialog
  const [deleteConfirmOrder, setDeleteConfirmOrder] = useState<ApiOrder | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Modal State for Order Detail & Edit
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  const [updating, setUpdating] = useState(false);
  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [editForm, setEditForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    shipping_address: "",
    shipping_city: "",
    notes: "",
  });

  // Load orders from API
  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await adminService.getOrders({
        status: activeTab !== "all" ? activeTab : undefined,
        q: search || undefined,
        page: currentPage,
        per_page: perPage,
      });

      if (res.success && res.data) {
        setOrders(res.data);
        if (res.pagination) {
          setPaginationInfo({
            total: res.pagination.total,
            lastPage: res.pagination.last_page,
          });
        } else {
          setPaginationInfo({
            total: res.data.length,
            lastPage: 1,
          });
        }
      }
    } catch (err: any) {
      console.error("Lỗi tải đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // Reset selection when tab or page changes
    setSelectedIds([]);
  }, [activeTab, currentPage, perPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadOrders();
  };

  // Helper to extract true status
  const getStatus = (order: ApiOrder) => {
    return order.order_status || order.status || "pending";
  };

  // Quick inline update status directly on row
  const handleQuickStatusChange = async (
    orderId: number,
    newStatus: string
  ) => {
    try {
      const res = await adminService.updateOrderStatus(orderId, {
        status: newStatus,
      });
      if (res.success) {
        // Update local list
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, status: newStatus as any, order_status: newStatus }
              : o
          )
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) =>
            prev ? { ...prev, status: newStatus as any, order_status: newStatus } : null
          );
        }
      }
    } catch (err: any) {
      alert(err.message || "Không thể cập nhật trạng thái");
    }
  };

  // Quick inline update payment status directly on row
  const handleQuickPaymentChange = async (
    orderId: number,
    newPayment: string
  ) => {
    try {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;
      const res = await adminService.updateOrderStatus(orderId, {
        status: getStatus(order),
        payment_status: newPayment,
      });
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, payment_status: newPayment as any } : o
          )
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) =>
            prev ? { ...prev, payment_status: newPayment as any } : null
          );
        }
      }
    } catch (err: any) {
      alert(err.message || "Không thể cập nhật thanh toán");
    }
  };

  // Delete single order
  const handleDeleteOrder = async (order: ApiOrder) => {
    setDeletingId(order.id);
    try {
      const res = await adminService.deleteOrder(order.id);
      if (res.success) {
        // Immediately remove from state
        setOrders((prev) => prev.filter((o) => o.id !== order.id));
        setPaginationInfo((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));
        setSelectedIds((prev) => prev.filter((id) => id !== order.id));
        if (selectedOrder?.id === order.id) {
          setSelectedOrder(null);
        }
        setDeleteConfirmOrder(null);
      } else {
        alert(res.message || "Không thể xóa đơn hàng");
      }
    } catch (err: any) {
      alert(err.message || "Lỗi khi xóa đơn hàng");
    } finally {
      setDeletingId(null);
    }
  };

  // Bulk actions (Delete, Status, Payment)
  const handleBulkAction = async (
    action: "delete" | "update_status" | "update_payment",
    value?: string
  ) => {
    if (selectedIds.length === 0) return;

    if (
      action === "delete" &&
      !window.confirm(
        `Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedIds.length} đơn hàng đã chọn? Thao tác này sẽ hoàn trả kho và không thể hoàn tác!`
      )
    ) {
      return;
    }

    setBulkActionLoading(true);
    try {
      const res = await adminService.bulkOrderAction({
        order_ids: selectedIds,
        action,
        status: action === "update_status" ? value : undefined,
        payment_status: action === "update_payment" ? value : undefined,
      });

      if (res.success) {
        setSelectedIds([]);
        loadOrders();
      } else {
        alert(res.message || "Không thể thực hiện thao tác hàng loạt");
      }
    } catch (err: any) {
      alert(err.message || "Lỗi thao tác hàng loạt");
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Toggle selection for all rows
  const handleSelectAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map((o) => o.id));
    }
  };

  // Toggle selection for single row
  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Open modal & prep edit form
  const handleOpenDetailModal = (order: ApiOrder) => {
    setSelectedOrder(order);
    setIsEditingShipping(false);
    setEditForm({
      customer_name: order.customer_name || "",
      customer_phone: order.customer_phone || "",
      customer_email: order.customer_email || "",
      shipping_address: order.shipping_address || "",
      shipping_city: order.shipping_city || "",
      notes: order.notes || "",
    });
  };

  // Save edited shipping details
  const handleSaveShipping = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const res = await adminService.updateOrder(selectedOrder.id, editForm);
      if (res.success && res.data) {
        setSelectedOrder(res.data);
        setIsEditingShipping(false);
        loadOrders();
      }
    } catch (err: any) {
      alert(err.message || "Không thể lưu thông tin giao hàng");
    } finally {
      setUpdating(false);
    }
  };

  // Trigger browser print for packing slip / invoice
  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl text-champagne flex items-center gap-2.5">
            <ShoppingBag className="text-gold" size={26} /> Quản Lý Đơn Hàng (
            {paginationInfo.total})
          </h1>
          <p className="text-xs text-beige/60 tracking-wider mt-1">
            Trung tâm xử lý, phân công giao hàng, sửa thông tin &amp; xóa đơn hàng trực tiếp
          </p>
        </div>

        {/* Quick Filter Per-Page Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-beige/60">Hiển thị:</span>
          <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1">
            {[10, 25, 50, "all"].map((val) => (
              <button
                key={val}
                onClick={() => {
                  setPerPage(val as any);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  perPage === val
                    ? "bg-gold text-charcoal font-semibold shadow"
                    : "text-beige/60 hover:text-white"
                }`}
              >
                {val === "all" ? "Tất Cả" : val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-gold text-charcoal font-bold shadow-md shadow-gold/20"
                  : "bg-charcoal border border-white/10 text-beige/60 hover:text-beige hover:border-white/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-2 bg-charcoal border border-white/10 rounded-xl px-3.5 py-2.5 w-full md:w-80 shadow-inner focus-within:border-gold/50 transition-colors"
        >
          <Search size={15} className="text-beige/40 shrink-0" />
          <input
            type="text"
            placeholder="Tìm mã đơn (#GSL-...), tên khách, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-beige outline-none flex-1 placeholder:text-beige/30"
          />
        </form>
      </div>

      {/* BULK ACTION FLOATING DOCK (When 1+ rows checked) */}
      {selectedIds.length > 0 && (
        <div className="bg-gradient-to-r from-[#2A231D] via-charcoal to-[#2A231D] border border-gold/50 rounded-2xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-gold animate-ping" />
            <span className="text-xs text-champagne font-mono font-semibold">
              Đã chọn <strong className="text-gold">{selectedIds.length}</strong> đơn hàng
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Quick Bulk Status Dropdown */}
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkAction("update_status", e.target.value);
                  e.target.value = "";
                }
              }}
              defaultValue=""
              disabled={bulkActionLoading}
              className="bg-black/60 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-beige focus:border-gold outline-none [&>option]:bg-charcoal"
            >
              <option value="" disabled>
                ⚡ Đổi trạng thái hàng loạt...
              </option>
              <option value="pending">Chờ Xác Nhận</option>
              <option value="confirmed">Đã Xác Nhận</option>
              <option value="shipping">Đang Giao</option>
              <option value="completed">Hoàn Thành</option>
              <option value="cancelled">Đã Hủy</option>
            </select>

            {/* Quick Bulk Payment Dropdown */}
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkAction("update_payment", e.target.value);
                  e.target.value = "";
                }
              }}
              defaultValue=""
              disabled={bulkActionLoading}
              className="bg-black/60 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-beige focus:border-gold outline-none [&>option]:bg-charcoal"
            >
              <option value="" disabled>
                💳 Thanh toán...
              </option>
              <option value="paid">Đã Thanh Toán</option>
              <option value="unpaid">Chưa Trả</option>
            </select>

            {/* Bulk Delete Button */}
            <button
              onClick={() => handleBulkAction("delete")}
              disabled={bulkActionLoading}
              className="px-3.5 py-1.5 bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500 text-rose-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
            >
              <Trash2 size={13} />
              <span>Xóa ({selectedIds.length}) Đơn</span>
            </button>

            {/* Clear Selection */}
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-beige/60 hover:text-beige rounded-xl text-xs"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* Orders Table Container (Self-expanding, No Awkward Internal Scrollbars) */}
      <div className="bg-charcoal border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-xs text-beige/50 space-y-2">
            <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin mx-auto" />
            <p>Đang tải dữ liệu đơn hàng...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[900px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-beige/50 border-b border-white/10 bg-black/40">
                  <th className="p-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        orders.length > 0 && selectedIds.length === orders.length
                      }
                      onChange={handleSelectAll}
                      className="rounded accent-gold cursor-pointer"
                    />
                  </th>
                  <th className="p-4">Mã Đơn Hàng</th>
                  <th className="p-4">Ngày Đặt</th>
                  <th className="p-4">Khách Hàng</th>
                  <th className="p-4">Sản Phẩm</th>
                  <th className="p-4">Tổng Tiền</th>
                  <th className="p-4">Thanh Toán</th>
                  <th className="p-4">Trạng Thái (Đổi Trực Tiếp)</th>
                  <th className="p-4 text-right">Thao Tác Quản Trị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => {
                  const currentStatus = getStatus(order);
                  const statusConf =
                    STATUS_CONFIG[currentStatus] || STATUS_CONFIG.pending;
                  const isChecked = selectedIds.includes(order.id);

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-white/[0.03] transition-colors ${
                        isChecked ? "bg-gold/5" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(order.id)}
                          className="rounded accent-gold cursor-pointer"
                        />
                      </td>

                      {/* Order Number */}
                      <td className="p-4 font-mono font-bold text-gold">
                        #{order.order_number}
                      </td>

                      {/* Date */}
                      <td className="p-4 text-beige/60 font-mono text-[11px]">
                        {new Date(order.created_at).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>

                      {/* Customer Info */}
                      <td className="p-4 align-top max-w-[240px]">
                        <p className="font-semibold text-champagne truncate">
                          {order.customer_name}
                        </p>
                        {order.customer_phone && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <a
                              href={`tel:${order.customer_phone}`}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono text-[11px] hover:bg-emerald-500/25 transition-colors"
                            >
                              <Phone size={10} />
                              <span>{order.customer_phone}</span>
                            </a>
                          </div>
                        )}
                        {order.shipping_address && (
                          <div className="flex items-start gap-1 text-[11px] text-beige/60 mt-1">
                            <MapPin size={11} className="shrink-0 mt-0.5 text-amber-500" />
                            <span className="line-clamp-2">
                              {order.shipping_address},{" "}
                              {order.shipping_city}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Items Count */}
                      <td className="p-4 text-beige/70 font-mono">
                        <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
                          {order.items?.length || 1} món
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="p-4 font-serif text-sm text-gold font-bold">
                        {formatPrice(order.total_amount)}
                      </td>

                      {/* Payment Status Dropdown Selector */}
                      <td className="p-4">
                        <select
                          value={order.payment_status || "unpaid"}
                          onChange={(e) =>
                            handleQuickPaymentChange(order.id, e.target.value)
                          }
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer border transition-colors ${
                            order.payment_status === "paid"
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          } [&>option]:bg-charcoal [&>option]:text-beige`}
                        >
                          <option value="paid">Đã Thanh Toán</option>
                          <option value="unpaid">Chưa Trả</option>
                          <option value="refunded">Đã Hoàn Tiền</option>
                        </select>
                      </td>

                      {/* Order Status Dropdown Selector */}
                      <td className="p-4">
                        <div className="relative inline-flex items-center">
                          <span
                            className={`w-2 h-2 rounded-full absolute left-2.5 pointer-events-none ${statusConf.dot}`}
                          />
                          <select
                            value={currentStatus}
                            onChange={(e) =>
                              handleQuickStatusChange(order.id, e.target.value)
                            }
                            className={`pl-6 pr-3 py-1.5 rounded-xl text-[11px] font-semibold uppercase tracking-wider outline-none cursor-pointer transition-all ${statusConf.badge} [&>option]:bg-charcoal [&>option]:text-beige`}
                          >
                            <option value="pending">Chờ Xác Nhận</option>
                            <option value="confirmed">Đã Xác Nhận</option>
                            <option value="shipping">Đang Giao</option>
                            <option value="completed">Hoàn Thành</option>
                            <option value="cancelled">Đã Hủy</option>
                          </select>
                        </div>
                      </td>

                      {/* Actions Column (View Detail + Direct Delete) */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenDetailModal(order)}
                            className="px-3 py-1.5 bg-white/5 hover:bg-gold hover:text-charcoal transition-all rounded-xl text-xs font-medium flex items-center gap-1.5 shadow"
                            title="Xem chi tiết & in hóa đơn"
                          >
                            <Eye size={13} />
                            <span>Xem Đơn</span>
                          </button>

                          <button
                            onClick={() => setDeleteConfirmOrder(order)}
                            className="p-2 bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white transition-all rounded-xl shadow"
                            title="Xóa đơn hàng này"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center text-xs text-beige/40 space-y-2">
            <Package size={32} className="mx-auto text-beige/20" />
            <p>Không có đơn hàng nào khớp với bộ lọc hiện tại.</p>
          </div>
        )}

        {/* PAGINATION FOOTER BAR */}
        {!loading && orders.length > 0 && perPage !== "all" && (
          <div className="p-4 border-t border-white/10 bg-black/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-beige/60">
            <div>
              Hiển thị{" "}
              <strong className="text-beige font-mono">
                {(currentPage - 1) * (perPage as number) + 1} -{" "}
                {Math.min(
                  currentPage * (perPage as number),
                  paginationInfo.total
                )}
              </strong>{" "}
              trên tổng số{" "}
              <strong className="text-gold font-mono">
                {paginationInfo.total}
              </strong>{" "}
              đơn hàng
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-2 rounded-xl bg-charcoal border border-white/10 text-beige hover:border-gold disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Trang trước"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from(
                { length: Math.min(5, paginationInfo.lastPage) },
                (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-xl font-mono text-xs font-semibold transition-all ${
                        currentPage === pageNum
                          ? "bg-gold text-charcoal shadow-md"
                          : "bg-charcoal border border-white/10 text-beige/70 hover:border-gold"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
              )}

              {paginationInfo.lastPage > 5 && (
                <span className="px-1 text-beige/40">...</span>
              )}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(paginationInfo.lastPage, p + 1))
                }
                disabled={currentPage >= paginationInfo.lastPage}
                className="p-2 rounded-xl bg-charcoal border border-white/10 text-beige hover:border-gold disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Trang tiếp"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SINGLE ORDER DELETE CONFIRMATION DIALOG */}
      {deleteConfirmOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-charcoal border border-rose-500/40 rounded-3xl max-w-md w-full p-6 text-beige shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-serif text-lg text-champagne font-bold">
                Xác Nhận Xóa Đơn Hàng?
              </h3>
              <p className="text-xs text-beige/70 leading-relaxed">
                Bạn chuẩn bị xóa đơn hàng{" "}
                <strong className="text-gold font-mono">
                  #{deleteConfirmOrder.order_number}
                </strong>{" "}
                của khách hàng{" "}
                <strong className="text-beige">
                  {deleteConfirmOrder.customer_name}
                </strong>
                . Thao tác này sẽ tự động hoàn trả số lượng tồn kho và xóa vĩnh
                viễn khỏi hệ thống!
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmOrder(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-beige hover:bg-white/10 text-xs font-medium transition-all"
              >
                Hủy Bỏ
              </button>

              <button
                onClick={() => handleDeleteOrder(deleteConfirmOrder)}
                disabled={deletingId === deleteConfirmOrder.id}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30"
              >
                <Trash2 size={13} />
                <span>
                  {deletingId === deleteConfirmOrder.id
                    ? "Đang Xóa..."
                    : "Xóa Vĩnh Viễn"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED ORDER MANAGEMENT & PRINT MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#17171A] border border-gold/40 rounded-3xl w-full max-w-3xl my-8 p-6 md:p-8 text-beige shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-5 border-b border-white/10 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gold font-mono font-bold text-lg">
                    #{selectedOrder.order_number}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      STATUS_CONFIG[getStatus(selectedOrder)]?.badge ||
                      STATUS_CONFIG.pending.badge
                    }`}
                  >
                    {STATUS_CONFIG[getStatus(selectedOrder)]?.label}
                  </span>
                </div>
                <p className="text-xs text-beige/50 font-mono">
                  Ngày đặt:{" "}
                  {new Date(selectedOrder.created_at).toLocaleString("vi-VN")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintInvoice}
                  className="px-3 py-1.5 bg-white/5 hover:bg-gold hover:text-charcoal border border-white/15 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all shadow"
                  title="In phiếu giao hàng / xuất hóa đơn"
                >
                  <Printer size={14} />
                  <span>In Đơn Hàng</span>
                </button>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 text-beige/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-beige/60">Trạng Thái Đơn:</span>
                <select
                  value={getStatus(selectedOrder)}
                  onChange={(e) =>
                    handleQuickStatusChange(selectedOrder.id, e.target.value)
                  }
                  className="bg-charcoal border border-gold/50 rounded-xl px-3 py-1.5 text-xs text-gold font-bold uppercase tracking-wider outline-none"
                >
                  <option value="pending">Chờ Xác Nhận</option>
                  <option value="confirmed">Đã Xác Nhận</option>
                  <option value="shipping">Đang Giao</option>
                  <option value="completed">Hoàn Thành</option>
                  <option value="cancelled">Đã Hủy</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-beige/60">Thanh Toán:</span>
                <select
                  value={selectedOrder.payment_status || "unpaid"}
                  onChange={(e) =>
                    handleQuickPaymentChange(selectedOrder.id, e.target.value)
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider outline-none border ${
                    selectedOrder.payment_status === "paid"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  } [&>option]:bg-charcoal`}
                >
                  <option value="paid">Đã Thanh Toán</option>
                  <option value="unpaid">Chưa Trả</option>
                  <option value="refunded">Đã Hoàn Tiền</option>
                </select>
              </div>
            </div>

            {/* Customer & Shipping Management */}
            <div className="bg-black/30 border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-sm font-bold text-champagne flex items-center gap-2">
                  <User size={15} className="text-gold" />
                  <span>Thông Tin Giao Hàng &amp; Khách Hàng</span>
                </h4>

                <button
                  onClick={() => setIsEditingShipping(!isEditingShipping)}
                  className="text-xs text-gold hover:underline flex items-center gap-1 font-mono"
                >
                  <Edit size={12} />
                  <span>{isEditingShipping ? "Hủy Chỉnh Sửa" : "Sửa Thông Tin"}</span>
                </button>
              </div>

              {isEditingShipping ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] text-beige/60 mb-1">
                      Họ và Tên Khách Hàng:
                    </label>
                    <input
                      type="text"
                      value={editForm.customer_name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, customer_name: e.target.value })
                      }
                      className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-beige focus:border-gold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-beige/60 mb-1">
                      Số Điện Thoại:
                    </label>
                    <input
                      type="text"
                      value={editForm.customer_phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, customer_phone: e.target.value })
                      }
                      className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-beige focus:border-gold outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-beige/60 mb-1">
                      Địa Chỉ Nhận Hàng:
                    </label>
                    <input
                      type="text"
                      value={editForm.shipping_address}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          shipping_address: e.target.value,
                        })
                      }
                      className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-beige focus:border-gold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-beige/60 mb-1">
                      Tỉnh / Thành Phố:
                    </label>
                    <input
                      type="text"
                      value={editForm.shipping_city}
                      onChange={(e) =>
                        setEditForm({ ...editForm, shipping_city: e.target.value })
                      }
                      className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-beige focus:border-gold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-beige/60 mb-1">
                      Ghi Chú Đơn Hàng:
                    </label>
                    <input
                      type="text"
                      value={editForm.notes}
                      onChange={(e) =>
                        setEditForm({ ...editForm, notes: e.target.value })
                      }
                      className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-beige focus:border-gold outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2 flex justify-end">
                    <button
                      onClick={handleSaveShipping}
                      disabled={updating}
                      className="px-5 py-2 rounded-xl bg-gold text-charcoal font-bold text-xs flex items-center gap-1.5 shadow"
                    >
                      <Save size={13} />
                      <span>{updating ? "Đang lưu..." : "Lưu Thông Tin Mới"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <p>
                      <span className="text-beige/50">Khách hàng:</span>{" "}
                      <strong className="text-champagne font-semibold">
                        {selectedOrder.customer_name}
                      </strong>
                    </p>
                    <p>
                      <span className="text-beige/50">Điện thoại:</span>{" "}
                      <strong className="text-emerald-400 font-mono">
                        {selectedOrder.customer_phone || "Chưa có"}
                      </strong>
                    </p>
                    <p>
                      <span className="text-beige/50">Email:</span>{" "}
                      <span className="text-beige/80">
                        {selectedOrder.customer_email || "Chưa có"}
                      </span>
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <p>
                      <span className="text-beige/50">Địa chỉ:</span>{" "}
                      <span className="text-beige/90">
                        {selectedOrder.shipping_address},{" "}
                        {selectedOrder.shipping_city}
                      </span>
                    </p>
                    {selectedOrder.notes && (
                      <p>
                        <span className="text-beige/50">Ghi chú:</span>{" "}
                        <span className="text-amber-400 italic">
                          {selectedOrder.notes}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Order Items Table */}
            <div className="space-y-3">
              <h4 className="font-serif text-sm font-bold text-champagne flex items-center gap-2">
                <Package size={15} className="text-gold" />
                <span>Danh Sách Sản Phẩm Trong Đơn</span>
              </h4>

              <div className="border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 flex items-center justify-between gap-4 bg-black/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black/60 shrink-0 border border-white/10">
                          <Image
                            src={
                              item.product?.images?.[0]?.image_url ||
                              "/images/hero-banner.jpg"
                            }
                            alt={item.product?.name || "Product"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-serif text-xs font-semibold text-champagne">
                            {item.product?.name || "Sản phẩm GS Luxury"}
                          </p>
                          <p className="text-[11px] text-beige/50 font-mono">
                            Số lượng: {item.quantity} ×{" "}
                            {formatPrice(item.unit_price)}
                          </p>
                        </div>
                      </div>

                      <span className="font-serif text-xs text-gold font-bold">
                        {formatPrice(item.total_price ?? item.subtotal ?? (item.unit_price * item.quantity))}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-xs text-beige/50 text-center">
                    Đơn hàng may đo tùy biến 1 món.
                  </div>
                )}
              </div>
            </div>

            {/* Total Summary & Danger Zone */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
              <div className="text-xs text-beige/60">
                Tổng thanh toán:{" "}
                <span className="font-serif text-xl text-gold font-bold ml-2">
                  {formatPrice(selectedOrder.total_amount)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const toDelete = selectedOrder;
                    setSelectedOrder(null);
                    setDeleteConfirmOrder(toDelete);
                  }}
                  className="px-4 py-2 bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
                >
                  <Trash2 size={13} />
                  <span>Xóa Đơn Hàng Này</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
