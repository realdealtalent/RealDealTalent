import React from "react";
import { Globe } from "@/components/ui/globe";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { Button } from "@/components/ui/button";
import { WordPullUp } from "@/components/ui/word-pull-up";

const testimonials = [
  {
    author: {
      name: "Sarah Johnson",
      handle: "VP of Engineering",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
    },
    text: "The talent pipeline they've built for us is exceptional. We've found amazing engineers who align perfectly with our culture."
  },
  {
    author: {
      name: "Michael Chen",
      handle: "Tech Lead",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    text: "Their understanding of the tech landscape helped us fill critical roles in record time. Truly outstanding service."
  },
  {
    author: {
      name: "Elena Rodriguez",
      handle: "CTO",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
    },
    text: "They don't just match skills, they understand company culture and vision. Every placement has been a perfect fit."
  }
];

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-background to-background/80">
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <WordPullUp
              words="Real Deal Talent"
              className="mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 text-4xl sm:text-5xl md:text-6xl"
            />
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              We specialize in placing top-tier technical talent in roles where they'll thrive and make a lasting impact.
            </p>
            <div className="flex justify-center">
              <Button size="lg">Let's Talk</Button>
            </div>
          </div>
        </div>
        <Globe className="opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection
        testimonials={testimonials}
      />

      {/* Contact Form Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-background rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Let's Connect</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-md border bg-background"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-md border bg-background"
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  className="w-full px-4 py-2 rounded-md border bg-background h-32"
                  placeholder="Tell us about your needs"
                />
              </div>
              <Button className="w-full">Send Message</Button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Global Talent Hunters. All rights reserved.
            </p>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
              Connect on LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
