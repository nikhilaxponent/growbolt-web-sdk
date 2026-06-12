import RichContent from "./RichContent";
import progressIcon from "../assets/progress.svg";

type Props = {
  step: number;
  title: string;
  description?: unknown;
  statusIcon?: string;
  reward: string | number;
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
    <div className="instruction-card rounded-xl shadow-card">
      <div
        className="instruction-card-inner"
        style={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="payment-step"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "20px",
              fontWeight: 500,
              color: "#0f172a",
            }}
          >
            Step {step}:{" "}
            <RichContent value={title} className="payment-title" as="div" />
          </div>
          {description ? (
            <RichContent
              value={description}
              className="payment-description"
              as="div"
            />
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <img
            src={statusIcon || progressIcon}
            alt="status"
            style={{ width: 28, height: 28 }}
          />
          <button
            type="button"
            className="earn-pill"
            onClick={onClaim}
            style={{
              whiteSpace: "nowrap",
              cursor: onClaim ? "pointer" : "default",
            }}
          >
            {reward}
          </button>
        </div>
      </div>
    </div>
  );
}
