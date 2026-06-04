import RichContent from "./RichContent";

type Props = {
  step: number;
  title: string;
  description?: unknown;
  reward: string | number;
};

export default function PaymentMilestoneCard({
  step,
  title,
  description,
  reward,
}: Props) {
  return (
    <div className="instruction-card rounded-xl shadow-card">
      <div className="instruction-card-inner">
        <div
          className="payment-card-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "12px",
          }}
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

          <div className="earn-pill">₹{reward}</div>
        </div>
      </div>
    </div>
  );
}
