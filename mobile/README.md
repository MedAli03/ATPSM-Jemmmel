# ATPSM Mobile Login Prototype

تطبيق **Expo React Native** مبسّط يركّز على شاشة تسجيل الدخول فقط، مع واجهة عربية (RTL) وتكامل كامل مع واجهة تسجيل الدخول في الخادم الخلفي.

## المتطلبات

- [Node.js](https://nodejs.org/) ‎>= 18
- [Expo CLI](https://docs.expo.dev/get-started/installation/) للتشغيل المحلي (اختياري)
- حساب Expo Go أو محاكي Android/iOS لاختبار التطبيق

## الإعداد

1. انتقل إلى مجلّد التطبيق:

   ```bash
   cd mobile
   ```

2. انسخ ملف البيئة:

   ```bash
   cp .env.example .env
   ```

   ثم حدّث قيمة `EXPO_PUBLIC_API_BASE_URL` إذا كان عنوان خادم الـ API مختلفًا.

3. ثبّت الحزم:

   ```bash
   npm install
   ```

## التشغيل

ابدأ خادم Expo التطويري:

```bash
npm start
```

سيفتح Expo Dev Tools في المتصفح. استخدم تطبيق **Expo Go** لمسح رمز QR أو شغّل التطبيق على محاكي باستخدام:

- `npm run android`
- `npm run ios`
- `npm run web`

## البنية

```
mobile/
  App.js
  src/
    api/
      client.js       # تهيئة Axios مع SecureStore للتوكن
      auth.js         # استدعاء تسجيل الدخول
    components/
      ui/             # عناصر الواجهة (حقول الإدخال، الزر، رسائل الخطأ)
    i18n/             # تهيئة i18next واللغة العربية الافتراضية
    screens/
      auth/LoginScreen.jsx  # شاشة تسجيل الدخول الوحيدة
```

## التدفق

1. يتحقق Yup من صحة الحقول (`identifier`, `password`).
2. يُرسِل الطلب إلى `POST /api/auth/login` مع الجسم `{ identifier, password }`.
3. عند النجاح يتم حفظ `{ token, user }` في **SecureStore** وتحديث ترويسة المصادقة في Axios.
4. يمكن تمرير `onLoggedIn` للشاشة لاستلام بيانات الاعتماد بعد نجاح الدخول.

## أسئلة متكررة

- **أين أضع صور/خطوط؟** استخدم ملفات نصية بديلة في مجلّد `assets/` وأضف الملفات الحقيقية لاحقًا.
- **كيف أغيّر عنوان الخادم؟** حدّث المتغيّر داخل `.env` ثم أعد تشغيل Expo.

## فحص الشيفرة

```bash
npm run lint
```

> يعتمد المشروع على `nativewind` لتطبيق أنماط Tailwind داخل React Native.
