
import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Truck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  MapPin,
  Package,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const loggedInUser = await login(email.trim(), password);

      toast.success("Welcome to TownExpress!");

      switch (loggedInUser.role) {
        case "ADMIN":
          navigate("/admin", { replace: true });
          break;

        case "STORE_OWNER":
          navigate("/store-owner", { replace: true });
          break;

        case "STORE_STAFF":
          navigate("/staff", { replace: true });
          break;

        case "RIDER":
          navigate("/rider", { replace: true });
          break;

        case "CUSTOMER":
          navigate("/customer/customerdashboard", {
            replace: true,
          });
          break;

        default:
          toast.error("Your account role is not recognized.");
          navigate("/login", { replace: true });
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Login failed. Please try again."
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

      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-slate-300/50 lg:min-h-[680px] lg:grid-cols-2">

        {/* LEFT BRANDING SECTION */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-slate-950 p-12 text-white lg:flex">

          {/* Decorative circles */}
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[40px] border-white/5" />
          <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full border-[50px] border-white/5" />

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

          <div className="relative z-10 my-12">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-blue-100 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Your local delivery partner
            </div>

            <h2 className="max-w-lg text-5xl font-black leading-tight tracking-tight">
              Everything you need.
              <span className="mt-2 block text-blue-300">
                Delivered.
              </span>
            </h2>

            <p className="mt-6 max-w-md text-base leading-7 text-blue-100/80">
              Connecting local stores, customers, and riders through
              one convenient delivery platform.
            </p>

            {/* Feature Cards */}
            <div className="mt-10 space-y-4">

              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                  <Package size={22} />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Shop Local
                  </h3>
                  <p className="text-sm text-blue-100/70">
                    Discover products from local businesses.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                  <MapPin size={22} />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Track Your Orders
                  </h3>
                  <p className="text-sm text-blue-100/70">
                    Stay updated on your delivery progress.
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-blue-200/70">
            <span>© {new Date().getFullYear()} TownExpress</span>
            <span>Delivering convenience to your community.</span>
          </div>
        </div>

        {/* RIGHT LOGIN SECTION */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-14">

          {/* Mobile Logo */}
          <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
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

            <div className="mb-9">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Lock size={23} />
              </div>

              <h2 className="text-3xl font-black tracking-tight text-slate-900">
                Welcome Back!
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to your account and continue using TownExpress.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent px-3 py-4 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">
                    Password
                  </label>
                </div>

                <div className="group flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
                  <Lock
                    size={19}
                    className="shrink-0 text-slate-400 transition group-focus-within:text-blue-600"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-transparent px-3 py-4 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="shrink-0 text-slate-400 transition hover:text-blue-600"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {/* SIGN IN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In to Your Account
                    <ArrowRight
                      size={19}
                      className="transition group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            {/* REGISTER */}
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-bold text-blue-600 transition hover:text-blue-800"
                >
                  Create an account
                </Link>
              </p>
            </div>

            {/* SECURITY FOOTER */}
            <div className="mt-10 flex items-center justify-center gap-2 border-t border-slate-100 pt-6 text-xs text-slate-400">
              <ShieldCheck size={16} className="text-green-500" />
              Secure authentication powered by TownExpress
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
