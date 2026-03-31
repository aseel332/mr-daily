"use client";

import { LandingHero } from "./LandingHero";
import { CallFeatureAnimation } from "./CallFeatureAnimation";
import { CalendarPlanningAnimation } from "./CalendarPlanningAnimation";
import { motion } from "framer-motion";
import { Phone, Calendar, Shield, Zap, CheckCircle2 } from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHero />

      {/* Feature 1: Call Management */}
      <section className="py-24 px-4 overflow-hidden">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/10 text-neon-cyan text-sm font-bold mb-6 border border-neon-cyan/20 shadow-[0_0_10px_rgba(0,240,255,0.1)]">
                <Phone className="w-4 h-4" />
                <span>Smart AI Calling</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
                Let Alfred handle the <br className="hidden md:block" /> talking for you.
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                From booking dinners to rescheduling dentist appointments, Alfred handles the complexity of voice communication so you don't have to.
              </p>
              <ul className="space-y-4">
                {[
                  "Natural voice conversations",
                  "Automated appointment booking",
                  "Real-time call transcripts",
                  "Smart phone number integration",
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-lg"
                  >
                    <CheckCircle2 className="w-5 h-5 text-neon-cyan" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50, rotate: 5 }}
              whileInView={{ opacity: 1, x: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-neon-cyan/20 blur-[100px] rounded-full -z-10" />
              <CallFeatureAnimation />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature 2: Calendar Optimization */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:order-2"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-violet/10 text-neon-violet text-sm font-bold mb-6 border border-neon-violet/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                <Calendar className="w-4 h-4" />
                <span>Dynamic Planning</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
                Proactive scheduling <br className="hidden md:block" /> that actually works.
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Alfred doesn't just store events; it optimizes your day based on your habits, energy levels, and priorities.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: "Conflict Resolution", desc: "No more overlapping meetings" },
                  { title: "Focus Blocks", desc: "Auto-protected deep work time" },
                  { title: "Multi-Sync", desc: "Works with all your calendars" },
                  { title: "Smart Buffer", desc: "Built-in travel and rest time" },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-sm hover:border-neon-violet/30 transition-colors">
                    <div className="font-bold mb-1">{item.title}</div>
                    <div className="text-sm text-muted-foreground">{item.desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:order-1"
            >
              <CalendarPlanningAnimation />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust/Social Proof Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-16">Why thousands trust Alfred</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center p-8 rounded-3xl bg-neon-cyan/5 border border-neon-cyan/20 neon-container">
              <div className="w-12 h-12 rounded-2xl bg-neon-cyan/20 flex items-center justify-center text-neon-cyan mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-zinc-100">Lightning Fast</h3>
              <p className="text-zinc-500 text-center">Tasks that took hours now happen in seconds. Literally.</p>
            </div>
            <div className="flex flex-col items-center p-8 rounded-3xl bg-neon-violet/5 border border-neon-violet/20 neon-container">
              <div className="w-12 h-12 rounded-2xl bg-neon-violet/20 flex items-center justify-center text-neon-violet mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-zinc-100">Privacy First</h3>
              <p className="text-zinc-500 text-center">Your data is encrypted and stays between you and Alfred.</p>
            </div>
            <div className="flex flex-col items-center p-8 rounded-3xl bg-neon-rose/5 border border-neon-rose/20 neon-container">
              <div className="w-12 h-12 rounded-2xl bg-neon-rose/20 flex items-center justify-center text-neon-rose mb-6">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-zinc-100">99.9% Accurate</h3>
              <p className="text-zinc-500 text-center">Alfred understands context and nuances in every conversation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / CTA */}
      <section className="py-24 px-4 bg-foreground text-background">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">Ready to reclaim your time?</h2>
          <p className="text-xl opacity-80 mb-12 max-w-2xl mx-auto">
            Join the elite circle of professionals who have automated their daily logistics with Alfred.
          </p>
          <button className="bg-white text-black font-bold py-4 px-10 rounded-full text-lg hover:scale-105 transition-transform active:scale-95 shadow-xl">
            Get Started with Alfred
          </button>
        </div>
      </section>
    </div>
  );
}
