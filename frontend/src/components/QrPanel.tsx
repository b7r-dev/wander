interface QrPanelProps {
  qrDataUrl: string;
  fullUrl: string;
}

export default function QrPanel({ qrDataUrl, fullUrl }: QrPanelProps) {
  return (
    <div className="qr-module">
      <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="section-label">QR OUTPUT</span>
        <div className="status-readout">
          <div className="status-dot ready" />
          <span>LAN ready</span>
        </div>
      </div>

      <img
        src={qrDataUrl}
        alt="QR Code"
        className="qr-code"
      />

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div>
          <span className="section-label" style={{ display: "block", marginBottom: "4px" }}>
            URL
          </span>
          <div
            style={{
              background: "var(--field-deep)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              padding: "8px 12px",
              fontSize: "12px",
              fontFamily: "monospace",
              color: "var(--beige)",
              wordBreak: "break-all",
              lineHeight: 1.5,
            }}
          >
            {fullUrl}
          </div>
        </div>

        <div>
          <span className="section-label" style={{ display: "block", marginBottom: "4px" }}>
            STATUS
          </span>
          <div className="status-readout">
            <div className="status-dot ready" />
            <span>Reachable from local network</span>
          </div>
        </div>
      </div>
    </div>
  );
}
