# Messaging System Overview

هذا المستند يصف نسخة الإنتاج الجديدة لوحدة الرسائل التي تربط بين خادم Node/Express مع Sequelize وواجهة React المبنية بـ React Query وSocket.IO.

## الخلفية (Backend)

### النماذج والجداول
* **Thread / threads** – يضم تعريف المحادثة (عنوان اختياري، مجموعة أو فردية، مؤرشفة، آخر رسالة).
* **ThreadParticipant / thread_participants** – يحتفظ بالمشاركين مع أدوارهم (`PARENT`، `EDUCATEUR`، …) وتواريخ الانضمام/المغادرة.
* **Message / messages** – الرسائل النصية أو النظامية أو الخاصة بالمرفقات.
* **MessageReadReceipt / message_read_receipts** – إيصالات القراءة لكل مستخدم.
* **Attachment / attachments** + **MessageAttachment / message_attachments** – بيانات وصفية للمرفقات (بدون تخزين للملف الفعلي).

جميع العلاقات مُعرّفة في `server/models/index.js`:
* Thread.hasMany(Message) وMessage.belongsTo(Thread)
* Thread.belongsTo(Message, { as: "lastMessage" })
* Thread.hasMany(ThreadParticipant)
* Message.belongsTo(Utilisateur, { as: "sender" })
* Message.hasMany(MessageReadReceipt)
* Message.belongsToMany(Attachment) عبر MessageAttachment

### خدمة الرسائل
`server/services/messages.service.js` تحتوي على واجهة العمل الأساسية:

```ts
createThread({ actorId, participantIds, title?, isGroup? })
listThreads(userId, params)
getThread(userId, threadId)
listMessages(userId, threadId, params)
sendMessage({ userId, threadId, text, attachments? })
markRead({ userId, threadId, upToMessageId? })
unreadCount(userId)
setTyping({ userId, threadId, on })
```

النقاط المهمة:
* **التحقق من الصلاحيات** عبر `ensureThreadParticipant` قبل أي عملية.
* **الخصوصية** – يتم إخفاء رسائل النظام ذات المصدر "AI" عن أولياء الأمور.
* **الحد الأقصى للحروف** 2000 حرف في الرسالة.
* **استعلامات فعّالة** باستخدام فهارس مخصصة ومحددات ترقيم (cursor-based).
* **إدارة الحالة الفورية** (typing) في الذاكرة مع إنقضاء زمني.

### Socket.IO
ملف `server/realtime/messages.io.js` يسجل مساحة الأسماء `/messages` على المسار `/ws`.
* التحقق عبر JWT في المصافحة.
* الانضمام التلقائي لغرفة المستخدم `user:{userId}`، وإدارة غرف المحادثات `thread:{threadId}`.
* أحداث العميل: `thread:join`, `thread:leave`, `typing:start`, `typing:stop`, `message:send`, `thread:read`.
* أحداث الخادم: `message:new`, `thread:updated`, `typing`, `read:updated`, `unread:count`.
* يتم تسجيل الأحداث في الطرفية (`[ws] ...`) للمساعدة في التتبع.

يوصل `server/server.js` الـ Socket.IO بالـ HTTP server ويضع الـ instance داخل `app.set("io", io)` لكي تستخدمه مسارات REST عند الحاجة للبث (fallback HTTP).

### واجهات REST (Fallback)
`server/routes/messages.poll.routes.js` يوفر مسارات REST مكافئة:
* `GET /api/messages/threads`
* `GET /api/messages/threads/:id`
* `GET /api/messages/threads/:id/messages`
* `POST /api/messages/threads/:id/messages`
* `POST /api/messages/threads/:id/read`

عند إرسال رسالة عبر REST يتم بث نفس الأحداث إلى غرف Socket.IO لضمان بقاء الواجهة متزامنة حتى في وضع الاستطلاع.

## الواجهة (Frontend)

### التخزين المؤقت وReact Query
* مفاتيح الاستعلام:
  * `['threads', params]` لقائمة المحادثات.
  * `['thread', threadId]` لبيانات المحادثة.
  * `['messages', threadId]` للرسائل مع `useInfiniteQuery`.
  * `['unreadCount']` لشارة الإشعارات.
* `client/src/services/messagingApi.js` يعزل استدعاءات REST.

### Socket.IO عميل
* `client/src/realtime/socket.js` ينشئ اتصالاً واحدًا مع namespace `/messages` ومسار `/ws` مع دعم الرجوع للـ HTTP polling إذا تعذّر الاتصال.
* `client/src/hooks/useRealtimeThread.js` يدير الاشتراك في الغرف، تحديث الكاش عند استقبال أحداث realtime، وإرسال أحداث الكتابة/القراءة.
* عند فقد الاتصال يتم تفعيل `refetchInterval` (15 ثانية) عبر React Query.

### واجهة المستخدم
* **ThreadsPage.jsx** – ترويسة لاصقة، حقل بحث مع debounce، أزرار تصفية (الكل/غير مقروء/مقروء/مؤرشفة)، تبديل الكثافة، قائمة افتراضية باستخدام `@tanstack/react-virtual`، ودعم لوحة المفاتيح (`↑/↓/Enter/A/Ctrl+K`).
* **ThreadView.jsx** – رأس يحتوي على الرجوع والأعضاء، جدول رسائل مقلوب باستخدام virtualizer، فواصل التاريخ، فقاعات الرسائل، مؤشر الكتابة، ومحرر متعدد الأسطر مع إدارة مسودات لكل محادثة (localStorage) وتحديثات متفائلة وإعادة المحاولة عند الفشل.
* **المكوّنات المشتركة** محفوظة تحت `client/src/components/messages/` (ThreadItem, MessageBubble, Composer, DateSeparator, TypingIndicator …) مع دعم RTL والوضع الليلي.

### إمكانية الوصول والأمان
* حوارات ARIA حيّة (`aria-live="polite"`) للرسائل الجديدة والمؤشر.
* أزرار قابلة للوصول بلوحة المفاتيح، وتعليقات مرئية/مسموعة لإيصالات القراءة.
* نص الرسالة يُطهّر (escape) قبل العرض لتجنب إدخال HTML خبيث.
* أولياء الأمور لا يرون رسائل النظام ذات المصدر AI بفضل التصفية على الخادم وعند استقبال الأحداث.

## التدفق العام
1. المستخدم يفتح صفحة الرسائل → `ThreadsPage` تجلب القائمة (React Query) وتعرضها مع الافتراضية.
2. عند اختيار محادثة، يتم جلب التفاصيل والرسائل عبر `ThreadView` مع استعلام متدرج + اشتراك Socket.
3. عند إرسال رسالة: يتم إنشاء رسالة متفائلة، ينطلق طلب REST، وعند النجاح/الفشل يتم التوفيق. يتم بث الرسالة لجميع المشاركين عبر Socket.
4. عند قراءة الرسائل يتم إرسال `thread:read` (Socket أو REST) لتحديث إيصالات القراءة والشارة العالمية.

هذا التصميم يحقق متطلبات الأداء، وإمكانية الوصول، والتشغيل بلا اتصال، ويتيح التوسع لاحقًا عبر استبدال آليات النقل دون إعادة كتابة الواجهة.
