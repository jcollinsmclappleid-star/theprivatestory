import { motion } from "framer-motion";
import { Shield, Lock, Trash2, Database, Eye, UserX, Link as LinkIcon } from "lucide-react";
import { Link } from "wouter";

export default function Privacy() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto px-4 py-16"
    >
      <div className="mb-12">
        <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-5">
          Privacy
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-5 leading-tight">
          We built it so we can't share it,<br className="hidden md:block" /> even if we wanted to.
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          This isn't a legal document. It's a plain explanation of what we do and don't hold on to — because you have a right to know, and you deserve a straight answer.
        </p>
      </div>

      <div className="space-y-12">

        {/* What we store */}
        <section>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">What we store</h2>
              <p className="text-muted-foreground text-sm">Three things. Nothing more.</p>
            </div>
          </div>
          <div className="space-y-3 pl-14">
            {[
              {
                title: "Your email address",
                desc: "So you can sign in and access your library. We don't use it for marketing. We don't share it.",
              },
              {
                title: "Your stories",
                desc: "The stories you've created are saved to your private library. Only you can see them. No one else — not us, not a moderator, not an algorithm — is reading your stories.",
              },
              {
                title: "Your progress",
                desc: "Where you left off in a story, so you can pick up exactly where you stopped. That's it.",
              },
            ].map((item) => (
              <div key={item.title} className="glass-panel rounded-xl p-4">
                <p className="font-semibold text-foreground text-sm mb-1">{item.title}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What we don't store */}
        <section>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <UserX className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">What we don't store</h2>
              <p className="text-muted-foreground text-sm">Things we deliberately chose not to collect.</p>
            </div>
          </div>
          <div className="pl-14 space-y-2">
            {[
              "Your real name",
              "Your location",
              "Your payment card details (handled entirely by our payment processor — we never see them)",
              "Your browsing behaviour outside of this site",
              "Any social graph or activity feed",
              "What you searched for, clicked on, or nearly chose",
              "Any profile visible to other users — there are no other users to show it to",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5 py-2 border-b border-border/20 last:border-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 flex-shrink-0 mt-2" />
                <p className="text-muted-foreground text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* No AI training */}
        <section>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Shield className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">Your stories don't train AI</h2>
            </div>
          </div>
          <div className="pl-14">
            <p className="text-muted-foreground text-sm leading-relaxed">
              The stories we generate for you are not used to train AI models — not ours, not anyone else's. What you ask for stays between you and the story. Full stop.
            </p>
          </div>
        </section>

        {/* No advertising */}
        <section>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Eye className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">No advertising. No data sale.</h2>
            </div>
          </div>
          <div className="pl-14">
            <p className="text-muted-foreground text-sm leading-relaxed mb-3">
              We don't run ads. We don't sell your data. We don't share your information with third parties for marketing purposes.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We are also web-only by design. There's no app to download, no icon on your phone, no push notifications. Nothing that leaves a trace you didn't choose to leave.
            </p>
          </div>
        </section>

        {/* Third-party services */}
        <section>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <LinkIcon className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">Third-party services we use</h2>
            </div>
          </div>
          <div className="pl-14">
            <p className="text-muted-foreground text-sm leading-relaxed mb-3">
              We use a small number of third-party services to make the product work. Each one is selected because they have strong privacy commitments:
            </p>
            <div className="space-y-2">
              {[
                { name: "OpenAI", role: "Writes your story. Does not retain or train on your inputs by default under our API agreement." },
                { name: "ElevenLabs", role: "Narrates your story in the voice you choose. Audio is generated and served; not retained for model training." },
                { name: "Stripe (when payment is required)", role: "Handles payment. We never see your card number — it goes directly to Stripe." },
              ].map((s) => (
                <div key={s.name} className="glass-panel rounded-xl p-4">
                  <p className="font-semibold text-foreground text-sm mb-1">{s.name}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Delete everything */}
        <section>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">Delete everything, anytime</h2>
            </div>
          </div>
          <div className="pl-14">
            <p className="text-muted-foreground text-sm leading-relaxed mb-3">
              You can delete your account and everything associated with it at any time. When you do, we permanently remove your stories, your progress, and your email from our systems.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Deletion is not hidden behind a form or a support ticket. It is a single action, and it is irreversible.
            </p>
          </div>
        </section>

        {/* Lock icon — architectural privacy */}
        <section className="glass-panel rounded-2xl p-8 text-center border-primary/20">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground mb-3">Why we built it this way</h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto mb-3">
            Privacy isn't a policy we wrote to cover ourselves. It's a design decision we made at the start. We deliberately chose not to build social features, public profiles, or listening histories because we believe what you listen to privately should stay that way.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
            If you have a question about anything on this page, email us at <span className="text-primary">hello@theprivatestory.com</span>.
          </p>
        </section>

        <div className="text-center pt-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Back to home
          </Link>
        </div>

      </div>
    </motion.div>
  );
}
