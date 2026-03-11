import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "../../ui/ui/button";
import { Card, CardContent } from "../../ui/ui/card";
import {
  Car,
  Shield,
  Users,
  Star,
  Target,
  Award,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Heart,
  Lightbulb,
  TrendingUp,
  Globe,
  Clock,
  BarChart3,
  Settings,
  Quote,
  ChevronRight
} from "lucide-react";
import Navigation from "../../components/common/Navigation";
import Footer from "../../components/common/Footer";

const About = () => {
  const navigate = useNavigate();
  const { authenticate, role } = useSelector((state) => state.auth);

  const values = [
    {
      icon: <Shield className="w-10 h-10 text-blue" />,
      title: "Enterprise Security",
      description: "Bank-level encryption and multi-factor authentication protect every transaction and user account with 99.9% uptime.",
      stats: "Fort Knox Level"
    },
    {
      icon: <Users className="w-10 h-10 text-green" />,
      title: "Global Community",
      description: "Building the world's largest automotive network with 150,000+ verified members across 50+ countries.",
      stats: "150K+ Members"
    },
    {
      icon: <Award className="w-10 h-10 text-purple" />,
      title: "Industry Leadership",
      description: "Recognized as the #1 automotive marketplace by industry analysts and customer satisfaction surveys.",
      stats: "#1 Platform"
    },
    {
      icon: <Lightbulb className="w-10 h-10 text-yellow-500" />,
      title: "Innovation First",
      description: "Pioneering AI-driven solutions and blockchain technology for transparent, secure automotive transactions.",
      stats: "50+ Patents"
    }
  ];

  const team = [
    {
      name: "Jennifer Walsh",
      role: "CEO & Co-Founder",
      company: "Former VP, Mercedes-Benz Global",
      image: "/api/placeholder/150/150",
      description: "Leading AutoGear's vision with 20+ years in automotive industry leadership and digital transformation.",
      achievements: ["Forbes 30 Under 30", "MIT Sloan Fellow", "Industry Disruptor Award"]
    },
    {
      name: "Dr. Marcus Rodriguez",
      role: "CTO & Co-Founder",
      company: "PhD Computer Science, Stanford",
      image: "/api/placeholder/150/150",
      description: "Architect of our AI-powered platform with expertise in machine learning and enterprise-scale systems.",
      achievements: ["Published 40+ Papers", "Ex-Google AI Lead", "Tech Innovator Award"]
    },
    {
      name: "Sarah Chen",
      role: "Chief Operating Officer",
      company: "Former COO, AutoNation",
      image: "/api/placeholder/150/150",
      description: "Driving operational excellence with a focus on customer experience and scalable business processes.",
      achievements: ["MBA Harvard", "Operations Excellence", "Customer Champion"]
    },
    {
      name: "David Thompson",
      role: "VP of Engineering",
      company: "Former Principal Engineer, Tesla",
      image: "/api/placeholder/150/150",
      description: "Leading our engineering team in building next-generation automotive technology solutions.",
      achievements: ["Tesla Autopilot Team", "10+ Years Experience", "Innovation Leader"]
    }
  ];

  const milestones = [
    { year: "2019", title: "Founded", description: "AutoGear born from a vision to democratize automotive commerce", icon: <Sparkles className="w-6 h-6" /> },
    { year: "2020", title: "First 10,000 Users", description: "Reached critical mass with viral growth and industry recognition", icon: <Users className="w-6 h-6" /> },
    { year: "2021", title: "Series A Funding", description: "Raised to accelerate AI development and global expansion", icon: <TrendingUp className="w-6 h-6" /> },
    { year: "2022", title: "Industry Leadership", description: "Became the most trusted automotive marketplace worldwide", icon: <Award className="w-6 h-6" /> },
    { year: "2023", title: "Global Expansion", description: "Launched in 25 countries with localized experiences", icon: <Globe className="w-6 h-6" /> },
    { year: "2024", title: "Enterprise Solutions", description: "Released B2B platform for dealerships and fleet management", icon: <BarChart3 className="w-6 h-6" /> }
  ];

  const stats = [
    { number: "150,000+", label: "Active Users", trend: "+45%" },
    { number: "25,000+", label: "Vehicles Traded", trend: "+67%" },
    { number: "Rs. 250Cr+", label: "Transaction Value", trend: "+89%" },
    { number: "99.8%", label: "Customer Satisfaction", trend: "+12%" }
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
              <Sparkles className="w-5 h-5 text-purple mr-2" />
              <span className="text-purple font-semibold">The AutoGear Story</span>
            </div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-purple to-blue bg-clip-text text-transparent">
                Revolutionizing
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple via-blue to-purple bg-clip-text text-transparent">
                Automotive Commerce
              </span>
              <br />
              <span className="text-gray-900">Since 2019</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
              Founded by industry veterans with a singular mission: to create the most trusted,
              transparent, and technologically advanced automotive marketplace in the world.
              Today, we're empowering millions with AI-driven solutions and enterprise-grade security.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                size="lg"
                className="text-lg px-10 py-4 bg-gradient-to-r from-purple to-blue hover:from-purple/90 hover:to-blue/90 text-white font-bold rounded-xl shadow-2xl hover:shadow-purple/25 transition-all duration-300 transform hover:scale-105"
                onClick={() => navigate(authenticate ? (role === "admin" ? "/admin/dashboard" : "/home") : "/signup")}
              >
                Join Our Community
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-10 py-4 border-2 border-gray-300 text-gray-700 hover:border-purple hover:text-purple font-semibold rounded-xl transition-all duration-300"
                onClick={() => navigate("/contact")}
              >
                Contact Leadership
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm border-y border-gray-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-purple/10 to-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-purple/25">
                  <div className="text-purple">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                </div>
                <div className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-purple via-blue to-purple bg-clip-text text-transparent mb-3">
                  {stat.number}
                </div>
                <div className="text-gray-900 font-bold text-lg mb-2">{stat.label}</div>
                <div className="inline-flex items-center px-3 py-1 bg-green/10 rounded-full">
                  <TrendingUp className="w-4 h-4 text-green mr-1" />
                  <span className="text-green font-semibold text-sm">{stat.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center mb-6">
                <Target className="w-8 h-8 text-purple mr-3" />
                <h2 className="text-4xl md:text-5xl font-black text-gray-900">
                  Our Mission
                </h2>
              </div>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                To democratize automotive commerce by creating the most trusted, transparent,
                and technologically advanced marketplace in the world. We believe that buying
                and selling vehicles should be an effortless, secure, and enjoyable experience
                for everyone.
              </p>
              <div className="space-y-8">
                <div className="flex items-start group">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple to-blue rounded-xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl mb-3">Uncompromising Quality</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">Every vehicle undergoes comprehensive inspection by certified professionals, ensuring transparency and trust in every transaction.</p>
                  </div>
                </div>
                <div className="flex items-start group">
                  <div className="w-14 h-14 bg-gradient-to-br from-green to-blue rounded-xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl mb-3">Enterprise Security</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">Bank-level encryption, multi-factor authentication, and secure escrow services protect every transaction and user.</p>
                  </div>
                </div>
                <div className="flex items-start group">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue to-purple rounded-xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300">
                    <Heart className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl mb-3">Customer Obsession</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">24/7 expert support, personalized experiences, and continuous innovation driven by customer feedback and needs.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative w-full h-[500px] bg-gradient-to-br from-purple/10 via-blue/10 to-green/10 rounded-3xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple to-blue rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                      <Target className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Our Mission</h3>
                    <p className="text-gray-600 font-medium max-w-xs">Democratizing automotive commerce with trust, transparency, and technology</p>
                  </div>
                </div>

                {/* Floating Stats */}
                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                  <div className="text-2xl font-bold text-purple">99.9%</div>
                  <div className="text-xs text-gray-600">Platform Uptime</div>
                </div>

                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                  <div className="text-2xl font-bold text-blue">24/7</div>
                  <div className="text-xs text-gray-600">Expert Support</div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-purple/20 to-blue/20 rounded-full flex items-center justify-center animate-pulse shadow-xl">
                <Star className="w-10 h-10 text-purple" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br from-blue/20 to-green/20 rounded-full flex items-center justify-center animate-pulse shadow-xl">
                <Award className="w-8 h-8 text-blue" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline/Milestones */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Our <span className="bg-gradient-to-r from-purple to-blue bg-clip-text text-transparent">Journey</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From a bold idea to industry leadership: milestones that shaped AutoGear's transformation
              of the automotive marketplace.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="relative group">
                <Card className="p-8 hover:shadow-2xl transition-all duration-500 border-0 shadow-xl hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50/50">
                  <CardContent className="p-0">
                    <div className="flex items-center mb-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple to-blue rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                        <div className="text-white">
                          {milestone.icon}
                        </div>
                      </div>
                      <div className="text-3xl font-black text-purple">{milestone.year}</div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {milestone.description}
                    </p>
                  </CardContent>
                </Card>
                {index < milestones.length - 1 && (
                  <div className="hidden lg:block absolute top-20 left-full w-8 h-0.5 bg-gradient-to-r from-purple to-blue transform -translate-x-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Our <span className="bg-gradient-to-r from-purple to-blue bg-clip-text text-transparent">Values</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide every decision, every innovation, and every interaction at AutoGear.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12">
            {values.map((value, index) => (
              <Card key={index} className="p-8 hover:shadow-2xl transition-all duration-500 border-0 shadow-xl hover:-translate-y-2 group bg-white/80 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple/10 to-blue/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        {value.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-gray-900">
                          {value.title}
                        </h3>
                        <div className="text-sm font-bold text-purple bg-purple/10 px-3 py-1 rounded-full">
                          {value.stats}
                        </div>
                      </div>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-gradient-to-r from-purple/5 via-blue/5 to-purple/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 rounded-full mb-6">
              <Users className="w-5 h-5 text-purple mr-2" />
              <span className="text-purple font-semibold">Leadership Team</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Meet the <span className="bg-gradient-to-r from-purple to-blue bg-clip-text text-transparent">Visionaries</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Industry leaders, innovators, and automotive experts united by a shared mission
              to transform how the world buys and sells vehicles.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 shadow-xl hover:-translate-y-2 bg-white/90 backdrop-blur-sm">
                <div className="aspect-[4/3] bg-gradient-to-br from-purple/10 to-blue/10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple to-blue rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                      <Users className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-sm text-gray-500">Executive Leadership</div>
                  </div>
                </div>
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {member.name}
                      </h3>
                      <p className="text-purple font-semibold text-lg mb-1">{member.role}</p>
                      <p className="text-gray-600 font-medium">{member.company}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {member.achievements.slice(0, 2).map((achievement, idx) => (
                        <span key={idx} className="text-xs bg-purple/10 text-purple px-2 py-1 rounded-full font-medium">
                          {achievement}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed mb-4">{member.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {member.achievements.map((achievement, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
                        {achievement}
                      </span>
                    ))}
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
            <span className="font-semibold">Join 150,000+ Industry Professionals</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-black mb-8 leading-tight">
            Ready to Be Part of<br />
            <span className="bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
              Automotive Innovation?
            </span>
          </h2>

          <p className="text-xl mb-12 text-purple-100 max-w-2xl mx-auto leading-relaxed">
            Whether you're buying your dream car, selling your current vehicle, or growing your
            automotive business, AutoGear provides the platform, tools, and expertise you need.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Button
              size="lg"
              variant="secondary"
              className="text-xl px-12 py-5 bg-white text-purple hover:bg-gray-50 font-bold rounded-xl shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:scale-105"
              onClick={() => navigate(authenticate ? (role === "admin" ? "/admin/dashboard" : "/home") : "/signup")}
            >
              Start Your Journey
              <ArrowRight className="ml-3 w-6 h-6" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-xl px-12 py-5 border-2 border-white/30 text-white hover:bg-white/10 font-bold rounded-xl transition-all duration-300"
              onClick={() => navigate("/contact")}
            >
              <Users className="mr-3 w-5 h-5" />
              Meet the Team
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-black mb-2">Free</div>
              <div className="text-purple-100">To Get Started</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-black mb-2">30-Day</div>
              <div className="text-purple-100">Money-Back Guarantee</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-black mb-2">24/7</div>
              <div className="text-purple-100">Expert Support</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;