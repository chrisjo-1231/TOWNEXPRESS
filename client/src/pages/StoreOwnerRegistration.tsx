
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Store,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  ArrowLeft,
  Truck,
  Eye,
  EyeOff,
  Package,
  ShieldCheck,
  Building2,
  FileText,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type RegistrationForm = {
  name: string;
  email: string;
  phone: string;
  password: string;
  storeName: string;
  storeDescription: string;
  storeAddress: string;
  barangay: string;
  storePhone: string;
  category: string;
};

const initialForm: RegistrationForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  storeName: "",
  storeDescription: "",
  storeAddress: "",
  barangay: "",
  storePhone: "",
  category: "GROCERY",
};

export default function StoreOwnerRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegistrationForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form.password.length < 8) {
      toast.error("Password must contain at least 8 characters.");
      return;
    }

    if (form.password.length > 72) {
      toast.error("Password must not exceed 72 characters.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/store-owners/register`, {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        storeName: form.storeName.trim(),
        storeDescription: form.storeDescription.trim() || undefined,
        storeAddress: form.storeAddress.trim(),
        barangay: form.barangay.trim(),
        storePhone: form.storePhone.trim() || undefined,
      });

      toast.success("Store application submitted successfully!");

      navigate("/store-registration-success");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Registration failed. Please try again.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

  const iconInputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

  const labelClass =
    "mb-2 block text-sm font-bold text-slate-700";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-8">
      {/* BACKGROUND DECORATIONS */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-orange-300/30 blur-3xl" />

      <div className="relative grid w-full max-w-7xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-slate-300/50 lg:grid-cols-[0.85fr_1.15fr]">

        {/* LEFT BRANDING PANEL */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-slate-950 p-12 text-white lg:flex">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[40px] border-white/5" />
          <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full border-[50px] border-white/5" />

          {/* BRAND */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-lg">
              <Truck size={28} />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight">
                TownExpress
              </h1>
              <p className="text-xs tracking-widest text-blue-200">
                DELIVERY MANAGEMENT SYSTEM
              </p>
            </div>
          </div>

          {/* MAIN MESSAGE */}
          <div className="relative z-10 my-12">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-blue-100 backdrop-blur">
              <Store size={16} />
              Become a Local Business Partner
            </div>

            <h2 className="max-w-lg text-5xl font-black leading-tight tracking-tight">
              Grow your business.
              <span className="mt-2 block text-blue-300">
                Reach more customers.
              </span>
            </h2>

            <p className="mt-6 max-w-md text-base leading-7 text-blue-100/80">
              Bring your store into the TownExpress delivery network.
              Manage your products, receive customer orders, and grow
              your business within your municipality.
            </p>

            {/* FEATURES */}
            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                  <Package size={22} />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Manage Your Products
                  </h3>
                  <p className="text-sm text-blue-100/70">
                    Organize your store inventory in one place.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                  <Truck size={22} />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Receive Delivery Orders
                  </h3>
                  <p className="text-sm text-blue-100/70">
                    Connect with customers in your community.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                  <ShieldCheck size={22} />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Verified Store Application
                  </h3>
                  <p className="text-sm text-blue-100/70">
                    Your application will be reviewed by an administrator.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 border-t border-white/10 pt-6 text-xs text-blue-200/70">
            © {new Date().getFullYear()} TownExpress. All rights reserved.
          </div>
        </div>

        {/* RIGHT REGISTRATION FORM */}
        <div className="px-5 py-8 sm:px-10 lg:px-12 lg:py-10">

          {/* MOBILE BRAND */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
              <Truck size={27} />
            </div>

            <div>
              <h1 className="text-2xl font-black text-slate-900">
                TownExpress
              </h1>
              <p className="text-xs font-medium tracking-widest text-slate-400">
                DELIVERY MANAGEMENT
              </p>
            </div>
          </div>

          <div className="mx-auto max-w-2xl">

            {/* BACK BUTTON */}
            <Link
              to="/"
              className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft size={17} />
              Back to Home
            </Link>

            {/* HEADING */}
            <div className="mb-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Building2 size={24} />
              </div>

              <h2 className="text-3xl font-black tracking-tight text-slate-900">
                Register Your Store
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Join TownExpress and make your business available
                to customers in your municipality.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

              {/* OWNER INFORMATION */}
              <section>
                <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <User size={20} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Owner Information
                    </h3>
                    <p className="text-xs text-slate-400">
                      Personal details and account credentials
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">

                  {/* NAME */}
                  <div className="sm:col-span-2">
                    <label className={labelClass}>
                      Full Name <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 text-slate-400" size={18} />

                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className={iconInputClass}
                        placeholder="Enter your full name"
                        autoComplete="name"
                        required
                        minLength={2}
                      />
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label className={labelClass}>
                      Email Address <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={18} />

                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className={iconInputClass}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  {/* PHONE */}
                  <div>
                    <label className={labelClass}>
                      Phone Number
                      <span className="ml-1 font-normal text-slate-400">
                        (Optional)
                      </span>
                    </label>

                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 text-slate-400" size={18} />

                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className={iconInputClass}
                        placeholder="09XXXXXXXXX"
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  {/* PASSWORD */}
                  <div className="sm:col-span-2">
                    <label className={labelClass}>
                      Password <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={18} />

                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className={`${iconInputClass} pr-12`}
                        placeholder="At least 8 characters"
                        autoComplete="new-password"
                        minLength={8}
                        maxLength={72}
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 transition hover:text-blue-600"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                      </button>
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      Use at least 8 characters for your password.
                    </p>
                  </div>
                </div>
              </section>

              {/* BUSINESS INFORMATION */}
              <section>
                <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Store size={20} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Business Information
                    </h3>
                    <p className="text-xs text-slate-400">
                      Details about your store
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">

                  {/* STORE NAME */}
                  <div className="sm:col-span-2">
                    <label className={labelClass}>
                      Store Name <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <Store className="absolute left-3.5 top-3.5 text-slate-400" size={18} />

                      <input
                        name="storeName"
                        value={form.storeName}
                        onChange={handleChange}
                        className={iconInputClass}
                        placeholder="Enter your store name"
                        required
                      />
                    </div>
                  </div>

                  {/* DESCRIPTION */}
                  <div className="sm:col-span-2">
                    <label className={labelClass}>
                      Store Description
                      <span className="ml-1 font-normal text-slate-400">
                        (Optional)
                      </span>
                    </label>

                    <div className="relative">
                      <FileText className="absolute left-3.5 top-3.5 text-slate-400" size={18} />

                      <textarea
                        name="storeDescription"
                        value={form.storeDescription}
                        onChange={handleChange}
                        className={`${iconInputClass} resize-none`}
                        rows={3}
                        placeholder="Tell customers about your business..."
                      />
                    </div>
                  </div>

                  {/* CATEGORY */}
                  <div>
                    <label className={labelClass}>
                      Store Category <span className="text-red-500">*</span>
                    </label>

                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    >
                      <option value="GROCERY">Grocery</option>
                      <option value="RESTAURANT">Restaurant</option>
                      <option value="PHARMACY">Pharmacy</option>
                      <option value="WATER_STATION">Water Station</option>
                      <option value="CONVENIENCE_STORE">Convenience Store</option>
                      <option value="BAKERY">Bakery</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  {/* STORE PHONE */}
                  <div>
                    <label className={labelClass}>
                      Store Phone
                      <span className="ml-1 font-normal text-slate-400">
                        (Optional)
                      </span>
                    </label>

                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 text-slate-400" size={18} />

                      <input
                        type="tel"
                        name="storePhone"
                        value={form.storePhone}
                        onChange={handleChange}
                        className={iconInputClass}
                        placeholder="Store contact number"
                      />
                    </div>
                  </div>

                  {/* ADDRESS */}
                  <div className="sm:col-span-2">
                    <label className={labelClass}>
                      Complete Store Address <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 text-slate-400" size={18} />

                      <input
                        name="storeAddress"
                        value={form.storeAddress}
                        onChange={handleChange}
                        className={iconInputClass}
                        placeholder="Street, building, or landmark"
                        required
                      />
                    </div>
                  </div>

                  {/* BARANGAY */}
                  <div className="sm:col-span-2">
                    <label className={labelClass}>
                      Barangay <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 text-slate-400" size={18} />

                      <input
                        name="barangay"
                        value={form.barangay}
                        onChange={handleChange}
                        className={iconInputClass}
                        placeholder="Enter your barangay"
                        required
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* APPLICATION NOTICE */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <ShieldCheck size={21} />
                  </div>

                  <div>
                    <h4 className="font-bold text-blue-900">
                      Application Review Process
                    </h4>

                    <p className="mt-1 text-sm leading-6 text-blue-800/80">
                      Your store application will be reviewed by the
                      TownExpress administrator. You cannot manage products
                      or receive customer orders until your application
                      is approved.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 border-t border-blue-200/70 pt-4 text-xs font-medium text-blue-800">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={15} />
                    Submit application
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={15} />
                    Admin review
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={15} />
                    Store approval
                  </span>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    Submit Store Application
                    <ArrowRight
                      size={19}
                      className="transition group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            {/* LOGIN LINK */}
            <p className="mt-7 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-blue-600 transition hover:text-blue-800"
              >
                Sign In
              </Link>
            </p>

            {/* SECURITY FOOTER */}
            <div className="mt-7 flex items-center justify-center gap-2 border-t border-slate-100 pt-6 text-xs text-slate-400">
              <ShieldCheck size={16} className="text-green-500" />
              Your business information is securely submitted.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
