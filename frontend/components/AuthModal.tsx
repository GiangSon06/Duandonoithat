"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Mail, User, Phone, MapPin, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { useStore } from "./StoreContext";
import { authService } from "@/services/api";

export default function AuthModal() {
  const { isAuthOpen, closeAuth, authMode, openAuth, loginUser, registerUser } = useStore();

  // Form states
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Login form data
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Register form data
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    password_confirmation: "",
  });

  // Forgot password form data
  const [forgotEmail, setForgotEmail] = useState("");

  if (!isAuthOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    const res = await loginUser(loginData);
    setLoading(false);

    if (res.success) {
      if (res.user?.role === "admin") {
        setSuccessMessage("Đăng nhập quyền Quản Trị Viên thành công!");
      } else {
        setSuccessMessage("Đăng nhập thành công!");
      }
      setTimeout(() => {
        closeAuth();
        setSuccessMessage("");
      }, 800);
    } else {
      setErrorMessage(res.message || "Email hoặc mật khẩu không chính xác.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setValidationErrors({});

    if (registerData.password !== registerData.password_confirmation) {
      setErrorMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    const res = await registerUser(registerData);
    setLoading(false);

    if (res.success) {
      setSuccessMessage("Đăng ký tài khoản thành công!");
      setTimeout(() => {
        closeAuth();
        setSuccessMessage("");
      }, 1000);
    } else {
      setErrorMessage(res.message || "Đăng ký không thành công.");
      if (res.errors) {
        setValidationErrors(res.errors);
      }
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const res = await authService.forgotPassword(forgotEmail);
      if (res.success) {
        setSuccessMessage(res.message || "Đã gửi liên kết và hướng dẫn đặt lại mật khẩu về email của bạn.");
      } else {
        setErrorMessage(res.message || "Không tìm thấy tài khoản với email này.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const fillTestCustomer = () => {
    setLoginData({
      email: "customer@gmail.com",
      password: "Customer@123456",
    });
    setErrorMessage("");
  };

  const fillTestAdmin = () => {
    setLoginData({
      email: "admin@gsluxury.vn",
      password: "Admin@123456",
    });
    setErrorMessage("");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuth}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Body */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-[#FAF7F2] border border-espresso/15 shadow-2xl rounded-2xl p-6 sm:p-8 overflow-hidden z-10 max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={closeAuth}
            className="absolute top-5 right-5 p-2 text-espresso/60 hover:text-espresso rounded-full hover:bg-black/5 transition-colors"
            aria-label="Đóng"
          >
            <X size={20} strokeWidth={1.5} />
          </button>

          {/* Header & Title */}
          <div className="text-center mb-6">
            <span className="font-serif text-2xl font-bold tracking-wider text-espresso block mb-1">
              GS LUXURY
            </span>
            <p className="text-xs text-espresso/65 leading-relaxed">
              {authMode === "login"
                ? "Đăng nhập để xem hành trình đơn hàng và ưu đãi VIP"
                : authMode === "register"
                ? "Tạo tài khoản thành viên để tận hưởng đặc quyền thượng lưu"
                : "Khôi phục quyền truy cập vào tài khoản GS Luxury"}
            </p>
          </div>

          {/* Tabs Navigation (for login & register) */}
          {authMode !== "forgot" ? (
            <div className="flex border-b border-espresso/15 mb-6">
              <button
                onClick={() => {
                  openAuth("login");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  authMode === "login"
                    ? "border-b-2 border-espresso text-espresso"
                    : "text-espresso/45 hover:text-espresso"
                }`}
              >
                Đăng Nhập
              </button>
              <button
                onClick={() => {
                  openAuth("register");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  authMode === "register"
                    ? "border-b-2 border-espresso text-espresso"
                    : "text-espresso/45 hover:text-espresso"
                }`}
              >
                Đăng Ký
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-b border-espresso/15 pb-3 mb-6">
              <button
                type="button"
                onClick={() => {
                  openAuth("login");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className="text-xs text-espresso/60 hover:text-espresso font-medium flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft size={14} />
                Quay lại Đăng Nhập
              </button>
            </div>
          )}

          {/* Alert Messages */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-start gap-2"
            >
              <CheckCircle size={16} className="shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMessage}</span>
            </motion.div>
          )}

          {/* 1. LOGIN FORM */}
          {authMode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-espresso/80 mb-1.5">
                  Địa Chỉ Email *
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-espresso/40" />
                  <input
                    type="email"
                    required
                    placeholder="ví dụ: customer@gmail.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full bg-white border border-espresso/15 pl-10 pr-4 py-2.5 text-xs text-espresso rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 shadow-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-espresso/80">
                    Mật Khẩu *
                  </label>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-espresso/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full bg-white border border-espresso/15 pl-10 pr-10 py-2.5 text-xs text-espresso rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-espresso/40 hover:text-espresso"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fillTestCustomer}
                    className="text-xs text-gold hover:underline font-medium"
                    title="Tài khoản khách: customer@gmail.com"
                  >
                    ⚡ Khách
                  </button>
                  <span className="text-espresso/30 text-xs">•</span>
                  <button
                    type="button"
                    onClick={fillTestAdmin}
                    className="text-xs text-amber-700 hover:text-amber-800 hover:underline font-semibold"
                    title="Tài khoản Quản trị: admin@gsluxury.vn"
                  >
                    🛡️ Admin
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage("");
                    setSuccessMessage("");
                    openAuth("forgot");
                  }}
                  className="text-xs text-espresso/60 hover:text-gold underline font-medium transition-colors"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-espresso text-beige text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-gold hover:text-charcoal transition-all duration-300 disabled:opacity-50 shadow-sm"
              >
                {loading ? "Đang xử lý..." : "Đăng Nhập"}
              </button>
            </form>
          )}

          {/* 2. REGISTER FORM */}
          {authMode === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-espresso/80 mb-1">
                  Họ và Tên *
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-espresso/40" />
                  <input
                    type="text"
                    required
                    placeholder="ví dụ: Nguyễn Văn An"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    className="w-full bg-white border border-espresso/15 pl-10 pr-4 py-2.5 text-xs text-espresso rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 shadow-xs"
                  />
                </div>
                {validationErrors.name && (
                  <p className="text-[10px] text-red-600 mt-1">{validationErrors.name[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-espresso/80 mb-1">
                  Địa Chỉ Email *
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-espresso/40" />
                  <input
                    type="email"
                    required
                    placeholder="an.nguyen@example.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="w-full bg-white border border-espresso/15 pl-10 pr-4 py-2.5 text-xs text-espresso rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 shadow-xs"
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-[10px] text-red-600 mt-1">{validationErrors.email[0]}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-espresso/80 mb-1">
                    Số Điện Thoại
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso/40" />
                    <input
                      type="tel"
                      placeholder="0901234567"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      className="w-full bg-white border border-espresso/15 pl-8 pr-2 py-2.5 text-xs text-espresso rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-espresso/80 mb-1">
                    Địa Chỉ Giao Hàng
                  </label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso/40" />
                    <input
                      type="text"
                      placeholder="Số nhà, tên đường"
                      value={registerData.address}
                      onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                      className="w-full bg-white border border-espresso/15 pl-8 pr-2 py-2.5 text-xs text-espresso rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 shadow-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-espresso/80 mb-1">
                  Mật Khẩu * (Tối thiểu 6 ký tự)
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-espresso/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="w-full bg-white border border-espresso/15 pl-10 pr-10 py-2.5 text-xs text-espresso rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-espresso/40 hover:text-espresso"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-espresso/80 mb-1">
                  Xác Nhận Mật Khẩu *
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-espresso/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={registerData.password_confirmation}
                    onChange={(e) => setRegisterData({ ...registerData, password_confirmation: e.target.value })}
                    className="w-full bg-white border border-espresso/15 pl-10 pr-4 py-2.5 text-xs text-espresso rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 shadow-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-espresso text-beige text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-gold hover:text-charcoal transition-all duration-300 disabled:opacity-50 shadow-sm"
              >
                {loading ? "Đang tạo tài khoản..." : "Đăng Ký Thành Viên"}
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FORM */}
          {authMode === "forgot" && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-espresso/80 mb-1.5">
                  Địa Chỉ Email Cần Khôi Phục *
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-espresso/40" />
                  <input
                    type="email"
                    required
                    placeholder="ví dụ: customer@gmail.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-white border border-espresso/15 pl-10 pr-4 py-2.5 text-xs text-espresso rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 shadow-xs"
                  />
                </div>
                <p className="text-[11px] text-espresso/60 mt-1.5 leading-relaxed">
                  Nhập địa chỉ email quý khách đã sử dụng để đăng ký tài khoản. Hệ thống GS Luxury sẽ tự động gửi mã xác nhận và hướng dẫn đặt lại mật khẩu về hòm thư của quý khách.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-espresso text-beige text-xs font-semibold tracking-wide uppercase rounded-lg hover:bg-gold hover:text-charcoal transition-all duration-300 disabled:opacity-50 shadow-sm"
              >
                {loading ? "Đang gửi email..." : "Gửi Hướng Dẫn Về Email"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => openAuth("login")}
                  className="text-xs text-gold hover:underline font-medium"
                >
                  ← Quay lại Đăng Nhập
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
