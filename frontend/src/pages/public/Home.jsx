import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/ui/button";
import { Card, CardContent } from "../../ui/ui/card";
import {
  Car,
  Shield,
  Users,
  Star,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Zap,
  Award,
  TrendingUp,
  CheckCircle,
  Sparkles,
  Globe,
  Clock,
  Heart,
  Target,
  BarChart3,
  Settings,
  Search,
  DollarSign,
  ThumbsUp,
  ChevronRight,
  Play,
  Quote
} from "lucide-react";
import Navigation from "../../components/common/Navigation";
import Footer from "../../components/common/Footer";

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Shield className="w-10 h-10 text-blue" />,
      title: "Enterprise Security",
      description: "Bank-level encryption and multi-factor authentication protect every transaction and user account.",
      stats: "99.9% Uptime"
    },
    {
      icon: <Zap className="w-10 h-10 text-purple" />,
      title: "AI-Powered Search",
      description: "Advanced machine learning algorithms match you with the perfect vehicle in seconds, not hours.",
      stats: "2.3M Searches/Day"
    },
    {
      icon: <Users className="w-10 h-10 text-green" />,
      title: "Verified Network",
      description: "Every dealer and seller undergoes rigorous background checks and vehicle history verification.",
      stats: "50K+ Verified Sellers"
    },
    {
      icon: <Award className="w-10 h-10 text-yellow-500" />,
      title: "Quality Assurance",
      description: "Comprehensive vehicle inspections with detailed reports and extended warranty options.",
      stats: "100% Inspection Rate"
    }
  ];

  const stats = [
    { number: "25,000+", label: "Premium Vehicles", icon: <Car className="w-7 h-7" />, trend: "+12%" },
    { number: "150,000+", label: "Happy Customers", icon: <Users className="w-7 h-7" />, trend: "+28%" },
    { number: "2,500+", label: "Certified Dealers", icon: <Award className="w-7 h-7" />, trend: "+45%" },
    { number: "99.8%", label: "Customer Satisfaction", icon: <TrendingUp className="w-7 h-7" />, trend: "+5%" }
  ];

  const testimonials = [
    {
      name: "Jennifer Walsh",
      role: "Executive Director, Walsh Automotive Group",
      company: "BMW & Mercedes Dealership",
      content: "AutoGear transformed our sales process. The platform's verification system and AI matching have increased our conversion rates by 340%. Our customers love the transparency and security.",
      rating: 5,
      avatar: "JW"
    },
    {
      name: "Marcus Rodriguez",
      role: "Private Collector",
      company: "Luxury Car Enthusiast",
      content: "After 15 years in the industry, AutoGear is the most professional platform I've encountered. The attention to detail in vehicle verification and the seamless transaction process is unmatched.",
      rating: 5,
      avatar: "MR"
    },
    {
      name: "Dr. Sarah Chen",
      role: "CEO, TechStart Solutions",
      company: "Fortune 500 Company",
      content: "We purchased 50 company vehicles through AutoGear. The bulk purchasing tools, fleet management integration, and enterprise-level support made the entire process effortless.",
      rating: 5,
      avatar: "SC"
    }
  ];

  const processSteps = [
    {
      step: "01",
      title: "Advanced Search",
      description: "Use our intelligent filters and AI recommendations to find your perfect vehicle.",
      icon: <Search className="w-8 h-8" />
    },
    {
      step: "02",
      title: "Expert Verification",
      description: "Every vehicle undergoes comprehensive inspection by certified professionals.",
      icon: <CheckCircle className="w-8 h-8" />
    },
    {
      step: "03",
      title: "Secure Transaction",
      description: "Protected payments with escrow services and instant fund transfers.",
      icon: <Shield className="w-8 h-8" />
    },
    {
      step: "04",
      title: "Ongoing Support",
      description: "24/7 customer service and extended warranty options for peace of mind.",
      icon: <Heart className="w-8 h-8" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple/5 via-blue/5 to-transparent"></div>
        <div className="absolute top-10 sm:top-20 right-5 sm:right-10 w-40 h-40 sm:w-72 sm:h-72 bg-purple/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 sm:bottom-20 left-5 sm:left-10 w-48 h-48 sm:w-96 sm:h-96 bg-blue/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-purple/10 rounded-full mb-6 sm:mb-8">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple mr-2" />
                <span className="text-purple font-semibold text-xs sm:text-sm">Trusted by 150,000+ Customers</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 sm:mb-8 leading-tight">
                <span className="bg-gradient-to-r from-gray-900 via-purple to-blue bg-clip-text text-transparent">
                  Redefining
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple via-blue to-purple bg-clip-text text-transparent">
                  Automotive
                </span>
                <br />
                <span className="text-gray-900">Excellence</span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                Experience the future of automotive commerce with enterprise-grade security,
                AI-powered matching, and unparalleled customer service. Join the most trusted
                marketplace for discerning buyers and sellers.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start mb-8 sm:mb-12">
                <Button
                  size="lg"
                  className="text-lg px-10 py-4 bg-gradient-to-r from-purple to-blue hover:from-purple/90 hover:to-blue/90 text-white font-bold rounded-xl shadow-2xl hover:shadow-purple/25 transition-all duration-300 transform hover:scale-105"
                  onClick={() => navigate(authenticate ? (role === "admin" ? "/admin/dashboard" : "/home") : "/signup")}
                >
                  Start Your Journey
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-10 py-4 border-2 border-gray-300 text-gray-700 hover:border-purple hover:text-purple font-semibold rounded-xl transition-all duration-300"
                  onClick={() => navigate("/about")}
                >
                  <Play className="mr-3 w-5 h-5" />
                  Watch Demo
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green mr-2" />
                  <span>Free to Join</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green mr-2" />
                  <span>Verified Sellers</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green mr-2" />
                  <span>Secure Payments</span>
                </div>
              </div>
            </div>

            <div className="relative hidden sm:block">
              {/* Main Visual */}
              <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] bg-gradient-to-br from-purple/10 via-blue/10 to-green/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center px-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-purple to-blue rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl">
                      <Car className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">Premium Marketplace</h3>
                    <p className="text-sm sm:text-base text-gray-600 font-medium">Where Excellence Meets Innovation</p>
                  </div>
                </div>

                {/* Floating Stats */}
                <div className="absolute top-4 sm:top-6 right-4 sm:right-6 bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-lg">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple">Rs. 25Cr</div>
                  <div className="text-xs text-gray-600">Avg. Transaction Value</div>
                </div>

                <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-lg">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue">4.9★</div>
                  <div className="text-xs text-gray-600">Customer Rating</div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 sm:-top-6 -right-4 sm:-right-6 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-purple/20 to-blue/20 rounded-full flex items-center justify-center animate-pulse shadow-xl">
                <Star className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-purple" />
              </div>
              <div className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue/20 to-green/20 rounded-full flex items-center justify-center animate-pulse shadow-xl">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-blue" />
              </div>
              <div className="absolute top-1/2 -right-3 sm:-right-4 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-green/20 to-purple/20 rounded-full flex items-center justify-center animate-pulse shadow-xl">
                <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white/50 backdrop-blur-sm border-y border-gray-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gradient-to-br from-purple/10 to-blue/10 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-purple/25">
                  <div className="text-purple">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-purple via-blue to-purple bg-clip-text text-transparent mb-2 sm:mb-3">
                  {stat.number}
                </div>
                <div className="text-gray-900 font-bold text-base sm:text-lg mb-2">{stat.label}</div>
                <div className="inline-flex items-center px-2.5 sm:px-3 py-1 bg-green/10 rounded-full">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green mr-1" />
                  <span className="text-green font-semibold text-xs sm:text-sm">{stat.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-purple/10 rounded-full mb-4 sm:mb-6">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple mr-2" />
              <span className="text-purple font-semibold text-xs sm:text-sm">How It Works</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 sm:mb-6">
              Simple. Secure. <span className="bg-gradient-to-r from-purple to-blue bg-clip-text text-transparent">Seamless.</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Our streamlined process ensures you find the perfect vehicle with complete confidence and security.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="relative group">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple to-blue rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                    <div className="text-white">
                      {step.icon}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-purple mb-3 bg-purple/10 rounded-full px-3 py-1 inline-block">
                    {step.step}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-8 h-0.5 bg-gradient-to-r from-purple to-blue transform -translate-x-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Enterprise-Grade <span className="bg-gradient-to-r from-purple to-blue bg-clip-text text-transparent">Solutions</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built for the modern automotive marketplace with cutting-edge technology and uncompromising security.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 hover:shadow-2xl transition-all duration-500 border-0 shadow-xl hover:-translate-y-2 group bg-white/80 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple/10 to-blue/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-gray-900">
                          {feature.title}
                        </h3>
                        <div className="text-sm font-bold text-purple bg-purple/10 px-3 py-1 rounded-full">
                          {feature.stats}
                        </div>
                      </div>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple/5 via-blue/5 to-purple/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 rounded-full mb-6">
              <Quote className="w-5 h-5 text-purple mr-2" />
              <span className="text-purple font-semibold">Success Stories</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Trusted by <span className="bg-gradient-to-r from-purple to-blue bg-clip-text text-transparent">Industry Leaders</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from executives, dealers, and customers who have transformed their automotive business with AutoGear.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-8 hover:shadow-2xl transition-all duration-500 border-0 shadow-xl hover:-translate-y-2 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple to-blue rounded-xl flex items-center justify-center mr-4 shadow-lg">
                      <span className="text-white font-bold text-lg">{testimonial.avatar}</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-lg">{testimonial.name}</div>
                      <div className="text-purple font-semibold">{testimonial.role}</div>
                      <div className="text-gray-600 text-sm">{testimonial.company}</div>
                    </div>
                  </div>

                  <div className="flex mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  <p className="text-gray-700 text-lg leading-relaxed italic mb-6">
                    "{testimonial.content}"
                  </p>

                  <div className="flex items-center text-purple font-semibold">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Verified Customer</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple via-blue to-purple text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple/20 via-transparent to-blue/20"></div>

        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
          <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full mb-8">
            <Globe className="w-6 h-6 mr-2" />
            <span className="font-semibold">Join 150,000+ Automotive Professionals</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-black mb-8 leading-tight">
            Ready to Transform Your<br />
            <span className="bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
              Automotive Business?
            </span>
          </h2>

          <p className="text-xl mb-12 text-purple-100 max-w-2xl mx-auto leading-relaxed">
            Start your free account today and experience the most advanced automotive marketplace platform.
            No setup fees, no hidden costs, just pure automotive excellence.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Button
              size="lg"
              variant="secondary"
              className="text-xl px-12 py-5 bg-white text-purple hover:bg-gray-50 font-bold rounded-xl shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:scale-105"
              onClick={() => navigate(authenticate ? (role === "admin" ? "/admin/dashboard" : "/home") : "/signup")}
            >
              Start Free Today
              <ArrowRight className="ml-3 w-6 h-6" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-xl px-12 py-5 border-2 border-white/30 text-white hover:bg-white/10 font-bold rounded-xl transition-all duration-300"
              onClick={() => navigate("/contact")}
            >
              <Phone className="mr-3 w-5 h-5" />
              Contact Sales
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-black mb-2">24/7</div>
              <div className="text-purple-100">Expert Support</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-black mb-2">Secure</div>
              <div className="text-purple-100">Bank-Level Security</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-black mb-2">Global</div>
              <div className="text-purple-100">150+ Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer>
      </Footer>
    </div>
  );
};

export default Home;