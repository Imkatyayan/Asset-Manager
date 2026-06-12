"use client";

import { useState } from "react";
import {
  HelpCircle,
  Mail,
  MessageCircle,
  ChevronDown,
  FileSpreadsheet,
  Upload,
  BarChart3,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const faqs = [
  {
    q: "What CSV formats are supported?",
    a: "We support holdings exports from CDSL (DP statement), NSDL (CAS), Zerodha (Console holdings), Groww, and generic broker CSVs. The parser auto-detects column names like symbol, quantity, avg price, etc.",
  },
  {
    q: "Do I need to sign up to analyze my portfolio?",
    a: "No. You can upload a CSV on the Analyze page without creating an account. You'll get basic analysis including returns, sector allocation, and NIFTY 50/Sensex comparison. Sign up for free to unlock momentum analysis, fundamentals, and smart suggestions.",
  },
  {
    q: "How is my data stored?",
    a: "Guest uploads are processed in-memory and not stored. When you create an account and save a portfolio, your holdings are stored securely in your account. We never share your data with third parties.",
  },
  {
    q: "How accurate is the market data?",
    a: "Live prices, index levels, volume, and technical indicators are fetched from Yahoo Finance and refreshed every 5 minutes. Indian market news comes from Google News (India). Fundamental ratios (P/E, ROE) for known stocks use a reference dataset — always verify prices on the Markets page before making decisions.",
  },
  {
    q: "Is this investment advice?",
    a: "No. PortfolioIQ provides educational analysis and suggestions based on quantitative metrics. It is not SEBI-registered investment advice. Always consult a qualified financial advisor before making investment decisions.",
  },
  {
    q: "How do I export holdings from my broker?",
    a: "Zerodha: Console → Holdings → Download. Groww: Stocks → Holdings → Export. CDSL/NSDL: Download your demat statement from the respective portal. Save as CSV and upload here.",
  },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contactSent, setContactSent] = useState(false);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="text-center mb-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-light">
          <HelpCircle className="h-7 w-7 text-primary" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Help & Support</h1>
        <p className="mt-2 text-text-secondary">
          Everything you need to get started with PortfolioIQ
        </p>
      </div>

      {/* Quick guides */}
      <div className="grid gap-4 sm:grid-cols-3 mb-10">
        {[
          {
            icon: Upload,
            title: "Upload CSV",
            desc: "Drag & drop your holdings file on the Analyze page",
          },
          {
            icon: FileSpreadsheet,
            title: "Supported Formats",
            desc: "CDSL, NSDL, Zerodha, Groww, and generic CSVs",
          },
          {
            icon: BarChart3,
            title: "View Analysis",
            desc: "Returns, allocation, benchmarks, and suggestions",
          },
        ].map((guide) => (
          <Card key={guide.title}>
            <CardContent className="pt-5 text-center">
              <guide.icon className="mx-auto h-6 w-6 text-primary" />
              <h3 className="mt-3 text-sm font-semibold text-text-primary">{guide.title}</h3>
              <p className="mt-1 text-xs text-text-muted">{guide.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ */}
      <div id="faq" className="mb-10">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-lg border border-border bg-white">
              <button
                className="flex w-full items-center justify-between px-5 py-4 text-left"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="text-sm font-medium text-text-primary">{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 text-text-muted transition-transform ${
                    openFaq === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === i && (
                <div className="border-t border-border px-5 py-4">
                  <p className="text-sm text-text-secondary leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div id="contact">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-accent" />
              <CardTitle>Contact Us</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {contactSent ? (
              <div className="py-8 text-center">
                <Mail className="mx-auto h-8 w-8 text-primary" />
                <p className="mt-3 text-sm font-medium text-text-primary">
                  Message sent! We&apos;ll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setContactSent(true);
                }}
                className="space-y-4"
              >
                <Input id="contact-name" label="Name" placeholder="Your name" required />
                <Input
                  id="contact-email"
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
                <div className="space-y-1.5">
                  <label htmlFor="contact-message" className="block text-sm font-medium text-text-primary">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    rows={4}
                    placeholder="How can we help?"
                    required
                  />
                </div>
                <Button type="submit">Send Message</Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
