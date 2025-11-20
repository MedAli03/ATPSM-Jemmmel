/* eslint-disable no-unused-vars */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const faqs = [
  {
    question: "ما هو التوحد؟",
    answer:
      "التوحد هو اضطراب نمائي يؤثر على التواصل الاجتماعي، أنماط السلوك، وطريقة تفسير المعلومات الحسية.",
  },
  {
    question: "ما هي أبرز أعراض التوحد؟",
    answer:
      "قد تشمل ضعف التواصل البصري، صعوبة فهم الإشارات الاجتماعية، سلوكيات متكررة، وحساسية عالية أو منخفضة تجاه الأصوات واللمس.",
  },
  {
    question: "هل يوجد علاج نهائي للتوحد؟",
    answer:
      "لا يوجد علاج نهائي، لكن التدخل المبكر والبرامج العلاجية المتخصصة قد تحدث فرقًا كبيرًا في مهارات الطفل وقدرته على التفاعل.",
  },
  {
    question: "ما أسباب التوحد؟",
    answer:
      "الأسباب غير معروفة تمامًا، لكن التفاعل بين العوامل الوراثية والبيئية والبيولوجية يُعتبر الأكثر ترجيحًا.",
  },
];

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(index === openIndex ? null : index);
  };

  return (
    <div
      className="relative min-h-screen pt-28 pb-16 px-4 bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50"
      dir="rtl"
    >
      {/* Decorative Background Circles */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 -left-20 w-72 h-72 bg-blue-300/20 blur-3xl rounded-full" />
        <div className="absolute bottom-10 right-0 w-80 h-80 bg-indigo-300/20 blur-3xl rounded-full" />
      </div>

      <div className="relative max-w-3xl mx-auto text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-3">
          الأسئلة الشائعة
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          جمعنا لكم أهم الأسئلة التي يطرحها الأولياء حول اضطراب طيف التوحد،
          لتكون مرجعًا مبسطًا وواضحًا.
        </p>
      </div>

      <div className="relative max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            className="rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            onClick={() => toggleFAQ(index)}
          >
            {/* Question */}
            <div className="flex justify-between items-center p-5">
              <h2 className="text-slate-800 font-semibold text-base sm:text-lg">
                {faq.question}
              </h2>
              <span className="text-slate-500">
                {openIndex === index ? (
                  <FaChevronUp className="text-indigo-500" />
                ) : (
                  <FaChevronDown className="text-slate-400" />
                )}
              </span>
            </div>

            {/* Answer */}
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  key="answer"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="px-5 pb-5 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FAQPage;
