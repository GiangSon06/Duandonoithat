"use client";

import { useEffect, useState } from "react";
import {
  PhoneCall,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  MapPin,
  Mail,
  User,
  Trash2,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Phone,
  Copy,
  Check,
} from "lucide-react";
import { adminService, AdminConsultation } from "@/services/api";
import { useToast } from "@/components/ToastProvider";

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: "Mới Tiếp Nhận", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/30" },
  contacted: { label: "Đã Gọi Điện", color: "text-sky-400", bg: "bg-sky-400/10 border-sky-400/30" },
  scheduled: { label: "Đã Lên Lịch Hẹn", color: "text-indigo-400", bg: "bg-indigo-400/10 border-indigo-400/30" },
  completed: { label: "Tư Vấn Thành Công", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/30" },
  cancelled: { label: "Đã Hủy", color: "text-rose-400", bg: "bg-rose-400/10 border-rose-400/30" },
};

export default function AdminConsultationsPage() {
  const { showToast } = useToast();
  const [consultations, setConsultations] = useState<AdminConsultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    scheduled: 0,
    completed: 0,
  });
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const res: any = await adminService.getConsultations({
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });

      if (res.success && res.data) {
        setConsultations(res.data);
        if (res.stats) {
          setStats(res.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load consultations:", err);
      showToast({
        type: "error",
        title: "Lỗi tải dữ liệu",
        message: "Không thể lấy danh sách yêu cầu tư vấn.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchConsultations();
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await adminService.updateConsultationStatus(id, newStatus);
      if (res.success) {
        showToast({
          type: "success",
          title: "Thành công",
          message: res.message || "Đã cập nhật trạng thái yêu cầu.",
        });
        setConsultations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus as any } : c))
        );
      }
    } catch {
      showToast({
        type: "error",
        title: "Thất bại",
        message: "Không thể cập nhật trạng thái.",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa yêu cầu tư vấn này khỏi hệ thống?")) return;
    try {
      const res = await adminService.deleteConsultation(id);
      if (res.success) {
        showToast({
          type: "success",
          title: "Đã xóa",
          message: "Đã xóa yêu cầu tư vấn thành công.",
        });
        setConsultations((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      showToast({
        type: "error",
        title: "Lỗi",
        message: "Không thể xóa yêu cầu.",
      });
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPhone(text);
    showToast({
      type: "info",
      title: "Đã sao chép",
      message: `Đã lưu ${text} vào bộ nhớ tạm.`,
    });
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-mono uppercase tracking-wider mb-2">
            <PhoneCall size={13} />
            <span>Chăm Sóc Khách Hàng & May Đo Bespoke</span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl text-champagne">
            Danh Sách Yêu Cầu Tư Vấn Kiến Trúc
          </h1>
          <p className="text-xs text-beige/60 mt-1">
            Tổng hợp dữ liệu khách hàng đăng ký khảo sát thực địa, đặt may đo nội thất tại nhà
          </p>
        </div>

        <button
          onClick={() => fetchConsultations()}
          className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-charcoal border border-white/10 hover:border-gold/50 text-beige hover:text-gold text-xs font-medium transition-all flex items-center gap-2 cursor-pointer shadow"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Làm Mới</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-charcoal/90 border border-white/10 rounded-2xl p-4.5 backdrop-blur-sm shadow">
          <p className="text-[11px] text-beige/60 uppercase tracking-wider">Tổng Đăng Ký</p>
          <p className="font-serif text-2xl text-champagne font-bold mt-1">{stats.total || consultations.length}</p>
        </div>
        <div className="bg-charcoal/90 border border-amber-500/20 rounded-2xl p-4.5 backdrop-blur-sm shadow">
          <p className="text-[11px] text-amber-400 uppercase tracking-wider">Mới Tiếp Nhận</p>
          <p className="font-serif text-2xl text-amber-400 font-bold mt-1">{stats.new || consultations.filter(c => c.status === "new").length}</p>
        </div>
        <div className="bg-charcoal/90 border border-sky-500/20 rounded-2xl p-4.5 backdrop-blur-sm shadow">
          <p className="text-[11px] text-sky-400 uppercase tracking-wider">Đã Gọi Điện</p>
          <p className="font-serif text-2xl text-sky-400 font-bold mt-1">{stats.contacted || consultations.filter(c => c.status === "contacted").length}</p>
        </div>
        <div className="bg-charcoal/90 border border-emerald-500/20 rounded-2xl p-4.5 backdrop-blur-sm shadow">
          <p className="text-[11px] text-emerald-400 uppercase tracking-wider">Đã Tư Vấn Xong</p>
          <p className="font-serif text-2xl text-emerald-400 font-bold mt-1">{stats.completed || consultations.filter(c => c.status === "completed").length}</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-charcoal/90 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-sm">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {[
            { id: "all", label: "Tất Cả" },
            { id: "new", label: "Mới" },
            { id: "contacted", label: "Đã Gọi" },
            { id: "scheduled", label: "Đã Lên Lịch" },
            { id: "completed", label: "Thành Công" },
            { id: "cancelled", label: "Đã Hủy" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? "bg-gold text-charcoal font-semibold shadow"
                  : "text-beige/60 hover:text-beige hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-beige/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên, SĐT, địa chỉ..."
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-beige placeholder:text-beige/30 focus:outline-none focus:border-gold transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-gold/20 hover:bg-gold text-gold hover:text-charcoal text-xs font-semibold transition-colors"
          >
            Tìm
          </button>
        </form>
      </div>

      {/* Consultations Table */}
      <div className="bg-charcoal/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-beige/50">Đang tải danh sách tư vấn...</p>
          </div>
        ) : consultations.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <MessageSquare size={36} className="mx-auto text-beige/20" />
            <p className="text-sm font-medium text-beige">Chưa có yêu cầu tư vấn nào.</p>
            <p className="text-xs text-beige/50">Các yêu cầu từ trang Đặt Lịch Tư Vấn sẽ tự động hiển thị tại đây.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-beige/80">
              <thead className="bg-black/40 text-[11px] uppercase tracking-wider text-beige/60 border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Khách Hàng & Liên Hệ</th>
                  <th className="py-3.5 px-4 font-semibold">Loại Không Gian & Ngân Sách</th>
                  <th className="py-3.5 px-4 font-semibold">Thời Gian Khảo Sát</th>
                  <th className="py-3.5 px-4 font-semibold">Nhu Cầu May Đo / Lời Nhắn</th>
                  <th className="py-3.5 px-4 font-semibold">Trạng Thái Xử Lý</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {consultations.map((item) => {
                  const currentStatus = STATUS_MAP[item.status] || STATUS_MAP.new;
                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Customer Info */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-semibold text-champagne text-sm flex items-center gap-1.5">
                          <User size={14} className="text-gold" />
                          <span>{item.full_name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <a
                            href={`tel:${item.phone}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[11px] hover:bg-emerald-500/20 transition-colors"
                          >
                            <Phone size={11} />
                            <span>{item.phone}</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.phone)}
                            className="text-beige/40 hover:text-gold transition-colors"
                            title="Sao chép số điện thoại"
                          >
                            {copiedPhone === item.phone ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          </button>
                        </div>
                        {item.email && (
                          <div className="flex items-center gap-1 text-[11px] text-beige/50 mt-1">
                            <Mail size={11} />
                            <span>{item.email}</span>
                          </div>
                        )}
                        {item.address && (
                          <div className="flex items-start gap-1 text-[11px] text-beige/50 mt-1 max-w-xs">
                            <MapPin size={12} className="shrink-0 mt-0.5 text-amber-500" />
                            <span className="line-clamp-2">{item.address}</span>
                          </div>
                        )}
                      </td>

                      {/* Space & Budget */}
                      <td className="py-4 px-4 align-top">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-gold/10 text-gold font-medium text-[11px] border border-gold/20">
                          {item.space_type || "Không gian cao cấp"}
                        </span>
                        <div className="text-[11px] text-beige/60 mt-1.5 font-medium">
                          Ngân sách: <span className="text-champagne font-semibold">{item.budget_range || "Thỏa thuận"}</span>
                        </div>
                      </td>

                      {/* Preferred Date */}
                      <td className="py-4 px-4 align-top">
                        <div className="flex items-center gap-1.5 text-beige font-mono text-xs">
                          <Calendar size={13} className="text-gold" />
                          <span>{item.preferred_date ? new Date(item.preferred_date).toLocaleDateString("vi-VN") : "Khảo sát sớm nhất"}</span>
                        </div>
                        <span className="text-[10px] text-beige/40 block mt-1">
                          Đăng ký: {new Date(item.created_at).toLocaleDateString("vi-VN")}
                        </span>
                      </td>

                      {/* Message */}
                      <td className="py-4 px-4 align-top max-w-xs">
                        <p className="text-xs text-beige/70 leading-relaxed italic bg-black/20 p-2.5 rounded-xl border border-white/5">
                          "{item.message || "Khách hàng mong muốn kiến trúc sư liên hệ tư vấn trực tiếp."}"
                        </p>
                      </td>

                      {/* Status Selector */}
                      <td className="py-4 px-4 align-top">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className={`text-xs px-2.5 py-1.5 rounded-xl border font-medium focus:outline-none transition-all cursor-pointer ${currentStatus.bg} ${currentStatus.color} [&>option]:bg-charcoal [&>option]:text-beige`}
                        >
                          <option value="new">Mới Tiếp Nhận</option>
                          <option value="contacted">Đã Gọi Điện</option>
                          <option value="scheduled">Đã Lên Lịch Hẹn</option>
                          <option value="completed">Tư Vấn Thành Công</option>
                          <option value="cancelled">Đã Hủy</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 align-top text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="Xóa yêu cầu"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
