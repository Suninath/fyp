import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/ui/button";
import { Card, CardContent } from "../../ui/ui/card";
import { Input } from "../../ui/ui/input";
import { Label } from "../../ui/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/ui/select";
import { Textarea } from "../../ui/ui/textarea";
import { createVehicle, getPublicVehicles } from "../../rtk/thunk/vehicleThunk";
import { CheckCircle2, Loader2, Plus, Upload, X } from "lucide-react";
import { ErrorToast } from "../common/toast";

const MAX_FILES = 5;
const MAX_SIZE = 5 * 1024 * 1024;
const CURRENT_YEAR = new Date().getFullYear();

const defaultForm = {
  name: "",
  make: "",
  model: "",
  year: "",
  price: "",
  mileage: "",
  fuelType: "",
  transmission: "",
  color: "",
  location: "",
  description: "",
  condition: "",
};

const cleanImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:") || path.startsWith("blob:")) return path;
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${backendUrl}/${cleanPath.replace(/\\/g, "/")}`;
};

const fieldClass =
  "w-full border-2 border-slate-200 rounded-lg px-3 py-2.5 bg-white text-slate-800 placeholder:text-slate-400 transition-colors duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none hover:border-slate-300";

const labelClass = "mb-1.5 text-sm font-semibold text-slate-900";

const CreateVehicleForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { loading, publicVehicles } = useSelector((state) => state.vehicle);

  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const redirectTimerRef = useRef(null);

  useEffect(() => {
    if (!publicVehicles?.length) {
      dispatch(getPublicVehicles({ limit: 100, page: 1, category: "Buy/Sell" }));
    }
  }, [dispatch, publicVehicles?.length]);

  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (image.url?.startsWith("blob:")) URL.revokeObjectURL(image.url);
      });
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, [images]);

  const years = useMemo(
    () => Array.from({ length: CURRENT_YEAR - 1980 + 1 }, (_, index) => CURRENT_YEAR - index),
    []
  );

  const updateField = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: null }));
  };

  const handleFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;

    setImages((previous) => {
      const next = [...previous];
      incoming.forEach((file) => {
        if (next.length >= MAX_FILES) return;
        if (file.size > MAX_SIZE) {
          ErrorToast({ message: `${file.name} exceeds the 5MB limit.` });
          return;
        }
        next.push({ file, url: URL.createObjectURL(file) });
      });
      return next.slice(0, MAX_FILES);
    });
    setErrors((previous) => ({ ...previous, images: null }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Required";
    if (!form.make.trim()) nextErrors.make = "Required";
    if (!form.model.trim()) nextErrors.model = "Required";
    if (!form.year) nextErrors.year = "Required";
    if (!form.price) nextErrors.price = "Required";
    if (!form.location.trim()) nextErrors.location = "Required";
    if (!images.length) nextErrors.images = "Please upload at least one image.";
    return nextErrors;
  };

  const removeImage = (index) => {
    setImages((previous) => previous.filter((_, imageIndex) => imageIndex !== index));
  };

  const submitForm = async (event) => {
    event.preventDefault();
    if (loading || submitting) return;

    if (!user?.accountVerified) {
      ErrorToast({ message: "Please complete account verification first." });
      return;
    }

    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      images.forEach((image) => {
        if (image.file) formData.append("images", image.file);
      });

      await dispatch(createVehicle(formData)).unwrap();
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = setTimeout(() => {
        navigate("/vehicles");
      }, 1500);
    } catch (error) {
      console.error("Create vehicle failed", error);
      ErrorToast({ message: error?.data?.message || "Failed to create listing" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user?.accountVerified) {
    return (
      <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
        <div className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold text-yellow-700">Account Verification Required</h2>
          <p className="mt-2 text-slate-600">Admin verification is required before you can create and sell vehicles.</p>
          <Button type="button" className="mt-6 h-12 w-full rounded-xl bg-emerald-600 px-6 font-semibold text-white hover:bg-emerald-700" onClick={() => window.location.href = "/profile"}>
            Go to Profile & Verify Account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <div
            style={{
              background: "linear-gradient(to right, #155e75, #0f766e)",
              padding: "20px 24px",
              color: "white",
              borderTopLeftRadius: "16px",
              borderTopRightRadius: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Plus size={24} color="white" />
              <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "white", margin: 0 }}>
                Sell Your Vehicle
              </h1>
            </div>
            <p style={{ color: "#cffafe", fontSize: "14px", marginTop: "4px", marginBottom: 0 }}>
              Fill in the details to list your vehicle for sale.
            </p>
          </div>

          <div className="px-6 py-6 md:px-8 md:py-8">
            <form onSubmit={submitForm}>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className={labelClass}>Vehicle Name <span className="text-red-500">*</span></Label>
                  <Input id="name" value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="e.g., Toyota Camry 2020" className={fieldClass} />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="make" className={labelClass}>Make <span className="text-red-500">*</span></Label>
                  <Input id="make" list="brand-suggestions" value={form.make} onChange={(event) => updateField("make", event.target.value)} placeholder="e.g., Toyota" className={fieldClass} />
                  <datalist id="brand-suggestions">
                    {[...new Set((publicVehicles || []).map((vehicle) => vehicle?.make).filter(Boolean))].slice(0, 20).map((brand) => (
                      <option key={brand} value={brand} />
                    ))}
                  </datalist>
                  {errors.make && <p className="text-xs text-red-500">{errors.make}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="model" className={labelClass}>Model <span className="text-red-500">*</span></Label>
                  <Input id="model" value={form.model} onChange={(event) => updateField("model", event.target.value)} placeholder="e.g., Camry" className={fieldClass} />
                  {errors.model && <p className="text-xs text-red-500">{errors.model}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="year" className={labelClass}>Year <span className="text-red-500">*</span></Label>
                  <Select value={form.year} onValueChange={(value) => updateField("year", value)}>
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder="e.g., 2020" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {years.map((year) => (
                        <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.year && <p className="text-xs text-red-500">{errors.year}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="price" className={labelClass}>Price (Rs.) <span className="text-red-500">*</span></Label>
                  <Input id="price" type="number" value={form.price} onChange={(event) => updateField("price", event.target.value)} placeholder="e.g., 2500000" className={fieldClass} />
                  {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="mileage" className={labelClass}>Mileage (km)</Label>
                  <Input id="mileage" type="number" value={form.mileage} onChange={(event) => updateField("mileage", event.target.value)} placeholder="e.g., 50000" className={fieldClass} />
                  {errors.mileage && <p className="text-xs text-red-500">{errors.mileage}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="transmission" className={labelClass}>Transmission</Label>
                  <Select value={form.transmission} onValueChange={(value) => updateField("transmission", value)}>
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder="Select transmission" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Manual">Manual</SelectItem>
                      <SelectItem value="Automatic">Automatic</SelectItem>
                      <SelectItem value="CVT">CVT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fuelType" className={labelClass}>Fuel Type</Label>
                  <Select value={form.fuelType} onValueChange={(value) => updateField("fuelType", value)}>
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Petrol">Petrol</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Electric">Electric</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="condition" className={labelClass}>Condition</Label>
                  <Select value={form.condition} onValueChange={(value) => updateField("condition", value)}>
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                      <SelectItem value="Poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 md:col-start-2">
                  <Label htmlFor="color" className={labelClass}>Color</Label>
                  <Input id="color" value={form.color} onChange={(event) => updateField("color", event.target.value)} placeholder="e.g., White" className={fieldClass} />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="location" className={labelClass}>Location <span className="text-red-500">*</span></Label>
                  <Input id="location" value={form.location} onChange={(event) => updateField("location", event.target.value)} placeholder="e.g., Kathmandu, Bagmati" className={fieldClass} />
                  {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="description" className={labelClass}>Description</Label>
                  <Textarea id="description" rows={4} value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Describe your vehicle..." className={`${fieldClass} min-h-[120px] resize-none`} />
                  {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="images" className={labelClass}>Vehicle Images <span className="text-red-500">*</span></Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      handleFiles(event.dataTransfer.files);
                    }}
                    className="cursor-pointer rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50/20 p-6 text-center transition-colors hover:bg-emerald-50/40"
                  >
                    <input
                      ref={fileInputRef}
                      id="images"
                      type="file"
                      multiple
                      accept="image/jpeg,image/png"
                      className="hidden"
                      onChange={(event) => handleFiles(event.target.files)}
                    />
                    <Upload className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
                    <p className="text-sm font-medium text-slate-700">Click to upload images</p>
                    <p className="mt-1 text-xs text-slate-500">Up to 5 images • JPG, PNG • Max 5MB</p>
                  </div>
                  {errors.images && <p className="text-xs text-red-500">{errors.images}</p>}

                  {images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {images.map((image, index) => (
                        <div key={`${image.url}-${index}`} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                          <img src={cleanImageUrl(image.url)} alt={`upload-${index + 1}`} className="h-full w-full object-cover" />
                          {index === 0 && (
                            <span className="absolute left-2 top-2 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
                              Cover
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute right-2 top-2 rounded-full bg-white p-1 text-slate-700 shadow-sm opacity-100 transition-opacity group-hover:opacity-100"
                            aria-label="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => navigate("/vehicles")}
                    className="h-11 rounded-lg border-2 border-slate-300 px-6 font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || submitting}
                    style={{
                      backgroundColor: '#0f766e',
                      color: 'white',
                      padding: '10px 24px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '14px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: submitting ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = '#155e75'; }}
                    onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = '#0f766e'; }}
                  >
                    {submitting ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Create Listing
                      </span>
                    )}
                  </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateVehicleForm;