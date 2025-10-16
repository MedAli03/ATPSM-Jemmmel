const statusLabels = {
  sending: "جاري الإرسال",
  sent: "تم الإرسال",
  delivered: "تم التسليم",
  read: "تمت القراءة",
  failed: "فشل الإرسال",
};

const ReadReceipt = ({ status = "sent", readBy = [] }) => {
  let icon = "✓";
  if (status === "read" || status === "delivered") {
    icon = "✓✓";
  }
  if (status === "failed") {
    icon = "⚠";
  }
  return (
    <span
      className={`text-[11px] font-medium ${status === "failed" ? "text-rose-500" : "text-slate-400"}`}
      aria-label={`${statusLabels[status] || ""}${readBy.length ? ` - ${readBy.join("، ")}` : ""}`}
    >
      {icon}
    </span>
  );
};

export default ReadReceipt;
