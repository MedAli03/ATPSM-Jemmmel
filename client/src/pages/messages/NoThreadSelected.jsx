export default function NoThreadSelected() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center text-slate-500 dark:text-slate-300">
      <div className="text-4xl">💬</div>
      <div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-100">اختر محادثة للعرض</h3>
        <p className="mt-2 text-sm">
          استخدم البحث أو أزرار التصفية للعثور على المحادثة المطلوبة.
        </p>
      </div>
    </div>
  );
}
