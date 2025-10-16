const TypingIndicator = ({ users = [] }) => {
  if (!users.length) return null;
  const label = users.length === 1 ? `${users[0]} يكتب...` : "هناك من يكتب...";
  return (
    <div className="flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-xs text-primary-700 dark:bg-primary-900/40 dark:text-primary-200" aria-live="polite">
      <span className="flex items-center gap-1">
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary-500" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary-500 [animation-delay:120ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary-500 [animation-delay:240ms]" />
      </span>
      <span>{label}</span>
    </div>
  );
};

export default TypingIndicator;
