import EmptyState from "./EmptyState";

const ThreadPlaceholder = () => (
  <div className="flex h-full w-full items-center justify-center p-6">
    <EmptyState
      icon="📨"
      title="اختر محادثة"
      description="حدد محادثة من القائمة الجانبية أو ابدأ محادثة جديدة للعرض هنا."
    />
  </div>
);

export default ThreadPlaceholder;
