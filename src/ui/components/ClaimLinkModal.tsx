import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import QRCode from "qrcode";

type Props = {
  open: boolean;
  url: string;
  title?: string;
  onClose: () => void;
};

export default function ClaimLinkModal({
  open,
  url,
  title = "Continue on your phone",
  onClose,
}: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [qrError, setQrError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !url) {
      setQrDataUrl("");
      setQrError(null);
      return;
    }

    let cancelled = false;

    async function generateQr() {
      try {
        const dataUrl = await QRCode.toDataURL(url, {
          width: 220,
          margin: 2,
          errorCorrectionLevel: "M",
        });
        if (!cancelled) {
          setQrDataUrl(dataUrl);
          setQrError(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("QR generation failed", err);
          setQrError("Could not generate QR code. Use Open Link below.");
          setQrDataUrl("");
        }
      }
    }

    generateQr();

    return () => {
      cancelled = true;
    };
  }, [open, url]);

  if (!open) return null;

  const modalContent = (
    <div
      className="gb-claim-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gb-claim-modal-title"
      onClick={onClose}
    >
      <div className="gb-claim-modal" onClick={(e) => e.stopPropagation()}>
        <div className="gb-claim-modal-header">
          <h2 id="gb-claim-modal-title" className="gb-claim-modal-title">
            {title}
          </h2>
          <button
            type="button"
            className="gb-modal-close"
            aria-label="Close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <p className="gb-claim-modal-hint">
          Scan the QR code with your phone camera, or open the link directly.
        </p>

        <div className="gb-claim-qr-wrap">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR code for offer link"
              className="gb-claim-qr"
            />
          ) : (
            <div className="gb-claim-qr-placeholder">
              {qrError || "Generating QR code…"}
            </div>
          )}
        </div>

        <div className="gb-claim-actions">
          {/* <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="gb-claim-open-link"
          >
            Open Link
          </a> */}
          <button type="button" className="gb-claim-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}
