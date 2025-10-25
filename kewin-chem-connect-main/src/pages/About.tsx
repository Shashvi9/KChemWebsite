import React from "react";
import { Button } from "@/components/ui/button";
import { Award, Users, Globe, Zap, BookOpen, Eye, Target, Star } from "lucide-react";

const stats = [
  { icon: Award, label: "Years of Excellence", value: "25+" },
  { icon: Users, label: "Global Clients", value: "500+" },
  { icon: Globe, label: "Countries Served", value: "20+" },
  { icon: Zap, label: "Product Range", value: "1000+" },
];

const sections = [
  {
    title: "History",
    icon: BookOpen,
    content:
      "Founded in 1999, Kewin Chemicals is a global Dyes and colorants company producing a broad range of products used every day. We work with customers to deliver innovative products while maintaining a commitment to safety and sustainability.",
  },
  {
    title: "Our Vision",
    icon: Eye,
    content:
      "To boldly explore and advance the chemical industry frontiers & be the world’s premier chemical company, delivering excellence across industries globally.",
  },
  {
    title: "Our Mission",
    icon: Target,
    content:
      "We responsibly manufacture dyes & colorants the world needs, provide enriching careers, and create customer value because we care about our customers and communities.",
  },
  {
    title: "Our Values",
    icon: Star,
    content: `
      - The customer is why we exist: We measure ourselves by our customers’ success and aim to exceed expectations.
      - Our people make the difference: A company is its people. We respect every voice and rely on each other to grow.
      - We see change as an opportunity: We embrace challenges to remain world-class and innovative.
      - Diversity is our strength: Our variety of knowledge, perspectives, and experiences fuels our competitiveness.
    `,
  },
];

const About = () => {
  return (
    <div className="relative bg-gradient-to-b from-blue-50 via-white to-blue-50 min-h-screen overflow-hidden">
      {/* Background Waves */}
      <div className="absolute top-0 left-0 right-0 -z-10">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-32 text-blue-100"
          fill="currentColor"
        >
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"></path>
        </svg>
      </div>

      <div className="container mx-auto px-4 py-20 md:py-32">
        {/* Hero Section */}
        <div className="text-center md:text-left animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-4 leading-tight">
            About <span className="text-blue-600">Kewin Chemicals</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-700 max-w-3xl mx-auto md:mx-0 mb-12">
            Discover our history, vision, mission, and values that drive our commitment to providing
            premium chemical solutions across industries worldwide.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 text-center">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-3 animate-bounce">
                <stat.icon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-blue-900 mb-1">{stat.value}</div>
              <div className="text-sm text-blue-700/80">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className="grid md:grid-cols-2 gap-12">
          {sections.map((section, index) => (
            <div
              key={section.title}
              className="bg-white shadow-xl rounded-2xl p-8 hover:shadow-2xl transition-shadow animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center animate-pulse">
                  <section.icon className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-blue-900">{section.title}</h2>
              </div>
              <p className="text-blue-700 text-lg leading-relaxed whitespace-pre-line">{section.content}</p>
            </div>
          ))}
        </div>

        {/* Call To Action */}
        <div className="mt-16 text-center animate-fade-in">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 md:p-12 shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
              Want to Collaborate With Us?
            </h3>
            <p className="text-lg text-blue-700/90 mb-6 max-w-3xl mx-auto">
              Reach out to our experts to discuss custom chemical solutions tailored to your business.
            </p>
            <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
              Contact Our Experts
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0 -z-10">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-32 text-blue-100"
          fill="currentColor"
        >
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default About;
