import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, ChevronLeft, ChevronRight, Check, Gift as GiftIcon, Sparkles, Star,
  Music, Mic, Clock, Plus, Minus, ShieldCheck, Package, ArrowRight,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { GiftFAQ } from "@/components/GiftFAQ";
import { cn } from "@/lib/utils";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GiftOrderPayload {
  recipientType: string;
  occasion: string;
  yourName: string;
  partnerName: string;
  nickname: string;
  relationshipDetail: string;
  specialMemory: string;
  mood: string;
  setting: string;
  customSetting: string;
  voicePreference: string;
  storyLength: string;
  addons: string[];
  giftMessage: string;
  basePrice: number;
  addonTotal: number;
  finalPrice: number;
}

export interface GiftBuilderState {
  recipientType: string;
  occasion: string;
  yourName: string;
  partnerName: string;
  nickname: string;
  relationshipDetail: string;
  specialMemory: string;
  mood: string;
  setting: string;
  customSetting: string;
  voicePreference: string;
  storyLength: string;
  addons: string[];
  giftMessage: string;
}

const DEFAULT_STATE: GiftBuilderState = {
  recipientType: "",
  occasion: "",
  yourName: "",
  partnerName: "",
  nickname: "",
  relationshipDetail: "",
  specialMemory: "",
  mood: "",
  setting: "",
  customSetting: "",
  voicePreference: "",
  storyLength: "Standard",
  addons: [],
  giftMessage: "",
};

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

interface LengthOption {
  key: string;
  label: string;
  subtitle: string;
  duration: string;
  price: number;
  popular?: boolean;
}

const LENGTH_OPTIONS: LengthOption[] = [
  { key: "Short", label: "Short Story", subtitle: "A beautiful introduction", duration: "5–7 mins", price: 9.99 },
  { key: "Standard", label: "Standard Story", subtitle: "The complete experience", duration: "10–12 mins", price: 17.99, popular: true },
  { key: "Deluxe", label: "Deluxe Story", subtitle: "Deeply immersive & cinematic", duration: "15–20 mins", price: 24.99 },
];

interface Addon {
  id: string;
  label: string;
  description: string;
  price: number;
  icon: React.ReactNode;
}

const ADDONS: Addon[] = [
  { id: "music", label: "Background Music", description: "A bespoke ambient score woven throughout your story", price: 3.99, icon: <Music className="w-4 h-4" /> },
  { id: "extra_scene", label: "Extra Personalised Scene", description: "An additional scene built around your shared memory", price: 5.99, icon: <Sparkles className="w-4 h-4" /> },
  { id: "gift_intro", label: "Gift Message Intro", description: "Your personal message spoken at the very opening", price: 2.99, icon: <Heart className="w-4 h-4" /> },
  { id: "alternate", label: "Alternate Version", description: "A second take with a contrasting emotional tone", price: 7.99, icon: <Star className="w-4 h-4" /> },
  { id: "keepsake", label: "Keepsake Cover Art", description: "A beautiful downloadable illustration to keep forever", price: 4.99, icon: <Package className="w-4 h-4" /> },
  { id: "couple_bundle", label: "Couple Bundle", description: "A second story told from a different perspective", price: 14.99, icon: <GiftIcon className="w-4 h-4" /> },
  { id: "priority", label: "Priority Delivery", description: "Your story crafted and delivered within 2 hours", price: 4.99, icon: <Clock className="w-4 h-4" /> },
  { id: "rush", label: "Same-Day Rush", description: "Guaranteed delivery within 4 hours, any time of day", price: 6.99, icon: <ArrowRight className="w-4 h-4" /> },
];

function usePricing(state: GiftBuilderState) {
  const option = LENGTH_OPTIONS.find((o) => o.key === state.storyLength);
  const basePrice = option?.price ?? 0;
  const addonTotal = state.addons.reduce((sum, id) => {
    const addon = ADDONS.find((a) => a.id === id);
    return sum + (addon?.price ?? 0);
  }, 0);
  const finalTotal = basePrice + addonTotal;
  return { basePrice, addonTotal, finalTotal };
}

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

function SelectCard({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-2xl border transition-all focus:outline-none",
        selected
          ? "border-primary bg-primary/10 shadow-[0_0_24px_-6px_hsl(37_42%_68%_/_0.35)]"
          : "border-border/30 bg-card/40 hover:border-primary/40 hover:bg-primary/5",
        className,
      )}
    >
      {children}
    </button>
  );
}

