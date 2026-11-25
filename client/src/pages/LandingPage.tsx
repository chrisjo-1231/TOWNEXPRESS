
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Store,
  Truck,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Clock,
  CheckCircle,
  Package,
} from "lucide-react";

const features = [
  {
    icon: Store,
    title: "Multiple Local Stores",
    description:
      "Discover different local stores and find the products you need in one place.",
  },
  {
    icon: Truck,
    title: "Reliable Delivery",
    description:
      "Get your orders delivered by registered TownExpress riders.",
  },
  {
    icon: MapPin,
    title: "Local Community",
    description:
      "Support local businesses and stores within your municipality.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Platform",
    description:
      "Store applications are reviewed to help maintain a reliable marketplace.",
  },
];

const steps = [
  {
    number: "01",
    title: "Choose a Store",
    description: "Browse available local stores and their products.",
  },
  {
    number: "02",
    title: "Place Your Order",
    description: "Select your products and submit your order.",
  },
  {
    number: "03",
    title: "Wait for Delivery",
    description: "A rider will deliver your order to your location.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Truck size={25} />
            </div>

            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                Town<span className="text-blue-600">Express</span>
              </h1>
              <p className="text-[10px] font-medium tracking-wider text-slate-500">
                YOUR LOCAL DELIVERY PARTNER
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-blue-600">
              How It Works
            </a>
            <a href="#partners" className="text-sm font-medium text-slate-600 hover:text-blue-600">
              For Store Owners
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Login
            </Link>

            <Link
              to="/store-registration"
              className="hidden items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 sm:inline-flex"
            >
              Register Store
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:py-28 lg:grid-cols-2 lg:px-8">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300">
              <MapPin size={15} />
              Your Municipality, One Delivery Platform
            </div>

            <h2 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Your Local Stores.
              <span className="block text-blue-400">
                Delivered to You.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 md:text-lg">
              Discover local stores, order everyday essentials, and connect
              with reliable delivery riders through TownExpress.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
              >
                Get Started
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/store-registration"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-600 px-6 py-3.5 font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                <Store size={18} />
                Become a Partner
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-400" />
                Local businesses
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-400" />
                Convenient ordering
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-400" />
                Reliable delivery
              </div>
            </div>
          </div>

          {/* HERO VISUAL */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
              <div className="rounded-2xl bg-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Welcome to
                    </p>
                    <h3 className="text-2xl font-extrabold text-slate-900">
                      TownExpress
                    </h3>
                  </div>
                  <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                    <ShoppingBag size={27} />
                  </div>
                </div>

                <div className="mt-7 rounded-2xl bg-blue-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-600 p-3 text-white">
                      <Package size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">
                        Your orders, simplified.
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Shop local. Order easily.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-orange-100 p-3 text-orange-600">
                      <Store size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">
                        Local Stores
                      </p>
                      <p className="text-xs text-slate-500">
                        Explore nearby businesses
                      </p>
                    </div>
                    <CheckCircle size={18} className="text-green-500" />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-green-100 p-3 text-green-600">
                      <Truck size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">
                        Delivery Riders
                      </p>
                      <p className="text-xs text-slate-500">
                        Bringing orders to your door
                      </p>
                    </div>
                    <CheckCircle size={18} className="text-green-500" />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-purple-100 p-3 text-purple-600">
                      <Clock size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">
                        Order Updates
                      </p>
                      <p className="text-xs text-slate-500">
                        Follow your order status
                      </p>
                    </div>
                    <CheckCircle size={18} className="text-green-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-5 hidden rounded-xl bg-green-500 px-5 py-3 text-sm font-bold text-white shadow-xl sm:block">
              Supporting Local Businesses
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
            Why TownExpress?
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 md:text-4xl">
            Everything you need, in one platform.
          </h2>
          <p className="mt-4 leading-7 text-slate-500">
            A convenient way to connect customers, local businesses, and
            delivery riders.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >
                <div className="mb-5 inline-flex rounded-xl bg-blue-50 p-3 text-blue-600">
                  <Icon size={25} />
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-500">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
              Simple Process
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 md:text-4xl">
              How TownExpress Works
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-slate-200 bg-white p-7"
              >
                <p className="text-4xl font-black text-blue-100">
                  {step.number}
                </p>
                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORE OWNER CTA */}
      <section id="partners" className="px-5 py-20 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 rounded-3xl bg-blue-600 px-7 py-12 text-center md:flex-row md:px-12 md:text-left">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-blue-50">
              For Local Business Owners
            </div>

            <h2 className="text-3xl font-extrabold text-white md:text-4xl">
              Bring Your Store to TownExpress.
            </h2>

            <p className="mt-4 leading-7 text-blue-100">
              Register your business, submit your application for review, and
              reach more customers in your community.
            </p>
          </div>

          <Link
            to="/store-registration"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-4 font-bold text-blue-700 transition hover:bg-blue-50"
          >
            Register Your Store
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-950 px-5 py-8 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h3 className="text-lg font-extrabold">
              Town<span className="text-blue-400">Express</span>
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Your Local Delivery Partner.
            </p>
          </div>

          <p className="text-center text-xs text-slate-400">
            © {new Date().getFullYear()} TownExpress. All rights reserved.
          </p>

          <Link
            to="/login"
            className="text-sm font-medium text-slate-300 hover:text-white"
          >
            Account Login
          </Link>
        </div>
      </footer>
    </div>
  );
}
