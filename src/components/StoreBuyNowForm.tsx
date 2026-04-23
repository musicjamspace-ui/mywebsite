"use client";

import { useMemo, useState } from "react";
import emailjs from "@emailjs/browser";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitPublicStoreOrder } from "@/lib/api";

type PaymentMode = "Prepayment" | "COD";

interface Props {
  productName: string;
  productPrice: number;
}

const ESEWA_NUMBER = "9860342125";
const WHATSAPP_NUMBER_INTL = "9779860342125";
const PHONE_TEL = "+9779860342125";

function orderNotificationEmails(): string[] {
  const raw = process.env.NEXT_PUBLIC_ORDER_RECEIVER_EMAIL?.trim() ?? "";
  return raw
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function StoreBuyNowForm({ productName, productPrice }: Props) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("COD");
  const [location, setLocation] = useState("");
  const [landmark, setLandmark] = useState("");
  const [notes, setNotes] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const whatsappText = useMemo(() => {
    const lines = [
      "Hello Music Jam Space, I want to buy this item:",
      `Product: ${productName}`,
      `Price: Rs. ${productPrice.toLocaleString("en-IN")}`,
      `Customer Name: ${customerName || "-"}`,
      `Phone Number: ${phone || "-"}`,
      `Payment: ${paymentMode}`,
      `Location: ${location || "-"}`,
      `Nearest Landmark: ${landmark || "-"}`,
      `Additional Notes: ${notes || "-"}`,
    ];
    if (paymentMode === "Prepayment") {
      lines.push(
        `I will prepay via eSewa to ${ESEWA_NUMBER} and send payment screenshot on WhatsApp.`,
      );
    }
    return encodeURIComponent(lines.join("\n"));
  }, [productName, productPrice, customerName, phone, paymentMode, location, landmark, notes]);

  const submitToWhatsApp = async () => {
    if (!customerName.trim() || !phone.trim() || !location.trim() || !landmark.trim()) return;
    void whatsappText;
    setSubmitting(true);
    try {
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const addressLine = `${location.trim()} · Near: ${landmark.trim()}`;
      const notesParts = [notes.trim(), `Landmark: ${landmark.trim()}`].filter(Boolean);
      const notesForDb = notesParts.length ? notesParts.join("\n") : null;

      await submitPublicStoreOrder({
        id: orderId,
        customer: customerName.trim(),
        phone: phone.trim(),
        address: addressLine,
        productName: productName.trim(),
        amount: productPrice,
        payment: paymentMode,
        notes: notesForDb,
      });

      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      if (serviceId && templateId && publicKey) {
        const recipients = orderNotificationEmails();
        const templateParams = {
          subject: `New Order - ${productName}`,
          product_name: productName,
          product_price: productPrice.toLocaleString("en-IN"),
          customer_name: customerName.trim(),
          phone: phone.trim(),
          payment_mode: paymentMode,
          location: location.trim(),
          landmark: landmark.trim(),
          notes: notes.trim() || "-",
          order_id: orderId,
        };
        try {
          await Promise.all(
            recipients.map((to_email) =>
              emailjs.send(
                serviceId,
                templateId,
                { ...templateParams, to_email },
                { publicKey },
              ),
            ),
          );
        } catch {
          /* order is already in DB; email is best-effort */
        }
      }

      setOrderPlaced(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not place order. Check your connection and try again.";
      alert(`Order failed: ${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Buy Now</h2>
      <p className="text-sm text-muted-foreground">Fill customer details, then tap Buy Now to place your order.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Customer Name</Label>
          <Input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Your full name"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Phone Number</Label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="98XXXXXXXX"
            inputMode="tel"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Payment Method</Label>
          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
            className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="COD">COD</option>
            <option value="Prepayment">Prepayment</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Location</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Area / city" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Nearest Landmark</Label>
        <Input
          value={landmark}
          onChange={(e) => setLandmark(e.target.value)}
          placeholder="Landmark near delivery location"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Additional Notes (optional)</Label>
        <Textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any preferred time or instructions..."
        />
      </div>

      {paymentMode === "Prepayment" ? (
        <div className="rounded-md border border-primary/40 bg-primary/10 p-3 text-sm text-foreground space-y-1">
          <p>
            eSewa number: <span className="font-semibold">{ESEWA_NUMBER}</span>
          </p>
          <p>Please pay through this number.</p>
          <p>
            After payment, please send screenshot through WhatsApp at{" "}
            <span className="font-semibold">+{WHATSAPP_NUMBER_INTL}</span>.
          </p>
        </div>
      ) : null}

      <Button
        type="button"
        className="w-full min-h-11"
        onClick={submitToWhatsApp}
        disabled={submitting || !customerName.trim() || !phone.trim() || !location.trim() || !landmark.trim()}
      >
        {submitting ? "Sending..." : "Buy Now"}
      </Button>

      <Dialog open={orderPlaced} onOpenChange={(open) => !open && setOrderPlaced(false)}>
        <DialogContent className="sm:max-w-md text-center [&>button]:top-3 [&>button]:right-3">
          <div className="flex justify-center pt-2">
            <div
              className="flex size-[5.5rem] items-center justify-center rounded-full bg-primary/15 shadow-[0_0_0_8px_hsl(var(--primary)/0.08)] animate-in zoom-in-50 duration-500 motion-reduce:animate-none"
              aria-hidden
            >
              <Check
                className="size-10 text-primary animate-in zoom-in-50 duration-500 delay-150 fill-mode-both motion-reduce:animate-none"
                strokeWidth={2.75}
              />
            </div>
          </div>
          <DialogHeader className="text-center sm:text-center space-y-2">
            <DialogTitle className="text-xl">Order successful.</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground space-y-3 pt-1">
              <span className="block">You might receive a call within 24 hours.</span>
              <span className="block">
                For fast service call:{" "}
                <a href={`tel:${PHONE_TEL}`} className="font-semibold text-primary hover:underline">
                  {ESEWA_NUMBER}
                </a>
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center sm:space-x-0">
            <Button type="button" className="w-full sm:w-auto min-w-[8rem]" onClick={() => setOrderPlaced(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

