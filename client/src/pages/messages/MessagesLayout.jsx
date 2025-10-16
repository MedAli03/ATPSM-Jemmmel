import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { MessagingProvider } from "../../modules/messaging/context/MessagingProvider";

const MessagesLayout = () => {
  const { currentUser } = useAuth();
  return (
    <MessagingProvider currentUser={currentUser}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900" dir="rtl">
        <Outlet />
      </div>
    </MessagingProvider>
  );
};

export default MessagesLayout;
