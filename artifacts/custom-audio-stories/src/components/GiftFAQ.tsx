import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    q: "How personalised is the story?",
    a: "Deeply personalised. Your names, your relationship details, your setting choice, your mood, and any special memory you share are all woven directly into the narrative. This isn't a template with names swapped in — it's a story shaped around who you are.",
  },
  {
    q: "Is this a good gift for a partner?",
    a: "It's one of the most thoughtful gifts you can give. A romantic audio story says you took time to create something unique — not just ordered something from a shelf. It's intimate, private, and completely made for them.",
  },
  {
    q: "How long does delivery take?",
    a: "Standard delivery is within 24 hours. If you select Priority Delivery (2 hours) or Same-Day Rush (4 hours guaranteed), your story will be ready much sooner — perfect if you need it for tonight.",
  },
  {
    q: "Can I choose the tone and setting?",
    a: "Yes, completely. You choose the mood, the setting, the voice, the length, and the emotional style. Every element of the story is selected by you during the builder.",
  },
  {
    q: "Is the billing discreet?",
    a: "Completely. Your statement will show a neutral charge, never the product name. Your story details are never stored publicly or shared with anyone.",
  },
  {
    q: "Will I receive an audio file?",
    a: "Yes — you'll receive a fully produced audio file, narrated in your chosen voice. You can listen on any device, privately, whenever you choose.",
  },
  {
    q: "Can I request changes after I receive the story?",
    a: "We'll always do our best to get it right first time. If something feels off — a name misspelled, a detail missed — reach out and we'll revise it. Your story should feel exactly right.",
  },
  {
    q: "Can I buy this for an anniversary or birthday?",
    a: "Absolutely. Many of our stories are created for exactly these occasions. You can select the occasion during the builder, and the story will reflect that context naturally.",
  },
  {
    q: "What if I want a second story, or a different version?",
    a: "You can add a Couple Bundle (a second story from a different perspective) or an Alternate Version (same emotional arc, different tone) directly in the add-ons step. Or simply order again — each story is unique.",
  },
];

export function GiftFAQ() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {FAQ_ITEMS.map((item, i) => (
        <AccordionItem
          key={i}
          value={`faq-${i}`}
          className="border-border/30"
        >
          <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline text-sm font-medium py-4">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
