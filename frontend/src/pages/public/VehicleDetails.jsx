import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getPublicVehicleById } from "../../rtk/thunk/vehicleThunk";
import { addToComparison, removeFromComparison } from "../../rtk/slice/comparisonSlice";
import { startInterestConversation } from "../../rtk/thunk/chatThunk";
import { getVehicleReviews } from "../../rtk/slice/reviewSlice";
import { Button } from "../../ui/ui/button";
import { MessageSquare, Calendar, Gauge, Fuel, MoveVertical, MapPin, ArrowLeft, MessageCircle, Star, Scale } from "lucide-react";
import CommentSection from "../../components/common/CommentSection";
import Navigation from "../../components/common/Navigation";
import Footer from "../../components/common/Footer";
import ComparisonDrawer from "../../components/common/ComparisonDrawer";
import BookingFilter from "../../components/userComp/BookingFilter";
import ChatDialog from "../../components/common/ChatDialog";
import VehicleReviews from "../../components/userComp/VehicleReviews";
import { getUserProfile } from "../../rtk/thunk/authThunk";
import { ErrorToast } from "../../components/common/toast";

const VehicleDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentVehicle, loading } = useSelector((state) => state.vehicle);
    const { comparedVehicles } = useSelector((state) => state.comparison);
    const { user, authenticate } = useSelector((state) => state.auth);
    const [selectedImage, setSelectedImage] = React.useState(0);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatUser, setChatUser] = useState(null);
    const [isComparisonDrawerOpen, setIsComparisonDrawerOpen] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(getPublicVehicleById(id));
        }
    }, [dispatch, id]);

    // Ensure user profile is loaded when authenticated (prevents redirect loops on button click)
    useEffect(() => {
        if (authenticate && !user) {
            dispatch(getUserProfile());
        }
    }, [authenticate, user, dispatch]);

    if (loading || !currentVehicle) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navigation />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
                <Footer />
            </div>
        );
    }

    const { 
        name, make, model, year, price, mileage, 
        fuelType, transmission, color, location, 
        description, images, category
    } = currentVehicle;

    const isRentalVehicle = category === "Renting";
    const isInComparison = comparedVehicles.some((vehicle) => vehicle.id === currentVehicle.id);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navigation />
            
            <main className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-7xl">
                {/* Breadcrumb / Back */}
                <Button 
                    variant="ghost" 
                    className="mb-4 md:mb-6 pl-0 hover:bg-transparent hover:underline text-gray-600 text-sm md:text-base"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> Back to listings
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Left Column: Images & Key Specs */}
                    <div className="lg:col-span-2 space-y-6 md:space-y-8">
                        {/* Image Gallery */}
                        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="aspect-video bg-gray-100 relative items-center justify-center flex">
                                {images && images.length > 0 ? (
                                    <img 
                                        src={images[selectedImage]} 
                                        alt={name} 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-gray-400 text-sm md:text-base">No images available</span>
                                )}
                            </div>
                            {/* Thumbnails */}
                            {images && images.length > 1 && (
                                <div className="p-2 md:p-4 flex gap-2 md:gap-3 overflow-x-auto">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(idx)}
                                            className={`w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                                                selectedImage === idx ? 'border-blue-500 ring-2 ring-blue-100' : 'border-transparent opacity-70 hover:opacity-100'
                                            }`}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8">
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Description</h2>
                            <p className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                                {description || "No description provided."}
                            </p>
                        </div>

                        {/* Comments Section */}
                        <div id="comments">
                            <CommentSection 
                                vehicleId={currentVehicle.id} 
                                isOwner={false} 
                            />
                        </div>

                        {/* Reviews Section - Only for rental vehicles */}
                        {isRentalVehicle && (
                            <div id="reviews">
                                <VehicleReviews vehicleId={currentVehicle.id} />
                            </div>
                        )}
                    </div>

                    {/* Right Column: Details & Contact */}
                    <div className="space-y-4 md:space-y-6">
                        {/* Main Info Card */}
                        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 sticky top-20 md:top-24">
                            <div className="mb-2 md:mb-3">
                                <span className="text-xs md:text-sm font-semibold text-blue-600 uppercase tracking-wider">{make}</span>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 line-clamp-2">{name}</h1>
                                <p className="text-xs md:text-sm text-gray-500 mt-1">{year} • {transmission}</p>
                            </div>

                            <div className="my-4 md:my-6 pt-4 md:pt-6 border-t border-gray-100">
                                <p className="text-xs md:text-sm text-gray-500 mb-1">Asking Price</p>
                                <p className="text-3xl md:text-4xl font-extrabold text-blue-600 tracking-tight">
                                    Rs. {parseInt(price).toLocaleString('en-IN')}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2 md:space-y-3">
                                {/* Only show booking for rental vehicles */}
                                {isRentalVehicle && (
                                    <BookingFilter 
                                        vehicleId={currentVehicle.id}
                                        vehiclePrice={price}
                                        vehicleLocation={location}
                                    />
                                )}
                                {!isRentalVehicle && (
                                    <Button 
                                        variant="info" 
                                        className="w-full h-10 md:h-12 text-sm md:text-base font-bold"
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            
                                            if (!authenticate) {
                                                navigate("/login");
                                                return;
                                            }

                                            if (!user) {
                                                dispatch(getUserProfile());
                                                ErrorToast({ message: "Loading your profile, please try again." });
                                                return;
                                            }

                                            try {
                                                const result = await dispatch(
                                                    startInterestConversation({
                                                        vehicleId: currentVehicle.id,
                                                        message: `Hello, I am interested in ${name} (${make} ${model}, ${year}). Please assist me.`,
                                                    }),
                                                ).unwrap();

                                                if (!result?.admin?.id) {
                                                    ErrorToast({ message: "Admin is unavailable right now. Please try again." });
                                                    return;
                                                }

                                                setChatUser(result.admin);
                                                setIsChatOpen(true);
                                            } catch (error) {
                                                ErrorToast({ message: error || "Failed to contact admin" });
                                            }
                                        }}
                                    >
                                        <MessageCircle className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                                        Contact
                                    </Button>
                                )}
                                <Button 
                                    variant="outline" 
                                    className="w-full h-10 md:h-12 text-sm md:text-base font-bold hover:bg-blue/10 hover:text-blue"
                                    onClick={() => {
                                        if (isInComparison) {
                                            dispatch(removeFromComparison(currentVehicle.id));
                                        } else {
                                            dispatch(addToComparison(currentVehicle));
                                        }
                                        setIsComparisonDrawerOpen(true);
                                    }}
                                >
                                    <Scale className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                                    {isInComparison ? "Remove from Compare" : "Add to Compare"}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="w-full h-10 md:h-12 text-sm md:text-base font-bold hover:bg-purple/10 hover:text-purple"
                                    onClick={() => document.getElementById('comments').scrollIntoView({ behavior: 'smooth' })}
                                >
                                    <MessageSquare className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                                    View Comments
                                </Button>
                            </div>

                            {/* Specs Grid */}
                            <div className="mt-6 md:mt-8 grid grid-cols-2 gap-2 md:gap-4">
                                <div className="bg-gray-50 p-2 md:p-3 rounded-lg">
                                    <div className="flex items-center gap-1 md:gap-2 text-gray-500 mb-1 text-xs uppercase font-bold">
                                        <Gauge className="w-3 h-3 md:w-3.5 md:h-3.5" /> Mileage
                                    </div>
                                    <p className="font-semibold text-gray-900 text-xs md:text-sm">{mileage || "-"} km</p>
                                </div>
                                <div className="bg-gray-50 p-2 md:p-3 rounded-lg">
                                    <div className="flex items-center gap-1 md:gap-2 text-gray-500 mb-1 text-xs uppercase font-bold">
                                        <Fuel className="w-3 h-3 md:w-3.5 md:h-3.5" /> Fuel
                                    </div>
                                    <p className="font-semibold text-gray-900 capitalize text-xs md:text-sm">{fuelType || "-"}</p>
                                </div>
                                <div className="bg-gray-50 p-2 md:p-3 rounded-lg">
                                    <div className="flex items-center gap-1 md:gap-2 text-gray-500 mb-1 text-xs uppercase font-bold">
                                        <MoveVertical className="w-3 h-3 md:w-3.5 md:h-3.5" /> Trans.
                                    </div>
                                    <p className="font-semibold text-gray-900 capitalize text-xs md:text-sm">{transmission || "-"}</p>
                                </div>
                                <div className="bg-gray-50 p-2 md:p-3 rounded-lg">
                                    <div className="flex items-center gap-1 md:gap-2 text-gray-500 mb-1 text-xs uppercase font-bold">
                                        <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" /> Year
                                    </div>
                                    <p className="font-semibold text-gray-900 text-xs md:text-sm">{year || "-"}</p>
                                </div>
                                <div className="col-span-2 bg-gray-50 p-2 md:p-3 rounded-lg">
                                    <div className="flex items-center gap-1 md:gap-2 text-gray-500 mb-1 text-xs uppercase font-bold">
                                        <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5" /> Location
                                    </div>
                                    <p className="font-semibold text-gray-900 text-xs md:text-sm line-clamp-2">{location || "-"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Chat Dialog */}
            {chatUser && (
                <ChatDialog
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    otherUser={chatUser}
                />
            )}

            {/* Comparison Drawer */}
            <ComparisonDrawer 
                isOpen={isComparisonDrawerOpen}
                onToggle={setIsComparisonDrawerOpen}
            />

            <Footer />
        </div>
    );
};

export default VehicleDetails;
