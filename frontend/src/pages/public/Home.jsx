import React, { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../ui/ui/button";
import { Card, CardContent } from "../../ui/ui/card";
import {
  ArrowRight,
  Car,
  CheckCircle2,
  Clock3,
  ChevronLeft,
  ChevronRight,
  MapPin,
  PhoneCall,
} from "lucide-react";
import { getPublicVehicles, getPublicRentalVehicles } from "../../rtk/thunk/vehicleThunk";
import Navigation from "../../components/common/Navigation";
import Footer from "../../components/common/Footer";

const PopularListingCard = ({ vehicle, variant = "sale", navigate, getVehicleImageUrl, handleImageError }) => {
  const imageUrl = getVehicleImageUrl(vehicle.images?.[0]);
  const isRental = variant === "rental";

  return (
    <article className="w-[280px] sm:w-[320px] flex-none snap-start h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="group flex h-full w-full flex-col text-left">
        <div className="relative h-52 sm:h-56 overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200 shadow-inner">
          <img
            src={imageUrl}
            alt={vehicle.name}
            onError={handleImageError}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="flex flex-1 flex-col space-y-2 p-4">
          <h3 className="truncate text-lg font-bold leading-tight text-slate-900">
            {vehicle.make} {vehicle.model}
          </h3>

          <p className="text-sm text-slate-500 min-h-[20px]">
            {vehicle.year || "N/A"} • {vehicle.fuelType || "N/A"} • {vehicle.transmission || "N/A"}
          </p>

          <p className="text-3xl font-extrabold text-primary">
            Rs. {Number(vehicle.price || 0).toLocaleString("en-IN")}
            {isRental ? " / day" : ""}
          </p>

          <Button
            type="button"
            className="mt-auto h-11 w-full rounded-lg border-2 border-primary bg-white text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
            onClick={() => navigate(`/vehicles/public/${vehicle.id}`)}
          >
            {isRental ? "Rent Now" : "View Details"}
          </Button>
        </div>
      </div>
    </article>
  );
};

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { authenticate, role } = useSelector((state) => state.auth);
  const { publicVehicles, publicRentalVehicles } = useSelector((state) => state.vehicle);
  const popularCarsRef = useRef(null);
  const popularRentalsRef = useRef(null);
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

  const scrollPopularList = (targetRef, direction) => {
    targetRef.current?.scrollBy({
      left: direction * 320,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    dispatch(getPublicVehicles({ limit: 100, page: 1, category: "Buy/Sell" }));
    dispatch(getPublicRentalVehicles({ limit: 100, page: 1 }));
  }, [dispatch]);

  const stats = [
    { value: "2,800+", label: "Active Listings" },
    { value: "1,200+", label: "Completed Bookings" },
    { value: "350+", label: "Verified Sellers" },
    { value: "4.8/5", label: "Average User Feedback" },
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

  const addFirstListingTarget = authenticate ? "/user/create-vehicle" : "/signup";

  const getRankingScore = (vehicle) => {
    const popularity =
      Number(vehicle?.bookingCount || 0) +
      Number(vehicle?.totalBookings || 0) +
      Number(vehicle?.viewCount || 0) +
      Number(vehicle?.views || 0);

    const createdAtScore = vehicle?.createdAt ? new Date(vehicle.createdAt).getTime() : 0;
    return popularity > 0 ? popularity : createdAtScore;
  };

  const rankedSaleVehicles = useMemo(
    () => [...publicVehicles].sort((a, b) => getRankingScore(b) - getRankingScore(a)),
    [publicVehicles],
  );

  const rankedRentalVehicles = useMemo(
    () => [...publicRentalVehicles].sort((a, b) => getRankingScore(b) - getRankingScore(a)),
    [publicRentalVehicles],
  );

  const heroSaleVehicles = rankedSaleVehicles.slice(0, 2);
  const heroRentalVehicles = rankedRentalVehicles.slice(0, 1);

  const heroTopCards = [
    heroSaleVehicles[0] ? { vehicle: heroSaleVehicles[0], type: "For Sale", isRental: false } : null,
    heroRentalVehicles[0] ? { vehicle: heroRentalVehicles[0], type: "For Rent", isRental: true } : null,
  ].filter(Boolean);

  const featuredHeroVehicle = [...heroSaleVehicles, ...heroRentalVehicles].sort(
    (a, b) => Number(b?.price || 0) - Number(a?.price || 0),
  )[0] || null;

  const hasHeroListings = heroTopCards.length > 0 || !!featuredHeroVehicle;

  const popularCars = publicVehicles.slice(0, 8);
  const popularRentals = publicRentalVehicles.slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-slate-900">
      <style>{`.scroll-container::-webkit-scrollbar { display: none; }`}</style>
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

            {hasHeroListings ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  {heroTopCards.map((item) => (
                    <button
                      key={`hero-${item.vehicle.id}`}
                      type="button"
                      onClick={() => navigate(`/vehicles/public/${item.vehicle.id}`)}
                      className="group relative h-48 overflow-hidden rounded-xl"
                    >
                      <img
                        src={getVehicleImageUrl(item.vehicle.images?.[0])}
                        alt={item.vehicle.name}
                        onError={handleImageError}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                      <div className="absolute left-3 right-3 bottom-3 text-left text-white">
                        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold">
                          <span className="rounded-full bg-white/20 px-2 py-0.5">{item.type}</span>
                          <span className="rounded-full bg-white/20 px-2 py-0.5">{item.vehicle.location || "Nepal"}</span>
                        </div>
                        <p className="text-base font-bold leading-tight line-clamp-1">{item.vehicle.make} {item.vehicle.model}</p>
                        <p className="mt-1 text-sm font-semibold text-purple-100">
                          Rs. {Number(item.vehicle.price || 0).toLocaleString("en-IN")}
                          {item.isRental ? " / day" : ""}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {featuredHeroVehicle && (
                  <button
                    type="button"
                    onClick={() => navigate(`/vehicles/public/${featuredHeroVehicle.id}`)}
                    className="group relative mt-3 h-40 w-full overflow-hidden rounded-xl"
                  >
                    <img
                      src={getVehicleImageUrl(featuredHeroVehicle.images?.[0])}
                      alt={featuredHeroVehicle.name}
                      onError={handleImageError}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/10" />
                    <div className="absolute inset-0 flex items-end justify-between p-4 text-white">
                      <div className="text-left">
                        <p className="text-xs font-semibold uppercase tracking-wide text-purple-100">Featured</p>
                        <p className="text-lg font-bold line-clamp-1">{featuredHeroVehicle.make} {featuredHeroVehicle.model}</p>
                        <p className="text-sm text-purple-100">
                          Rs. {Number(featuredHeroVehicle.price || 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">View listing</span>
                    </div>
                  </button>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <p className="text-base font-semibold text-slate-900">No listings yet</p>
                <p className="mt-1 text-sm text-slate-600">Be the first to add a vehicle to the marketplace.</p>
                <Button
                  className="mt-4 h-10 rounded-md bg-gradient-to-r from-purple to-blue px-5 text-sm font-semibold text-white hover:from-purple/90 hover:to-blue/90"
                  onClick={() => navigate(addFirstListingTarget)}
                >
                  Add the first vehicle
                </Button>
              </div>
            )}

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

      <section className="bg-white py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl">
                Popular Cars
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                Hand-picked second-hand cars trending right now in Nepal
              </p>
              <button
                type="button"
                onClick={() => navigate("/vehicles/browse")}
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
              >
                View all cars
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="hidden gap-2 md:flex">
              <button
                type="button"
                onClick={() => scrollPopularList(popularCarsRef, -1)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:border-primary hover:text-primary"
                aria-label="Scroll popular cars left"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollPopularList(popularCarsRef, 1)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:border-primary hover:text-primary"
                aria-label="Scroll popular cars right"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="relative">
            <div
              ref={popularCarsRef}
              className="scroll-container flex items-stretch gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {popularCars.length > 0 ? (
                <>
                  {popularCars.map((vehicle) => {
                    return (
                      <PopularListingCard
                        key={vehicle.id}
                        vehicle={vehicle}
                        variant="sale"
                        navigate={navigate}
                        getVehicleImageUrl={getVehicleImageUrl}
                        handleImageError={handleImageError}
                      />
                    );
                  })}
                </>
              ) : (
                <article className="min-w-[280px] snap-start overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:min-w-[320px]">
                  <div className="aspect-[4/3] animate-pulse bg-slate-200" />
                  <div className="p-4 sm:p-5">
                    <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
                    <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-slate-200" />
                    <div className="mt-4 h-6 w-1/3 animate-pulse rounded bg-slate-200" />
                    <div className="mt-4 h-11 w-full animate-pulse rounded-lg bg-slate-200" />
                  </div>
                </article>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl">
                Popular Rentals
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                Top-rated rental vehicles available across Nepal
              </p>
              <button
                type="button"
                onClick={() => navigate("/vehicles/browse?type=rent")}
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
              >
                View all rentals
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="hidden gap-2 md:flex">
              <button
                type="button"
                onClick={() => scrollPopularList(popularRentalsRef, -1)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:border-primary hover:text-primary"
                aria-label="Scroll popular rentals left"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollPopularList(popularRentalsRef, 1)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:border-primary hover:text-primary"
                aria-label="Scroll popular rentals right"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {popularRentals.length > 0 ? (
            <div className="relative">
              <div
                ref={popularRentalsRef}
                className="scroll-container flex items-stretch gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scroll-smooth"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {popularRentals.map((vehicle) => (
                  <PopularListingCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    variant="rental"
                    navigate={navigate}
                    getVehicleImageUrl={getVehicleImageUrl}
                    handleImageError={handleImageError}
                  />
                ))}

              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
              <p className="text-base font-semibold text-slate-800">No rentals available right now</p>
              <p className="mt-2 text-sm text-slate-600">Check back soon for newly listed rental vehicles.</p>
            </div>
          )}
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
