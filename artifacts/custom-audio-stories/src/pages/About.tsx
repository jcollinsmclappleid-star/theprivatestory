import { motion } from "framer-motion";
import { Link } from "wouter";
import { Heart, Lock, Sparkles, Music, Check } from "lucide-react";

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
              A more private kind of storytelling
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
              The Private Story was created for people who want something more personal than a catalogue, and more private than a typical app.
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
              Most audio platforms offer the same experience to everyone. The story is already written. The tone is already decided. The moment is already fixed before you arrive.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              We wanted to create something more considered than that.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              The Private Story was built around a simple idea: <strong className="text-foreground">the experience feels better when it responds to you.</strong> When you can choose the mood, the atmosphere, the energy, and the kind of story you want to step into, it becomes more than content. It becomes something personal.
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
            <p className="text-muted-foreground">Four core principles shape everything we build.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: <Sparkles className="w-6 h-6 text-primary" />,
                title: "Personal, not generic",
                desc: "Every story begins with your choices. Instead of browsing something made for everyone, you can create something that feels closer to what you actually want.",
              },
              {
                icon: <Lock className="w-6 h-6 text-primary" />,
                title: "Private by design",
                desc: "Your stories are saved to your private library and are intended to be visible only to you. This is a personal experience, not a social one.",
              },
              {
                icon: <Heart className="w-6 h-6 text-primary" />,
                title: "Premium in tone",
                desc: "We care deeply about how the product feels. Calm, elegant, emotionally intelligent, and immersive — never loud, cheap, or mechanical.",
              },
              {
                icon: <Music className="w-6 h-6 text-primary" />,
                title: "More than a single moment",
                desc: "Alongside your private library, paid access includes a curated collection with regular new releases, so there is always something to return to.",
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
              We believe intimacy is not about volume. It is about <strong className="text-foreground">atmosphere.</strong>
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              It is the comfort of privacy. The pleasure of being able to choose. The difference between consuming content and stepping into something that feels more thoughtful, more emotionally attuned, and more your own.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-8 border-primary/20 bg-primary/5">
            <p className="text-center text-foreground text-xl leading-relaxed italic">
              That is what The Private Story is here to offer: a more private, more personal, more beautifully considered kind of listening experience.
            </p>
          </div>

          <div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-4">For people who value privacy, choice, and feeling</h3>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              The Private Story is designed for adults who want storytelling that feels:
            </p>
            <ul className="space-y-3">
              {[
                "More personal than a standard library",
                "More discreet than a social platform",
                "More emotionally aware than a generic app",
                "More refined than most digital story platforms",
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
            <div className="grid md:grid-cols-5 gap-4">
              {[
                "Privacy",
                "Personalisation",
                "Atmosphere",
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
              We know a product like this only works if it feels safe, considered, and worth returning to. That is the standard we hold ourselves to in every part of the experience.
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
            If you have been looking for something more personal than a catalogue, this is where to start. Create a story shaped around your mood, your choices, and your moment — and keep it where it belongs: yours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/create"
              className="px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
            >
              Create My Story
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 rounded-lg border border-primary/30 text-primary font-semibold hover:bg-primary/10 transition-colors"
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
