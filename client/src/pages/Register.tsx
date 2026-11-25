
import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Truck,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Package,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function updateField(field: string, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      toast.error("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
      });

      toast.success("Account created successfully!");

      navigate("/customer/customerdashboard", {
        replace: true,
      });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-8">

      {/* BACKGROUND DECORATIONS */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-orange-300/30 blur-3xl" />

      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-slate-300/50 lg:min-h-[760px] lg:grid-cols-2">

        {/* LEFT BRANDING SECTION */}
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

          {/* BRAND MESSAGE */}
          <div className="relative z-10 my-12">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-blue-100 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Join our growing community
            </div>

            <h2 className="max-w-lg text-5xl font-black leading-tight tracking-tight">
              Your community.
              <span className="mt-2 block text-blue-300">
                Your convenience.
              </span>
            </h2>

            <p className="mt-6 max-w-md text-base leading-7 text-blue-100/80">
              Create your account and experience a convenient way
              to shop from local businesses and receive deliveries.
            </p>

            {/* FEATURES */}
            <div className="mt-10 space-y-4">

              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                  <Package size={22} />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Explore Local Stores
                  </h3>
                  <p className="text-sm text-blue-100/70">
                    Find products from businesses near you.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                  <MapPin size={22} />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Convenient Delivery
                  </h3>
                  <p className="text-sm text-blue-100/70">
                    Get your orders delivered to your doorstep.
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className="relative z-10 border-t border-white/10 pt-6 text-xs text-blue-200/70">
            © {new Date().getFullYear()} TownExpress. All rights reserved.
          </div>
        </div>

        {/* RIGHT REGISTER SECTION */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-14">

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

          <div className="mx-auto w-full max-w-md">

            {/* HEADING */}
            <div className="mb-7">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <User size={23} />
              </div>

              <h2 className="text-3xl font-black tracking-tight text-slate-900">
                Create Account
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Join TownExpress and start enjoying convenient local deliveries.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* FULL NAME */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Full Name
                </label>

                <div className="group flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
                  <User
                    size={19}
                    className="shrink-0 text-slate-400 transition group-focus-within:text-blue-600"
                  />

                  <input
                    type="text"
                    required
                    autoComplete="name"
                    minLength={2}
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-transparent px-3 py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Email Address
                </label>

                <div className="group flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
                  <Mail
                    size={19}
                    className="shrink-0 text-slate-400 transition group-focus-within:text-blue-600"
                  />

                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent px-3 py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* PHONE */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Phone Number
                  <span className="ml-1 font-normal text-slate-400">
                    (Optional)
                  </span>
                </label>

                <div className="group flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
                  <Phone
                    size={19}
                    className="shrink-0 text-slate-400 transition group-focus-within:text-blue-600"
                  />

                  <input
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="09XXXXXXXXX"
                    className="w-full bg-transparent px-3 py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Password
                </label>

                <div className="group flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
                  <Lock
                    size={19}
                    className="shrink-0 text-slate-400 transition group-focus-within:text-blue-600"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    minLength={8}
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full bg-transparent px-3 py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="shrink-0 text-slate-400 transition hover:text-blue-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Confirm Password
                </label>

                <div className="group flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
                  <Lock
                    size={19}
                    className="shrink-0 text-slate-400 transition group-focus-within:text-blue-600"
                  />

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      updateField("confirmPassword", e.target.value)
                    }
                    placeholder="Re-enter your password"
                    className="w-full bg-transparent px-3 py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="shrink-0 text-slate-400 transition hover:text-blue-600"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="group mt-3 flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create My Account
                    <ArrowRight
                      size={19}
                      className="transition group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            {/* LOGIN LINK */}
            <div className="mt-7 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-bold text-blue-600 transition hover:text-blue-800"
                >
                  Sign In
                </Link>
              </p>
            </div>

            {/* SECURITY FOOTER */}
            <div className="mt-8 flex items-center justify-center gap-2 border-t border-slate-100 pt-6 text-xs text-slate-400">
              <ShieldCheck size={16} className="text-green-500" />
              Your account information is securely protected.
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
