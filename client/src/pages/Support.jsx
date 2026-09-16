import { Link } from "react-router-dom";
import { LifeBuoy, MessageCircle, Ticket, BookOpen } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = [
  ["How do I receive my product after purchase?", "Instantly. Once your payment is confirmed, your license is generated and the resource becomes available in your dashboard under Downloads."],
  ["Which frameworks are supported?", "Most resources support QBCore, Qbox and ESX. Check the compatibility section on each product page."],
  ["Can I get a refund?", "Due to the digital nature of our products, refunds are handled case-by-case. Open a ticket under the Purchase category."],
  ["How do I get support?", "Open a support ticket from your dashboard or join our Discord community for faster help."],
];

export default function Support() {
  const { user, settings } = useAuth();
  return (
    <div>
      <section className="relative border-b border-white/10 overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="vx-container relative py-14">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Support</p>
          <h1 className="font-display font-black uppercase text-4xl mt-2">How can we help?</h1>
          <p className="mt-4 text-muted-foreground max-w-xl">Get help with installation, licensing, bugs and purchases. Our team responds fast.</p>
        </div>
      </section>

      <div className="vx-container py-12">
        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {[
            { icon: Ticket, title: "Open a Ticket", desc: "Create a private support ticket and track responses.", action: user ? { to: "/dashboard/support", label: "New Ticket" } : { to: "/login", label: "Sign in to open" } },
            { icon: MessageCircle, title: "Join Discord", desc: "Chat with the community and our staff in real time.", href: settings?.discord?.invite || "#" },
            { icon: BookOpen, title: "Read the Docs", desc: "Installation guides, exports, events and troubleshooting.", to: "/documentation" },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl border border-white/10 bg-card p-6 card-glow transition-all">
              <c.icon className="h-6 w-6 text-white" />
              <h3 className="mt-4 font-display font-bold text-lg">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
              <div className="mt-5">
                {c.href ? (
                  <Button asChild variant="outline" className="border-white/15 hover:bg-white/5"><a href={c.href} target="_blank" rel="noreferrer">Join</a></Button>
                ) : c.action ? (
                  <Button asChild className="bg-white text-black hover:bg-white/90 font-semibold" data-testid="support-open-ticket"><Link to={c.action.to}>{c.action.label}</Link></Button>
                ) : (
                  <Button asChild variant="outline" className="border-white/15 hover:bg-white/5"><Link to={c.to}>Open</Link></Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-3xl">
          <h2 className="font-display font-bold text-2xl mb-6 flex items-center gap-2"><LifeBuoy className="h-5 w-5" /> Frequently asked questions</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ.map(([q, a], i) => (
              <AccordionItem key={i} value={`item-${i}`} data-testid={`faq-${i}`} className="rounded-xl border border-white/10 bg-card px-5">
                <AccordionTrigger className="text-left hover:no-underline">{q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
