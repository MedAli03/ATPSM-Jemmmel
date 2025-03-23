// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useState } from "react";

const AssociationPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("تم إرسال الرسالة بنجاح!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-right mt-12">
      <motion.h1
        className="text-3xl font-bold text-center text-blue-700 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        عن الجمعية
      </motion.h1>

      {/* Association Details */}
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <img
          src="/association.jpg"
          alt="الجمعية"
          className="w-full h-64 object-cover rounded-lg"
        />
        <p className="mt-4 text-gray-700 leading-loose">
          جمعية رعاية أطفال التوحد تقدم الدعم والرعاية للأطفال وأسرهم من خلال
          برامج تعليمية وتأهيلية متخصصة.
        </p>
      </div>

      {/* Branches */}
      <div className="max-w-5xl mx-auto mt-8 bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          الفروع وأماكنها
        </h2>
        <ul className="text-gray-700 list-disc pr-5">
          <li>الفرع الرئيسي - تونس العاصمة</li>
          <li>فرع سوسة - وسط المدينة</li>
          <li>فرع صفاقس - شارع الحبيب بورقيبة</li>
        </ul>
      </div>

      {/* Contact Form */}
      <div className="max-w-5xl mx-auto mt-8 bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">تواصل معنا</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="الاسم"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="البريد الإلكتروني"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none"
            required
          />
          <textarea
            name="message"
            placeholder="رسالتك"
            value={formData.message}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none"
            rows="4"
            required
          ></textarea>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            إرسال
          </button>
        </form>
      </div>

      {/* Google Map */}
      <div className="max-w-5xl mx-auto mt-8 bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">موقع الجمعية</h2>
        <iframe
          className="w-full h-64 rounded-lg"
          src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1644.9784642295117!2d10.760607824637864!3d35.615385065890756!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13020f849bdd6ebf%3A0xd864a3f1a3a38882!2zSlE4Nis4Q0osINi32LHZitmCINin2YTYqtmK2KfZitix2KksIEplbW1lbA!5e1!3m2!1sfr!2stn!4v1742081263237!5m2!1sfr!2stn"
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
};

export default AssociationPage;
