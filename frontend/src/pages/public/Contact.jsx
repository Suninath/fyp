import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "../../ui/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/ui/card";
import { Input } from "../../ui/ui/input";
import { Textarea } from "../../ui/ui/textarea";
import { Label } from "../../ui/ui/label";
import {
  Car,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  HeadphonesIcon,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Users,
  Star,
  Globe,
  Shield,
  Zap,
  Award,
  ChevronRight,
  Building,
  UserCheck,
  Calendar,
  Quote
} from "lucide-react";
import Navigation from "../../components/common/Navigation";
import Footer from "../../components/common/Footer";

const Contact = () => {
  const navigate = useNavigate();
  const { authenticate, role } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
    inquiryType: "general"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        company: "",
        subject: "",
        message: "",
        inquiryType: "general"
      });
      setTimeout(() => setSubmitted(false), 5000);
    }, 2000);
  };

  const contactMethods = [
    {
      icon: <Mail className="w-8 h-8 text-purple" />,
      title: "Enterprise Support",
      subtitle: "Priority Response",
      details: ["enterprise@autogear.com", "Response within 2 hours"],
      description: "Dedicated support for business accounts and high-volume transactions.",
      gradient: "from-purple/10 to-blue/10",
      action: "Email Enterprise Team"
    },
    {
      icon: <Phone className="w-8 h-8 text-blue" />,
      title: "Global Hotline",
      subtitle: "24/7 Available",
      details: ["+1 (800) AUTOGEAR", "+1 (800) 288-4327"],
      description: "Round-the-clock support in 12 languages across all time zones.",
      gradient: "from-blue/10 to-green/10",
      action: "Call Now"
    },
    {
      icon: <Building className="w-8 h-8 text-green" />,
      title: "Headquarters",
      subtitle: "Silicon Valley",
      details: ["100 Innovation Drive", "San Francisco, CA 94105"],
      description: "Visit our global headquarters for partnerships and enterprise solutions.",
      gradient: "from-green/10 to-purple/10",
      action: "Schedule Visit"
    },
    {
      icon: <Users className="w-8 h-8 text-yellow-500" />,
      title: "Regional Offices",
      subtitle: "50+ Locations",
      details: ["London • Singapore • Dubai", "Toronto • Sydney • Berlin"],
      description: "Local presence with global expertise serving 150+ countries.",
      gradient: "from-yellow-500/10 to-orange-500/10",
      action: "Find Nearest Office"
    }
  ];

  const testimonials = [
    {
      name: "Marcus Thompson",
      role: "Fleet Manager, Hertz Global",
      company: "Hertz Corporation",
      content: "AutoGear's enterprise platform transformed our fleet management operations. Their 24/7 support and custom integrations saved us Rs. 2.5 Crore annually.",
      rating: 5,
      avatar: "/api/placeholder/60/60"
    },
    {
      name: "Dr. Sarah Chen",
      role: "COO, AutoNation",
      company: "AutoNation Inc.",
      content: "The premium support team's expertise and rapid response time helped us scale from 50 to 500 dealerships seamlessly.",
      rating: 5,
      avatar: "/api/placeholder/60/60"
    },
    {
      name: "David Rodriguez",
      role: "VP Operations, CarMax",
      company: "CarMax Group",
      content: "Outstanding enterprise-grade platform with unparalleled support. Their API integrations and custom solutions are game-changing.",
      rating: 5,
      avatar: "/api/placeholder/60/60"
    }
  ];

  const inquiryTypes = [
    { value: "general", label: "General Inquiry", icon: <MessageSquare className="w-4 h-4" /> },
    { value: "support", label: "Technical Support", icon: <HeadphonesIcon className="w-4 h-4" /> },
    { value: "business", label: "Business Partnership", icon: <Building className="w-4 h-4" /> },
    { value: "enterprise", label: "Enterprise Solutions", icon: <Award className="w-4 h-4" /> },
    { value: "press", label: "Press & Media", icon: <Users className="w-4 h-4" /> },
    { value: "careers", label: "Careers", icon: <UserCheck className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple/5 via-blue/5 to-transparent"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-purple/10 rounded-full mb-8">
              <HeadphonesIcon className="w-5 h-5 text-purple mr-2" />
              <span className="text-purple font-semibold">Enterprise Support Center</span>
            </div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-purple to-blue bg-clip-text text-transparent">
                Connect With
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple via-blue to-purple bg-clip-text text-transparent">
                AutoGear
              </span>
              <br />
              <span className="text-gray-900">Leadership</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
              Join 150,000+ professionals who trust AutoGear for enterprise-grade automotive solutions.
              Our global support team is ready to transform your business with cutting-edge technology
              and unparalleled expertise.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                size="lg"
                className="text-lg px-10 py-4 bg-gradient-to-r from-purple to-blue hover:from-purple/90 hover:to-blue/90 text-white font-bold rounded-xl shadow-2xl hover:shadow-purple/25 transition-all duration-300 transform hover:scale-105"
                onClick={() => document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' })}
              >
                Start Conversation
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-10 py-4 border-2 border-gray-300 text-gray-700 hover:border-purple hover:text-purple font-semibold rounded-xl transition-all duration-300"
                onClick={() => navigate("/about")}
              >
                <Users className="mr-3 w-5 h-5" />
                Meet Our Team
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Multiple Ways to <span className="bg-gradient-to-r from-purple to-blue bg-clip-text text-transparent">Connect</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the best way to reach our enterprise support team. We're here to help you succeed.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            {contactMethods.map((method, index) => (
              <Card key={index} className="p-8 hover:shadow-2xl transition-all duration-500 border-0 shadow-xl hover:-translate-y-2 bg-white/80 backdrop-blur-sm group">
                <CardContent className="p-0">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <div className={`w-20 h-20 bg-gradient-to-br ${method.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        {method.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-1">
                            {method.title}
                          </h3>
                          <p className="text-purple font-semibold">{method.subtitle}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-purple text-purple hover:bg-purple hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                          {method.action}
                          <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2 mb-4">
                        {method.details.map((detail, idx) => (
                          <p key={idx} className="text-gray-700 font-medium">{detail}</p>
                        ))}
                      </div>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        {method.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white" id="contact-form">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Form */}
            <div>
              <div className="flex items-center mb-6">
                <MessageSquare className="w-8 h-8 text-purple mr-3" />
                <h2 className="text-4xl md:text-5xl font-black text-gray-900">
                  Start the Conversation
                </h2>
              </div>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Tell us about your project, partnership opportunity, or how we can help transform
                your automotive business. Our enterprise team responds within 2 hours.
              </p>

              {submitted && (
                <div className="mb-8 p-6 bg-gradient-to-r from-green/10 to-blue/10 border border-green/200 rounded-xl flex items-start shadow-lg">
                  <CheckCircle className="w-7 h-7 text-green mr-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Message Sent Successfully!</h3>
                    <p className="text-gray-600">Thank you for reaching out. Our enterprise support team will respond within 2 hours during business days.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-3">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      className="w-full h-12 border-2 border-gray-200 focus:border-purple focus:ring-purple rounded-lg text-lg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-3">
                      Business Email *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@company.com"
                      className="w-full h-12 border-2 border-gray-200 focus:border-purple focus:ring-purple rounded-lg text-lg"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="company" className="block text-sm font-bold text-gray-900 mb-3">
                      Company Name
                    </Label>
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="Your organization"
                      className="w-full h-12 border-2 border-gray-200 focus:border-purple focus:ring-purple rounded-lg text-lg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="inquiryType" className="block text-sm font-bold text-gray-900 mb-3">
                      Inquiry Type *
                    </Label>
                    <select
                      id="inquiryType"
                      name="inquiryType"
                      required
                      value={formData.inquiryType}
                      onChange={handleInputChange}
                      className="w-full h-12 border-2 border-gray-200 focus:border-purple focus:ring-purple rounded-lg text-lg bg-white"
                    >
                      {inquiryTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject" className="block text-sm font-bold text-gray-900 mb-3">
                    Subject *
                  </Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Brief description of your inquiry"
                    className="w-full h-12 border-2 border-gray-200 focus:border-purple focus:ring-purple rounded-lg text-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="block text-sm font-bold text-gray-900 mb-3">
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us about your project, requirements, or how we can help..."
                    rows={8}
                    className="w-full border-2 border-gray-200 focus:border-purple focus:ring-purple rounded-lg text-lg resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-xl py-5 bg-gradient-to-r from-purple to-blue hover:from-purple/90 hover:to-blue/90 text-white font-bold rounded-xl shadow-2xl hover:shadow-purple/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Sending Message...
                    </>
                  ) : (
                    <>
                      Send Enterprise Inquiry
                      <Send className="ml-3 w-6 h-6" />
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Testimonials */}
            <div>
              <div className="flex items-center mb-6">
                <Quote className="w-8 h-8 text-blue mr-3" />
                <h2 className="text-4xl md:text-5xl font-black text-gray-900">
                  What Our Partners Say
                </h2>
              </div>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Join industry leaders who trust AutoGear for enterprise-grade solutions
                and unparalleled support.
              </p>

              <div className="space-y-8">
                {testimonials.map((testimonial, index) => (
                  <Card key={index} className="p-8 hover:shadow-2xl transition-all duration-500 border-0 shadow-xl hover:-translate-y-2 bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-0">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple to-blue rounded-full flex items-center justify-center mr-4">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
                          <p className="text-purple font-semibold text-sm">{testimonial.role}</p>
                          <p className="text-gray-600 text-sm">{testimonial.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <Quote className="w-8 h-8 text-purple/30 mb-4" />
                      <p className="text-gray-600 text-lg leading-relaxed italic">
                        "{testimonial.content}"
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Presence */}
      <section className="py-24 bg-gradient-to-r from-purple/5 via-blue/5 to-purple/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-white/80 rounded-full mb-6">
              <Globe className="w-6 h-6 text-purple mr-2" />
              <span className="text-purple font-semibold">Global Enterprise Presence</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Supporting <span className="bg-gradient-to-r from-purple to-blue bg-clip-text text-transparent">150+ Countries</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our enterprise support spans the globe with local expertise and global resources,
              ensuring your business succeeds wherever you operate.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple/10 to-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <Globe className="w-8 h-8 text-purple" />
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-purple to-blue bg-clip-text text-transparent mb-3">
                150+
              </div>
              <div className="text-gray-900 font-bold text-lg mb-2">Countries Served</div>
              <div className="text-gray-600">Global automotive market coverage</div>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue/10 to-green/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <Users className="w-8 h-8 text-blue" />
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-blue to-green bg-clip-text text-transparent mb-3">
                50+
              </div>
              <div className="text-gray-900 font-bold text-lg mb-2">Regional Offices</div>
              <div className="text-gray-600">Local presence worldwide</div>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-green/10 to-purple/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <Clock className="w-8 h-8 text-green" />
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-green to-purple bg-clip-text text-transparent mb-3">
                24/7
              </div>
              <div className="text-gray-900 font-bold text-lg mb-2">Enterprise Support</div>
              <div className="text-gray-600">Round-the-clock assistance</div>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple/10 to-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <Zap className="w-8 h-8 text-purple" />
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-purple to-yellow-500 bg-clip-text text-transparent mb-3">
                2hrs
              </div>
              <div className="text-gray-900 font-bold text-lg mb-2">Average Response</div>
              <div className="text-gray-600">Priority support guarantee</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple via-blue to-purple text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple/20 via-transparent to-blue/20"></div>

        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
          <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full mb-8">
            <Sparkles className="w-6 h-6 mr-2" />
            <span className="font-semibold">Ready to Transform Your Business?</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-black mb-8 leading-tight">
            Join the AutoGear<br />
            <span className="bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
              Enterprise Network
            </span>
          </h2>

          <p className="text-xl mb-12 text-purple-100 max-w-2xl mx-auto leading-relaxed">
            Connect with industry leaders, access cutting-edge automotive technology,
            and scale your business with enterprise-grade support and solutions.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Button
              size="lg"
              variant="secondary"
              className="text-xl px-12 py-5 bg-white text-purple hover:bg-gray-50 font-bold rounded-xl shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:scale-105"
              onClick={() => navigate(authenticate ? (role === "admin" ? "/admin/dashboard" : "/home") : "/signup")}
            >
              Get Started Today
              <ArrowRight className="ml-3 w-6 h-6" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-xl px-12 py-5 border-2 border-white/30 text-white hover:bg-white/10 font-bold rounded-xl transition-all duration-300"
              onClick={() => document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' })}
            >
              <MessageSquare className="mr-3 w-5 h-5" />
              Contact Us
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-black mb-2">24/7</div>
              <div className="text-purple-100">Expert Support</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-black mb-2">Global</div>
              <div className="text-purple-100">Enterprise Network</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-black mb-2">Secure</div>
              <div className="text-purple-100">Bank-Level Security</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;