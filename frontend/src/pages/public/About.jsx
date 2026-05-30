import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../ui/ui/button";
import { Card, CardContent } from "../../ui/ui/card";
import {
  ArrowRight,
  BadgeCheck,
  Car,
  Clock3,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import Navigation from "../../components/common/Navigation";
import Footer from "../../components/common/Footer";
import { getPublicVehicles } from "../../rtk/thunk/vehicleThunk";

const About = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { authenticate, role } = useSelector((state) => state.auth);
  const { publicVehicles } = useSelector((state) => state.vehicle);
  const fallbackCarImage =
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80";

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = fallbackCarImage;
  };

  const getVehicleImageUrl = (path) => {
    if (!path) return fallbackCarImage;
    if (path.startsWith("http") || path.startsWith("data:")) return path;
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `${backendUrl}/${cleanPath.replace(/\\/g, "/")}`;
  };

  useEffect(() => {
    if (publicVehicles.length === 0) {
      dispatch(getPublicVehicles({ limit: 6, page: 1, category: "Buy/Sell" }));
    }
  }, [dispatch, publicVehicles.length]);

  const values = [
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Trust over hype",
      description:
        "We prioritize listing clarity, verification checks, and consistent communication at every step.",
    },
    {
      icon: <Wrench className="w-6 h-6" />,
      title: "Practical product decisions",
      description:
        "Features are built from real support issues and user feedback, not just design trends.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "People-first operations",
      description:
        "Support, moderation, and admin workflows are designed to keep the marketplace reliable.",
    },
  ];

  const journey = [
    {
      year: "2021",
      title: "First platform launch",
      detail: "Started with basic listings and direct buyer-seller discovery.",
    },
    {
      year: "2022",
      title: "Verification workflow",
      detail: "Introduced review and moderation checks for listing quality.",
    },
    {
      year: "2023",
      title: "Booking and payment flow",
      detail: "Enabled clearer reservation handling and online payment tracking.",
    },
    {
      year: "2024-2026",
      title: "Operational maturity",
      detail: "Expanded insights, communication tools, and UX consistency across pages.",
    },
  ];

  const marketplaceCars = useMemo(
    () =>
      publicVehicles.slice(0, 6).map((vehicle) => ({
        id: vehicle.id,
        label: `${vehicle.make || ""} ${vehicle.model || vehicle.name || "Vehicle"}`.trim(),
        image: getVehicleImageUrl(vehicle.images?.[0]),
      })),
    [publicVehicles],
  );

  const ctaTarget = authenticate
    ? role === "admin"
      ? "/admin/dashboard"
      : "/vehicles/browse"
    : "/signup";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-slate-900">
      <Navigation />

      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-purple/5 via-blue/5 to-transparent">
        <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-purple/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple/30 bg-purple/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-purple">
            <Sparkles className="h-4 w-4" />
            About Second Auto Gear
          </span>

          <div className="mt-5 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Built to make vehicle decisions
                <span className="block bg-gradient-to-r from-purple to-blue bg-clip-text text-transparent">clear and dependable.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Second Auto Gear is a Nepal-focused marketplace for buying, selling, and renting vehicles. We built the
                platform around real transaction friction points: unclear listings, difficult comparison, and uncertain
                payment flow.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  className="h-11 rounded-md bg-gradient-to-r from-purple to-blue px-6 text-sm font-semibold text-white hover:from-purple/90 hover:to-blue/90"
                  onClick={() => navigate(ctaTarget)}
                >
                  Start with Second Auto Gear
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-11 rounded-md border-gray-300 px-6 text-sm font-semibold text-gray-700 hover:border-purple hover:text-purple hover:bg-purple/5"
                  onClick={() => navigate("/contact")}
                >
                  Contact Team
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">What we focus on daily</h2>
              <div className="mt-4 space-y-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <span className="font-semibold">Listing quality:</span> consistent details and moderation checks.
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <span className="font-semibold">Support response:</span> practical help before and after booking.
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <span className="font-semibold">Flow clarity:</span> fewer surprises in booking and payment steps.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">What we list across Second Auto Gear</h2>
            <p className="mt-3 text-sm text-slate-600 sm:text-base">
              From affordable hatchbacks to premium SUVs, our marketplace is built for real buyer and renter needs.
            </p>
          </div>

          {marketplaceCars.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {marketplaceCars.map((car) => (
                <button
                  key={car.id}
                  type="button"
                  onClick={() => navigate(`/vehicles/public/${car.id}`)}
                  className="group relative aspect-[16/10] overflow-hidden rounded-xl border border-slate-200"
                >
                  <img
                    src={car.image}
                    alt={car.label}
                    onError={handleImageError}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-x-3 bottom-3 flex items-center">
                    <span className="text-sm font-bold text-white">{car.label}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p className="text-base font-semibold text-slate-900">No public cars listed yet</p>
              <p className="mt-1 text-sm text-slate-600">Once listings are added, this section will show your own marketplace cars.</p>
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white/70">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-purple">Core Values</p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">How we make product choices</h2>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {values.map((value) => (
              <Card
                key={value.title}
                className="border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="inline-flex rounded-lg bg-purple/10 p-2 text-purple">{value.icon}</div>
                  <h3 className="mt-3 text-lg font-bold text-slate-900">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[1.2fr_1fr] lg:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-purple">Our Journey</p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">Built step by step with users</h2>

            <div className="mt-6 space-y-4">
              {journey.map((item) => (
                <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-xs font-bold text-purple">{item.year}</p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-purple to-blue p-6 text-white lg:p-8">
            <h3 className="text-2xl font-bold">Marketplace principles</h3>
            <div className="mt-5 space-y-4 text-sm text-slate-300">
              <p className="inline-flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-white/90" />
                Accuracy before scale
              </p>
              <p className="inline-flex items-center gap-2">
                <Car className="h-4 w-4 text-white/90" />
                Vehicle-first user experience
              </p>
              <p className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-white/90" />
                Built for real Nepal routes
              </p>
              <p className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-white/90" />
                Reliable support operations
              </p>
            </div>
            <Button
              className="mt-6 w-full bg-white text-sm font-semibold text-purple hover:bg-purple-50"
              onClick={() => navigate("/vehicles/browse")}
            >
              Explore Vehicles
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-purple via-blue to-purple">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-purple-100">Join us</p>
                <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">Buy, sell, or rent with better visibility.</h2>
                <p className="mt-3 max-w-2xl text-sm text-purple-100 sm:text-base">
                  If you value clearer listings and practical support, Second Auto Gear is built for you.
                </p>
              </div>
              <Button
                className="h-11 bg-white px-6 text-sm font-semibold text-purple hover:bg-purple-50"
                onClick={() => navigate(ctaTarget)}
              >
                Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
