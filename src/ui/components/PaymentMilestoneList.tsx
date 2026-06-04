import PaymentMilestoneCard from "./PaymentMilestoneCard";

type Props = {
  payments: any[];
};

export default function PaymentMilestoneList({ payments }: Props) {
  console.log("Payments received:", payments);

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
            console.log("Payment item:", payment);

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
