import PaymentMilestoneCard from "./PaymentMilestoneCard";

type Props = {
  payments: any[];
};

export default function PaymentMilestoneList({ payments }: Props) {
  if (!payments?.length) return null;

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {payments
          .sort((a, b) => a.position - b.position)
          .map((payment, index) => {
            return (
              <PaymentMilestoneCard
                key={payment.id || index}
                step={index + 1}
                title={payment.goal}
                reward={payment.total}
              />
            );
          })}
      </div>
    </div>
  );
}
