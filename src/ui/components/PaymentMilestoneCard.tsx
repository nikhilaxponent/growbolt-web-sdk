import RichContent from "./RichContent";
import progressIcon from "../assets/progress.svg";

type Props = {
  step: number;
  title: string;
  description?: unknown;
  statusIcon?: string;
  reward: React.ReactNode;
  onClaim?: () => void;
};

export default function PaymentMilestoneCard({
  step,
  title,
  statusIcon,
  description,
  reward,
  onClaim,
}: Props) {
  return (
    <div className="instruction-card rounded-xl shadow-card" style={{ padding: "16px", background: "#fff" }}>
      <div
        className="instruction-card-inner"
        style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "stretch" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <div
            className="payment-step"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "18px",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            {title ? (
              <RichContent value={title} className="payment-title" as="div" />
            ) : (
              `Step ${step}`
            )}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "8px",
              flexShrink: 0,
            }}
          >
            <img
              src={statusIcon || progressIcon}
              alt="status"
              style={{ width: 24, height: 24 }}
            />
            <button
              type="button"
              className="earn-pill"
              onClick={onClaim}
              style={{
                whiteSpace: "nowrap",
                cursor: onClaim ? "pointer" : "default",
                padding: "6px 8px",
                width: "auto",
                minWidth: "60px",
                fontSize: "14px"
              }}
            >
              {reward}
            </button>
          </div>
        </div>

        {description ? (
          <div style={{ width: "100%" }}>
            <RichContent
              value={description}
              className="payment-description"
              as="div"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