function StepHeader({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <p className="text-xs font-medium uppercase tracking-widest text-primary mb-2">
        Step {step} of 9
      </p>
      <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function PriceBadge({ total }: { total: number }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
      <span className="text-xs text-muted-foreground">Total</span>
      <span className="font-display font-bold text-primary text-lg">£{total.toFixed(2)}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1: Who is this for?
// ---------------------------------------------------------------------------

const RECIPIENT_OPTIONS = [
  { id: "me", label: "For Me", description: "A personal romantic audio experience just for you" },
  { id: "partner", label: "For My Partner", description: "A gift your partner will listen to tonight" },
  { id: "both", label: "For Both of Us", description: "Something to experience together, side by side" },
  { id: "occasion", label: "A Special Occasion", description: "An anniversary, birthday, or meaningful moment" },
];

const OCCASION_TAGS = [
  "Anniversary", "Birthday", "Valentine's", "Just Because", "Long Distance", "Date Night Surprise",
];

function Step1({
  state,
  update,
}: {
  state: GiftBuilderState;
  update: (field: keyof GiftBuilderState, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <StepHeader step={1} title="Who is this for?" subtitle="Let's start with the heart of your gift." />
      <div className="grid grid-cols-1 gap-3">
        {RECIPIENT_OPTIONS.map((opt) => (
          <SelectCard key={opt.id} selected={state.recipientType === opt.id} onClick={() => update("recipientType", opt.id)}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground text-sm">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
              </div>
              {state.recipientType === opt.id && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
            </div>
          </SelectCard>
        ))}
      </div>

      {(state.recipientType === "occasion" || state.recipientType === "partner") && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="pt-4"
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">What's the occasion?</p>
          <div className="flex flex-wrap gap-2">
            {OCCASION_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => update("occasion", state.occasion === tag ? "" : tag)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                  state.occasion === tag
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2: Story Mood
// ---------------------------------------------------------------------------

const MOOD_OPTIONS = [
  { id: "Romantic", label: "Romantic", description: "Tender, intimate, and full of feeling" },
  { id: "Intimate", label: "Intimate", description: "Close, quiet, and deeply personal" },
  { id: "Slow Burn", label: "Slow Burn", description: "Languid tension that builds beautifully" },
  { id: "Playful", label: "Playful", description: "Light-hearted, warm, and full of charm" },
  { id: "Deeply Emotional", label: "Deeply Emotional", description: "Raw, vulnerable, and profoundly moving" },
  { id: "Passionate", label: "Passionate", description: "Intense, magnetic, and electric" },
  { id: "Comforting Night Story", label: "Comforting Night Story", description: "Soft and soothing — made for falling asleep to" },
];

function Step2({ state, update }: { state: GiftBuilderState; update: (f: keyof GiftBuilderState, v: string) => void }) {
  return (
    <div className="space-y-4">
      <StepHeader step={2} title="What's the mood?" subtitle="Choose the emotional tone that feels right for this gift." />
      <div className="grid grid-cols-1 gap-3">
        {MOOD_OPTIONS.map((opt) => (
          <SelectCard key={opt.id} selected={state.mood === opt.id} onClick={() => update("mood", opt.id)}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground text-sm">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
              </div>
              {state.mood === opt.id && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
            </div>
          </SelectCard>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3: Personal Details
// ---------------------------------------------------------------------------

function InputField({
  label,
  sublabel,
  placeholder,
  value,
  onChange,
  required,
  multiline,
}: {
  label: string;
  sublabel?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  multiline?: boolean;
}) {
  const baseClass =
    "w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors";

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">
        {label}{" "}
        {required ? (
          <span className="text-primary">*</span>
        ) : (
          <span className="text-muted-foreground font-normal text-xs">(optional)</span>
        )}
      </label>
      {sublabel && <p className="text-xs text-muted-foreground mb-2">{sublabel}</p>}
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(baseClass, "resize-none")}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={baseClass}
        />
      )}
    </div>
  );
}

function Step3({ state, update }: { state: GiftBuilderState; update: (f: keyof GiftBuilderState, v: string) => void }) {
  return (
    <div className="space-y-4">
      <StepHeader step={3} title="Make it personal." subtitle="These details are woven into your story — the more you share, the more it feels like it was made just for you." />
      <div className="glass-panel rounded-2xl p-6 space-y-5">
        <InputField
          required
          label="Your Name"
          placeholder="How should the story address you?"
          value={state.yourName}
          onChange={(v) => update("yourName", v)}
        />
        <InputField
          required
          label="Your Partner's Name"
          placeholder="The name that makes your heart soften"
          value={state.partnerName}
          onChange={(v) => update("partnerName", v)}
        />
        <InputField
          label="Nickname or Term of Endearment"
          placeholder="e.g. 'my love', 'darling', a private name…"
          value={state.nickname}
          onChange={(v) => update("nickname", v)}
        />
        <InputField
          label="A Little About Your Relationship"
          sublabel="How long together? What makes it special?"
          placeholder="e.g. 'We've been together 4 years and met at a bookshop in the rain…'"
          value={state.relationshipDetail}
          onChange={(v) => update("relationshipDetail", v)}
          multiline
        />
        <InputField
          label="A Special Memory or Meaningful Detail"
          sublabel="Woven into the fabric of your story"
          placeholder="e.g. 'Our first dance was in the kitchen at 2am…'"
          value={state.specialMemory}
          onChange={(v) => update("specialMemory", v)}
          multiline
        />
        <InputField
          label="A Personal Gift Message"
          sublabel="Optionally spoken at the start of your story"
          placeholder="Something from you, in your own words…"
          value={state.giftMessage}
          onChange={(v) => update("giftMessage", v)}
          multiline
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4: Setting
// ---------------------------------------------------------------------------

const SETTING_OPTIONS = [
  { id: "Luxury Hotel", label: "Luxury Hotel", description: "White sheets, city lights, and a night with no end" },
  { id: "Beach at Night", label: "Beach at Night", description: "Salt air, stars, and the sound of waves in the dark" },
  { id: "Rainy City Evening", label: "Rainy City Evening", description: "Neon reflections, a warm coat, and nowhere else to be" },
  { id: "Candlelit Apartment", label: "Candlelit Apartment", description: "Soft light, warm wine, and an evening that belongs to you" },
  { id: "Weekend Getaway", label: "Weekend Getaway", description: "A cottage, a car, and two days with no agenda" },
  { id: "Private Dinner", label: "Private Dinner", description: "A table for two, perfectly set, and a night ahead of you" },
  { id: "Custom", label: "Somewhere of Your Own", description: "Describe your own unique setting below" },
];

function Step4({ state, update }: { state: GiftBuilderState; update: (f: keyof GiftBuilderState, v: string) => void }) {
  return (
    <div className="space-y-4">
      <StepHeader step={4} title="Set the scene." subtitle="Where does your story take place? Choose the atmosphere that calls to you." />
      <div className="grid grid-cols-1 gap-3">
        {SETTING_OPTIONS.map((opt) => (
          <SelectCard key={opt.id} selected={state.setting === opt.id} onClick={() => update("setting", opt.id)}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground text-sm">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
              </div>
              {state.setting === opt.id && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
            </div>
          </SelectCard>
        ))}
      </div>

      {state.setting === "Custom" && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <textarea
            rows={3}
            value={state.customSetting}
            onChange={(e) => update("customSetting", e.target.value)}
            placeholder="Describe your setting — the more specific, the more vivid the story…"
            className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
          />
        </motion.div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 5: Voice Preference
// ---------------------------------------------------------------------------

const VOICE_OPTIONS = [
  { id: "Female Voice", label: "Female Voice", description: "Warm, clear, and intimately expressive" },
  { id: "Male Voice", label: "Male Voice", description: "Assured, measured, and quietly magnetic" },
  { id: "Soft British Tone", label: "Soft British Tone", description: "Unhurried and quietly elegant — like a letter read aloud" },
  { id: "Warm Neutral Tone", label: "Warm Neutral Tone", description: "Gentle and clear, with natural emotional texture" },
  { id: "Deep Soothing Tone", label: "Deep Soothing Tone", description: "Low, velvet, made for listening with your eyes closed" },
];

function Step5({ state, update }: { state: GiftBuilderState; update: (f: keyof GiftBuilderState, v: string) => void }) {
  return (
    <div className="space-y-4">
      <StepHeader step={5} title="Choose a voice." subtitle="The narrator's voice shapes everything. Pick the one that feels right for this story." />
      <div className="grid grid-cols-1 gap-3">
        {VOICE_OPTIONS.map((opt) => (
          <SelectCard key={opt.id} selected={state.voicePreference === opt.id} onClick={() => update("voicePreference", opt.id)}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mic className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-sm">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
              </div>
              {state.voicePreference === opt.id && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
            </div>
          </SelectCard>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 6: Story Length (pricing cards)
// ---------------------------------------------------------------------------

function Step6({ state, update }: { state: GiftBuilderState; update: (f: keyof GiftBuilderState, v: string) => void }) {
  return (
    <div className="space-y-4">
      <StepHeader step={6} title="How long should it be?" subtitle="Each tier is a complete experience — choose the depth that feels right." />
      <div className="grid grid-cols-1 gap-4">
        {LENGTH_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => update("storyLength", opt.key)}
            className={cn(
              "relative text-left p-5 rounded-2xl border transition-all focus:outline-none",
              state.storyLength === opt.key
                ? "border-primary bg-primary/10 shadow-[0_0_24px_-6px_hsl(37_42%_68%_/_0.35)]"
                : "border-border/30 bg-card/40 hover:border-primary/40",
            )}
          >
            {opt.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold tracking-wide">
                Most Popular
              </span>
            )}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-display font-bold text-foreground text-lg">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.subtitle}</p>
                <p className="text-xs text-muted-foreground/60 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {opt.duration}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-primary text-2xl">£{opt.price.toFixed(2)}</p>
                {state.storyLength === opt.key && (
                  <Check className="w-4 h-4 text-primary ml-auto mt-1" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 7: Add-ons
// ---------------------------------------------------------------------------

function Step7({
  state,
  toggleAddon,
  pricing,
}: {
  state: GiftBuilderState;
  toggleAddon: (id: string) => void;
  pricing: { basePrice: number; addonTotal: number; finalTotal: number };
}) {
  return (
    <div className="space-y-4">
      <StepHeader step={7} title="Enhance your gift." subtitle="Each add-on makes your story more unique, more meaningful, or more immediate." />
      <div className="grid grid-cols-1 gap-3">
        {ADDONS.map((addon) => {
          const isSelected = state.addons.includes(addon.id);
          return (
            <button
              key={addon.id}
              type="button"
              onClick={() => toggleAddon(addon.id)}
              className={cn(
                "w-full text-left p-4 rounded-2xl border transition-all focus:outline-none",
                isSelected
                  ? "border-primary bg-primary/10 shadow-[0_0_24px_-6px_hsl(37_42%_68%_/_0.35)]"
                  : "border-border/30 bg-card/40 hover:border-primary/40",
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}>
                  {isSelected ? <Check className="w-4 h-4" /> : addon.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">{addon.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{addon.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-primary text-sm">+£{addon.price.toFixed(2)}</span>
                  {isSelected ? (
                    <Minus className="w-4 h-4 text-primary" />
                  ) : (
                    <Plus className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {state.addons.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-primary/5 border border-primary/20"
        >
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Base story</span>
            <span className="text-foreground">£{pricing.basePrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-muted-foreground">Add-ons ({state.addons.length})</span>
            <span className="text-foreground">+£{pricing.addonTotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-primary/20 pt-3">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-display font-bold text-primary text-xl">£{pricing.finalTotal.toFixed(2)}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 8: Review Summary (pure review, no submit)
// ---------------------------------------------------------------------------

function ReviewRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border/30 last:border-0">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm text-foreground font-medium">{value}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="text-xs text-primary hover:text-primary/80 transition-colors flex-shrink-0 mt-1"
      >
        Edit
      </button>
    </div>
  );
}

function Step8({
  state,
  pricing,
  goToStep,
}: {
  state: GiftBuilderState;
  pricing: { basePrice: number; addonTotal: number; finalTotal: number };
  goToStep: (n: number) => void;
}) {
  const recipientLabel = RECIPIENT_OPTIONS.find((o) => o.id === state.recipientType)?.label ?? state.recipientType;
  const addonsLabel =
    state.addons.length === 0
      ? "None"
      : state.addons.map((id) => ADDONS.find((a) => a.id === id)?.label).filter(Boolean).join(", ");

  return (
    <div className="space-y-6">
      <StepHeader step={8} title="Your story, reviewed." subtitle="Check each detail below — use the edit links to change anything before confirming." />

      <div className="glass-panel rounded-2xl p-6 space-y-1">
        <ReviewRow label="This story is for" value={recipientLabel} onEdit={() => goToStep(0)} />
        {state.occasion && <ReviewRow label="Occasion" value={state.occasion} onEdit={() => goToStep(0)} />}
        <ReviewRow label="Mood" value={state.mood} onEdit={() => goToStep(1)} />
        <ReviewRow label="Your names" value={[state.yourName, state.partnerName].filter(Boolean).join(" & ")} onEdit={() => goToStep(2)} />
        {state.nickname && <ReviewRow label="Nickname" value={state.nickname} onEdit={() => goToStep(2)} />}
        {state.specialMemory && <ReviewRow label="Special memory" value={state.specialMemory.slice(0, 80) + (state.specialMemory.length > 80 ? "…" : "")} onEdit={() => goToStep(2)} />}
        <ReviewRow label="Setting" value={state.setting === "Custom" ? state.customSetting || "Custom" : state.setting} onEdit={() => goToStep(3)} />
        <ReviewRow label="Voice" value={state.voicePreference} onEdit={() => goToStep(4)} />
        <ReviewRow label="Length" value={`${state.storyLength} Story`} onEdit={() => goToStep(5)} />
        <ReviewRow label="Add-ons" value={addonsLabel} onEdit={() => goToStep(6)} />
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Base story ({state.storyLength})</span>
          <span className="text-foreground">£{pricing.basePrice.toFixed(2)}</span>
        </div>
        {pricing.addonTotal > 0 && (
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-muted-foreground">Add-ons ({state.addons.length})</span>
            <span className="text-foreground">+£{pricing.addonTotal.toFixed(2)}</span>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-border/30 pt-4">
          <span className="font-semibold text-foreground text-lg">Total</span>
          <span className="font-display font-bold text-primary text-3xl">£{pricing.finalTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 9: Checkout CTA (confirm & submit)
// ---------------------------------------------------------------------------

function Step9({
  state,
  pricing,
  goToStep,
  onSubmit,
  isSubmitting,
  error,
}: {
  state: GiftBuilderState;
  pricing: { basePrice: number; addonTotal: number; finalTotal: number };
  goToStep: (n: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  error: string | null;
}) {
  const addonsCount = state.addons.length;

  return (
    <div className="space-y-6">
      <StepHeader step={9} title="Ready to confirm?" subtitle="Your story is waiting. Place your order and we'll start crafting it immediately." />

      <div className="glass-panel rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground">{state.storyLength} Story</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {[state.yourName, state.partnerName].filter(Boolean).join(" & ")} · {state.mood}
              {addonsCount > 0 && ` · ${addonsCount} add-on${addonsCount > 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="text-right">
            <p className="font-display font-bold text-primary text-3xl">£{pricing.finalTotal.toFixed(2)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => goToStep(7)}
          className="text-xs text-primary hover:text-primary/80 transition-colors"
        >
          ← Review your details
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-card/40 border border-border/30 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <span className="text-foreground font-medium">Private & discreet.</span>{" "}
          Your story details stay completely private. Billing appears discreetly on your statement.
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full bg-primary text-primary-foreground py-5 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all hover:-translate-y-0.5 shadow-[0_0_48px_-12px_hsl(37_42%_68%_/_0.45)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" />
            Preparing your story…
          </>
        ) : (
          <>
            <Heart className="w-5 h-5" />
            Confirm Order · £{pricing.finalTotal.toFixed(2)}
          </>
        )}
      </button>

      <p className="text-center text-xs text-muted-foreground/50">
        By confirming you agree to our terms. Your story will be delivered digitally.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Confirmation screen
// ---------------------------------------------------------------------------

function ConfirmationScreen({ orderId }: { orderId: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center py-12 space-y-6"
    >
      <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
        <Heart className="w-10 h-10 text-primary" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-primary mb-3">Order Received</p>
        <h2 className="font-display text-4xl font-bold text-foreground mb-3">Your story is being crafted.</h2>
        <p className="text-muted-foreground max-w-md mx-auto text-lg leading-relaxed">
          We're personalising your romantic story now. You'll receive it digitally — private, perfect, and made entirely for you.
        </p>
      </div>
      <div className="p-5 rounded-2xl bg-card/40 border border-border/30 w-full max-w-sm text-left space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Order reference</p>
        <p className="font-mono text-sm text-foreground break-all">{orderId}</p>
        <p className="text-xs text-muted-foreground/60 pt-1">Keep this for your records.</p>
      </div>
      <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
        {[
          { icon: <ShieldCheck className="w-5 h-5 text-primary" />, label: "Private & discreet" },
          { icon: <Sparkles className="w-5 h-5 text-primary" />, label: "Fully personalised" },
          { icon: <Package className="w-5 h-5 text-primary" />, label: "Digital delivery" },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card/40 border border-border/20">
            {item.icon}
            <p className="text-xs text-muted-foreground text-center leading-snug">{item.label}</p>
          </div>
        ))}
      </div>
      <div className="w-full pt-4">
        <p className="text-sm text-muted-foreground/60 mb-6">Common questions about your order:</p>
        <GiftFAQ />
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Validation per step
// ---------------------------------------------------------------------------

function canAdvance(step: number, state: GiftBuilderState): boolean {
  switch (step) {
    case 0: return !!state.recipientType;
    case 1: return !!state.mood;
    case 2: return !!state.yourName && !!state.partnerName;
    case 3: return !!state.setting && (state.setting !== "Custom" || !!state.customSetting);
    case 4: return !!state.voicePreference;
    case 5: return !!state.storyLength;
    case 6: return true;
    case 7: return true;
    default: return true;
  }
}

// ---------------------------------------------------------------------------
// Main Gift component
// ---------------------------------------------------------------------------

const TOTAL_STEPS = 9;

export default function Gift() {
  const [currentStep, setCurrentStep] = useState(0);
  const [state, setState] = useState<GiftBuilderState>(DEFAULT_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const pricing = usePricing(state);

  const update = useCallback((field: keyof GiftBuilderState, value: string) => {
    setState((s) => ({ ...s, [field]: value }));
  }, []);

  const toggleAddon = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      addons: s.addons.includes(id) ? s.addons.filter((a) => a !== id) : [...s.addons, id],
    }));
  }, []);

  const goToStep = useCallback((n: number) => {
    setCurrentStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const next = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1) goToStep(currentStep + 1);
  }, [currentStep, goToStep]);

  const back = useCallback(() => {
    if (currentStep > 0) goToStep(currentStep - 1);
  }, [currentStep, goToStep]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const payload: GiftOrderPayload = {
        recipientType: state.recipientType,
        occasion: state.occasion,
        yourName: state.yourName,
        partnerName: state.partnerName,
        nickname: state.nickname,
        relationshipDetail: state.relationshipDetail,
        specialMemory: state.specialMemory,
        mood: state.mood,
        setting: state.setting,
        customSetting: state.customSetting,
        voicePreference: state.voicePreference,
        storyLength: state.storyLength,
        addons: state.addons,
        giftMessage: state.giftMessage,
        basePrice: pricing.basePrice,
        addonTotal: pricing.addonTotal,
        finalPrice: pricing.finalTotal,
      };
      const res = await fetch(`${API_BASE}/api/gift/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Something went wrong");
      }
      const data = await res.json() as { orderId: string };
      setOrderId(data.orderId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Unable to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [state, pricing]);

  const progressPercent = ((currentStep + 1) / TOTAL_STEPS) * 100;
  const ready = canAdvance(currentStep, state);

  if (orderId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 w-full">
        <ConfirmationScreen orderId={orderId} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 w-full">
      {/* Top header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest">
            <GiftIcon className="w-3 h-3" />
            Gift Builder
          </span>
          <PriceBadge total={pricing.finalTotal} />
        </div>
        <Progress value={progressPercent} className="h-1" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.22 }}
        >
          {currentStep === 0 && <Step1 state={state} update={update} />}
          {currentStep === 1 && <Step2 state={state} update={update} />}
          {currentStep === 2 && <Step3 state={state} update={update} />}
          {currentStep === 3 && <Step4 state={state} update={update} />}
          {currentStep === 4 && <Step5 state={state} update={update} />}
          {currentStep === 5 && <Step6 state={state} update={update} />}
          {currentStep === 6 && <Step7 state={state} toggleAddon={toggleAddon} pricing={pricing} />}
          {currentStep === 7 && (
            <Step8
              state={state}
              pricing={pricing}
              goToStep={goToStep}
            />
          )}
          {currentStep === 8 && (
            <Step9
              state={state}
              pricing={pricing}
              goToStep={goToStep}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              error={submitError}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation — shown for steps 0–7 (config + review); Step9 has its own submit */}
      {currentStep < 8 && (
        <div className="mt-8 flex items-center justify-between gap-4">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={back}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border/40 text-muted-foreground hover:text-foreground hover:border-border/70 transition-all text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}
          <button
            type="button"
            onClick={next}
            disabled={!ready}
            className={cn(
              "flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-sm transition-all",
              ready
                ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 shadow-[0_0_24px_-6px_hsl(37_42%_68%_/_0.35)]"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
          >
            {currentStep === 7 ? "Looks right — continue" : "Continue"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
