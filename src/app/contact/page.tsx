"use client";

import React, { useState } from "react";
import { useToast } from "@/context/ToastContext";
import { Mail, Phone, MapPin, Send, HelpCircle, ChevronDown } from "lucide-react";

export default function ContactPage() {
  const { toast } = useToast();
  
  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How far in advance do I need to order a custom cake?",
      a: "For custom theme cakes and wedding structures, we require at least 3 to 5 days advance booking to ensure our chef designers can source unique decorations and sculpt details. Standard signature cakes can be ordered 24 hours in advance.",
    },
    {
      q: "Do you offer 100% eggless cakes?",
      a: "Yes! We have a dedicated eggless line including chocolate truffle, fresh fruits, and cardamom pistachio cakes. All eggless products are baked in separate pans and ovens to prevent any cross-contamination.",
    },
    {
      q: "How do you deliver the cakes without damage?",
      a: "We operate a temperature-controlled delivery fleet. Cakes are locked in custom shock-absorbing boxes packed with ice gel sheets to ensure they arrive perfectly set and chilled.",
    },
    {
      q: "Can I customize the sweetness level of my cake?",
      a: "Absolutely. During custom checkout or by calling our boutique agent, you can request reduced sugar levels or alternative sweeteners like organic honey or stevia.",
    },
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast("Please fill in all required contact fields.", "error");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      toast("Thank you! Your message has been received. Our team will get back to you shortly.", "success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setIsSubmitting(false);
    }, 1500);
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="flex flex-col gap-28 pb-28 bg-[#FFFDF8] dark:bg-[#181213] transition-colors duration-300">
      
      {/* 1. Header banner */}
      <section className="relative py-24 sm:py-32 bg-[#FFFDF8] dark:bg-[#181213]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-4">
          <span className="text-primary tracking-[0.25em] uppercase text-xs font-semibold">
            Contact Boutique
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
            We Would Love To Hear From You
          </h1>
          <div className="w-12 h-[2px] bg-primary mt-2" />
        </div>
      </section>

      {/* 2. Contact details & Form */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* Left Side: Info & Map */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">Get In Touch</h2>
            <p className="text-sm text-foreground/75 leading-relaxed max-w-md">
              Have questions about sizing, custom pricing or order tracking? Drop by our boutique arcade or reach out via phone or email.
            </p>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-card border border-border p-6 rounded-3xl flex items-start gap-4 shadow-sm">
              <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="text-left">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/45">Call Us</h3>
                <p className="text-sm font-semibold mt-1.5 text-foreground/80">+91 98765 43210</p>
                <p className="text-[10px] text-foreground/45 mt-0.5">Mon - Sat, 9am - 9pm</p>
              </div>
            </div>

            <div className="bg-card border border-border p-6 rounded-3xl flex items-start gap-4 shadow-sm">
              <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="text-left">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/45">Email Support</h3>
                <p className="text-sm font-semibold mt-1.5 text-foreground/80">hello@sweetdelights.com</p>
                <p className="text-[10px] text-foreground/45 mt-0.5">We reply within 2 hours</p>
              </div>
            </div>

            <div className="bg-card border border-border p-6 rounded-3xl flex items-start gap-4 sm:col-span-2 shadow-sm">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="text-left">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/45">Our Boutique</h3>
                <p className="text-sm font-semibold mt-1.5 text-foreground/80 leading-relaxed">
                  123 Baker's Street, Luxury Arcade, Connaught Place, New Delhi - 110001
                </p>
              </div>
            </div>
          </div>

          {/* Google Maps Iframe */}
          <div className="w-full h-72 rounded-3xl overflow-hidden border border-border relative shadow-sm">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.996160167888!2d77.21672131508272!3d28.630456982417717!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd37e7df2eb9%3A0xe543e33c6753ab02!2sConnaught%20Place%2C%20New%20Delhi%2C%20Delhi%20110001!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
            />
          </div>
        </div>

        {/* Right Side: Message Form */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm flex flex-col gap-6">
          <div className="text-left">
            <h3 className="font-serif text-xl sm:text-2xl font-bold">Send A Message</h3>
            <p className="text-xs text-foreground/50 mt-1.5">Please fill in details to contact our kitchen.</p>
          </div>

          <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rachel Green"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary mt-1 shadow-sm"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rachel@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary mt-1 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Subject</label>
              <input
                type="text"
                placeholder="How can we help?"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary mt-1 shadow-sm"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Message *</label>
              <textarea
                required
                rows={5}
                placeholder="Write your query details here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary mt-1 resize-none shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full py-4 px-6 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Send Inquiry
                </>
              )}
            </button>
          </form>
        </div>

      </section>

      {/* 3. Frequently Asked Questions (FAQ Accordion) */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 w-full">
        <div className="text-center flex flex-col items-center gap-3 mb-16">
          <span className="text-primary uppercase tracking-[0.2em] font-bold text-[10px]">
            Have Queries?
          </span>
          <h2 className="font-serif text-3xl font-bold text-foreground">Frequently Asked Questions</h2>
          <div className="w-12 h-[2px] bg-primary rounded-full mt-2" />
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300 shadow-sm"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left gap-4"
                >
                  <span className="text-sm font-bold text-foreground flex items-center gap-2">
                    <HelpCircle className="w-4.5 h-4.5 text-primary shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-foreground/50 transition-transform duration-300 ${
                      isOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 border-t border-border/60">
                    <p className="text-xs text-foreground/70 leading-relaxed pl-6.5">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
