import { useState } from "react";
import { QrCode, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface Props {
  upiId: string;
  amount: number;
  payeeName: string;
}

const UpiQrCode = ({ upiId, amount, payeeName }: Props) => {
  const [copied, setCopied] = useState(false);

  const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast.success("UPI ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <QrCode className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Pay via UPI</h3>
      </div>

      <div className="flex flex-col items-center gap-3">
        <img
          src={qrUrl}
          alt="UPI QR Code"
          className="h-[180px] w-[180px] rounded-xl border border-border bg-white p-2"
          loading="lazy"
        />

        <div className="flex w-full items-center justify-between rounded-xl bg-secondary px-4 py-2.5">
          <span className="truncate text-sm font-medium text-foreground">{upiId}</span>
          <button
            onClick={handleCopy}
            className="ml-2 shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted"
          >
            {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Scan QR or copy UPI ID to pay ₹{amount.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default UpiQrCode;
