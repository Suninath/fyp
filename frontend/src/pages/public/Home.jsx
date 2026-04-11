import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "../../ui/ui/button";
import { Card, CardContent } from "../../ui/ui/card";
import {
  ArrowRight,
  Car,
  CheckCircle2,
  Clock3,
  MapPin,
  PhoneCall,
} from "lucide-react";
import Navigation from "../../components/common/Navigation";
import Footer from "../../components/common/Footer";

const Home = () => {
  const navigate = useNavigate();
  const { authenticate, role } = useSelector((state) => state.auth);
  const fallbackCarImage =
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80";

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = fallbackCarImage;
  };

  const stats = [
    { value: "2,800+", label: "Active Listings" },
    { value: "1,200+", label: "Completed Bookings" },
    { value: "350+", label: "Verified Sellers" },
    { value: "4.8/5", label: "Average User Feedback" },
  ];

  const featuredCars = [
    {
      name: "Hyundai Creta",
      type: "For Sale",
      location: "Kathmandu",
      price: "Rs 28,50,000",
      image:
        "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=1200&q=80",
    },
    {
      name: "Suzuki Swift",
      type: "For Rent",
      location: "Pokhara",
      price: "Rs 4,000/day",
      image:
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
    },
    {
      name: "BYD Dolphin",
      type: "For Sale",
      location: "Lalitpur",
      price: "Rs 41,00,000",
      image:
        "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  const marketplaceCars = [
    {
      label: "SUV EV",
      meta: "Electric + long-range options",
      query: "suv",
      image:
        "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1200&q=80",
    },
    {
      label: "SUV 5 Seater",
      meta: "Family and road-trip ready",
      query: "suv",
      image:
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80",
    },
    {
      label: "Hatchback",
      meta: "City-friendly daily drive",
      query: "hatchback",
      image:
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    },
    {
      label: "4WD Pickup",
      meta: "Utility and off-road routes",
      query: "pickup",
      image:
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
    },
    {
      label: "Sedan",
      meta: "Comfort commute and highway",
      query: "sedan",
      image:
        "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1200&q=80",
    },
    {
      label: "Premium",
      meta: "High-end cars for special trips",
      query: "premium",
      image:
        "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  const steps = [
    {
      title: "Choose your route",
      description: "Select pickup location, dates, and trip type.",
    },
    {
      title: "Compare verified vehicles",
      description: "See details, pricing, and availability in one place.",
    },
    {
      title: "Book and drive",
      description: "Confirm booking, complete payment, and start your trip.",
    },
  ];

  const ctaTarget = authenticate
    ? role === "admin"
      ? "/admin/dashboard"
      : "/vehicles/browse"
    : "/signup";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-slate-900">
      <Navigation />

      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-purple/5 via-blue/5 to-transparent">
        <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-purple/15 blur-3xl" />
        <div className="absolute -bottom-20 left-0 h-80 w-80 rounded-full bg-blue/15 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-purple/30 bg-purple/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-purple">
              <MapPin className="h-4 w-4" />
              Nepal second-hand vehicle marketplace
            </span>

            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Buy, sell, or rent
              <span className="block bg-gradient-to-r from-purple to-blue bg-clip-text text-transparent">second-hand cars with confidence.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Second Auto Gear is built for the complete used-car cycle: discover verified listings, list your own car for sale,
              or rent vehicles for short and long trips across Nepal.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                className="h-11 rounded-md bg-gradient-to-r from-purple to-blue px-6 text-sm font-semibold text-white hover:from-purple/90 hover:to-blue/90"
                onClick={() => navigate("/vehicles/browse?type=buy")}
              >
                Buy Used Cars
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Verified listing checks
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Buy, sell, and rental support
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-[0_18px_50px_-20px_rgba(15,23,42,0.35)] sm:p-5">
            <div className="flex items-center justify-between pb-3">
              <h2 className="text-lg font-bold text-slate-900">Popular right now</h2>
              <span className="rounded-full bg-purple/10 px-3 py-1 text-xs font-semibold text-purple">Buy • Sell • Rent</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {featuredCars.slice(0, 2).map((car) => (
                <button
                  key={car.name}
                  type="button"
                  onClick={() => navigate("/vehicles/browse")}
                  className="group relative h-48 overflow-hidden rounded-xl"
                >
                  <img
                    src={car.image}
                    alt={car.name}
                    onError={handleImageError}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute left-3 right-3 bottom-3 text-left text-white">
                    <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold">
                      <span className="rounded-full bg-white/20 px-2 py-0.5">{car.type}</span>
                      <span className="rounded-full bg-white/20 px-2 py-0.5">{car.location}</span>
                    </div>
                    <p className="text-base font-bold leading-tight">{car.name}</p>
                    <p className="mt-1 text-sm font-semibold text-purple-100">{car.price}</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => navigate("/vehicles/browse")}
              className="group relative mt-3 h-40 w-full overflow-hidden rounded-xl"
            >
              <img
                src={featuredCars[2].image}
                alt={featuredCars[2].name}
                onError={handleImageError}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/10" />
              <div className="absolute inset-0 flex items-end justify-between p-4 text-white">
                <div className="text-left">
                  <p className="text-xs font-semibold uppercase tracking-wide text-purple-100">Featured EV</p>
                  <p className="text-lg font-bold">{featuredCars[2].name}</p>
                  <p className="text-sm text-purple-100">{featuredCars[2].price}</p>
                </div>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">View listing</span>
              </div>
            </button>

            <Button
              className="mt-4 h-11 w-full rounded-md bg-gradient-to-r from-purple to-blue text-sm font-semibold text-white hover:from-purple/90 hover:to-blue/90"
              onClick={() => navigate("/vehicles/browse")}
            >
              Explore Used Car Marketplace
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <div className="flex flex-col gap-6 py-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Ready to start?</p>
              <h2 className="mt-2 text-3xl font-extrabold text-black sm:text-4xl">Find your next vehicle with confidence.</h2>
              <p className="mt-3 max-w-2xl text-sm text-slate-700 sm:text-base">
                Create an account to save favorites, manage bookings, and track payment status.
              </p>
            </div>
            <Button
              className="h-11 bg-emerald-600 px-6 text-sm font-semibold bg-secondary text-white hover:bg-emerald-700"
              onClick={() => navigate(ctaTarget)}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <section className=" bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-purple">Vehicle Categories</p>
              <h2 className="mt-2 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
                Nepal&apos;s largest
                <span className="ml-2 rounded bg-emerald-400 px-2 py-0.5 text-white">USED CAR</span>
                <span className="block">marketplace</span>
              </h2>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                Browse by category and quickly jump into listings that fit your route and budget.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-fit border-slate-300 text-slate-700 hover:bg-slate-100"
              onClick={() => navigate("/vehicles/browse")}
            >
              View all vehicles
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {marketplaceCars.map((car) => (
              <button
                key={car.label}
                type="button"
                onClick={() => navigate(`/vehicles/browse?category=${car.query}`)}
                className="group relative aspect-[16/10] overflow-hidden rounded-xl border border-slate-200"
              >
                <img
                  src={car.image}
                  alt={car.label}
                  onError={handleImageError}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3">
                  <div className="text-left text-white">
                    <p className="text-sm font-bold">{car.label}</p>
                    <p className="text-xs text-slate-200">{car.meta}</p>
                  </div>
                  <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white">Explore</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <Card key={item.label} className="border-slate-200 bg-white">
              <CardContent className="p-5 text-center">
                <p className="text-5xl font-black leading-none text-slate-900">{item.value}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{item.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[1.2fr_1fr] lg:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-purple">How it works</p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">As easy as it gets</h2>
            <div className="mt-6 space-y-4">
              {steps.map((step, index) => (
                <div key={step.title} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="text-xs font-bold text-purple">Step {index + 1}</p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-purple to-blue p-6 text-white lg:p-8">
            <h3 className="text-2xl font-bold">Need help before booking?</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Talk to our support team for trip planning, vehicle category advice, or payment assistance.
            </p>
            <div className="mt-6 space-y-3 text-sm">
              <p className="inline-flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-white/90" />
                +977 9800000000
              </p>
              <p className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-white/90" />
                Daily support: 8:00 AM - 8:00 PM
              </p>
              <p className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-white/90" />
                Kathmandu, Nepal
              </p>
            </div>
            <Button
              className="mt-6 w-full bg-white text-sm font-semibold text-purple hover:bg-purple-50"
              onClick={() => navigate("/contact")}
            >
              Contact Support
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
