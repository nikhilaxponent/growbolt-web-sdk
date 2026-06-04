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
        <div className="payment-card-header">
          <div>
            <div className="payment-step">Step {step}</div>
            <RichContent
              value={title}
              className="payment-title"
              as="div"
            />
            {description ? (
              <RichContent
                value={description}
                className="payment-description"
                as="div"
              />
            ) : null}
          </div>

          <div className="payment-reward">₹{reward}</div>
        </div>
      </div>
    </div>
  );
}
