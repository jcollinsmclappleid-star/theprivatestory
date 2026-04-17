import { motion } from "framer-motion";
import { Link } from "wouter";
import { Heart, Lock, Music, Check, Sparkles, Clock } from "lucide-react";
import { MiniDoorCTA } from "@/components/ThreeDoors";

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="text-primary text-sm uppercase tracking-widest font-semibold mb-4">Our story</p>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Built with the female imagination at its centre
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
              Not a catalogue. Not a stream. The Private Story was built for the female imagination: intimate audio stories — personalised, private, and exactly as far as you want to go.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Philosophy */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">Why we built it</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              Most audio platforms offer the same experience to everyone. The story is already written. The tone is already decided. The intimacy — or the lack of it — is already fixed before you arrive.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              We wanted to build something different. Something that actually responds to female desire rather than assuming it.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              The Private Story was built for anyone who wants storytelling that responds to them — with the female imagination explicitly at its centre. <strong className="text-foreground">When you choose the mood, the chemistry, the cast, the intensity — and how far it goes — the story stops being content and becomes something genuinely yours.</strong>
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-8 border-primary/20 bg-primary/5">
            <p className="text-foreground text-lg leading-relaxed italic">
              What makes an experience compelling is rarely excess. It is <strong>attention.</strong> It is <strong>privacy.</strong> It is <strong>emotional tone.</strong> It is the sense that something is unfolding at the right pace, in the right way, with the right feeling. That is what we design around.
            </p>
          </div>
        </motion.div>
      </section>

      {/* What Makes Us Different */}
      <section className="bg-background/50 border-y border-border/40 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">What makes us different</h2>
            <p className="text-muted-foreground">Four principles that shape everything we build.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: <Sparkles className="w-6 h-6 text-primary" />,
                title: "Female-first by design",
                desc: "Built for the female imagination — not adapted from it. Every choice in the experience, from the chemistry options to the intensity dial, is designed around the female imagination and what it actually wants from a story.",
              },
              {
                icon: <Lock className="w-6 h-6 text-primary" />,
                title: "Private by design",
                desc: "Your stories are saved to your private archive and are visible only to you. No social features, no browsing history, no judgement. A personal experience — entirely your own.",
              },
              {
                icon: <Heart className="w-6 h-6 text-primary" />,
                title: "Intimate without apology",
                desc: "From slow romantic tension to fully unrestrained — you set exactly how far the story goes. The Private Story doesn't sanitise desire. It responds to it, at the level you choose.",
              },
              {
                icon: <Music className="w-6 h-6 text-primary" />,
                title: "More than a single moment",
                desc: "Alongside your own creations, members receive a curated story each month — a carefully chosen extra to return to between your own. Something to listen to tonight.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-panel rounded-2xl p-6 border-primary/20"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Experience */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="space-y-10"
        >
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-6">The experience we believe in</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              We believe intimacy is not about volume. It is about <strong className="text-foreground">atmosphere — and the freedom to choose exactly what you want.</strong>
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              The comfort of complete privacy. The pleasure of choosing exactly who, exactly how, and exactly how far. The difference between consuming something made for everyone and stepping into something intimate — built around female desire, shaped by the female imagination.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-8 border-primary/20 bg-primary/5">
            <p className="text-center text-foreground text-xl leading-relaxed italic">
              That is what The Private Story is here to offer: a more private, more personal, more beautifully considered kind of intimate listening experience — built around female desire, open to anyone who wants it.
            </p>
          </div>

          <div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-4">For those who want desire, privacy, and control</h3>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              The Private Story is for anyone who wants storytelling that feels:
            </p>
            <ul className="space-y-3">
              {[
                "Made for the female imagination — not generic",
                "Intimate enough to go exactly as far as you want",
                "Private by design — no history, no sharing, no judgement",
                "Premium in craft, and unrestrained where you choose",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-lg">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </section>

      {/* Our Promise */}
      <section className="bg-primary/8 border-y border-primary/20 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl font-bold text-foreground mb-6">Our promise</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              We will keep building The Private Story around the things that matter most:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                "Privacy",
                "Desire",
                "Female-first",
                "Quality",
                "Trust",
              ].map((value) => (
                <div
                  key={value}
                  className="glass-panel rounded-xl p-4 border-primary/20 text-center"
                >
                  <p className="font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed mt-8">
              We know a product like this only works if it feels safe, considered, and built around the audience that uses it — with the female imagination genuinely at its centre. That is the standard we hold ourselves to in every part of the experience.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">Begin privately</h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
            If you have been looking for intimate audio stories built with the female imagination at their centre — personalised around your desire, your cast, and your level of intensity — this is where to start. In under three minutes. Kept entirely private.
          </p>
          <div className="flex flex-col items-center gap-6">
            <MiniDoorCTA />
            <Link
              href="/pricing"
              className="px-6 py-3 rounded-lg border border-primary/30 text-primary font-semibold hover:bg-primary/10 transition-colors text-sm"
            >
              View Pricing
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Closing Text */}
      <section className="bg-background/50 border-t border-border/40 py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-muted-foreground text-sm">
            Questions?{" "}
            <a href="mailto:support@theprivatestory.com" className="text-primary hover:underline">support@theprivatestory.com</a>
          </p>
        </div>
      </section>
    </motion.div>
  );
}
