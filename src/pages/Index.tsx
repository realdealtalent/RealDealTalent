
import React from "react";
import { Globe } from "@/components/ui/globe";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { Button } from "@/components/ui/button";
import { WordPullUp } from "@/components/ui/word-pull-up";
import { motion } from "framer-motion";

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
      <section className="relative min-h-[70vh] flex flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-background via-background/95 to-background/90">
        <motion.div 
          className="container relative z-10 mx-auto px-4 flex-1 flex items-center pt-24 md:pt-32"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.5,
              },
            },
          }}
        >
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <WordPullUp
              words="Real Deal Talent"
              className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600 text-4xl sm:text-5xl md:text-6xl font-bold"
              wrapperFramerProps={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    delay: 1,
                    staggerChildren: 0.2,
                  },
                },
              }}
            />
            <motion.p 
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.5 }}
            >
              We specialize in placing top-tier technical talent in roles where they'll thrive and make a lasting impact.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5, duration: 0.5 }}
            >
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">Let's Talk</Button>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1 }}
        >
          <Globe className="opacity-30" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Testimonials Section positioned at the bottom of the hero */}
        <motion.div 
          className="w-full relative z-10 mt-16 pb-8"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 3, duration: 0.8 }}
        >
          <TestimonialsSection
            testimonials={testimonials}
            className="bg-transparent"
          />
        </motion.div>
      </section>

      {/* Contact Form Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-background/50 backdrop-blur-lg rounded-lg shadow-lg p-8 border border-white/10">
            <h2 className="text-2xl font-bold mb-6 text-center">Let's Connect</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-md border bg-secondary/50 backdrop-blur-sm"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-md border bg-secondary/50 backdrop-blur-sm"
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  className="w-full px-4 py-2 rounded-md border bg-secondary/50 backdrop-blur-sm h-32"
                  placeholder="Tell us about your needs"
                />
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Send Message</Button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background/50 backdrop-blur-lg border-t border-white/10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Global Talent Hunters. All rights reserved.
            </p>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
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
