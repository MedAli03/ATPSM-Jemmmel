import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const faqs = [
  {
    question: "ما هو التوحد؟",
    answer:
      "التوحد هو اضطراب عصبي يؤثر على التفاعل الاجتماعي والتواصل والسلوك.",
  },
  {
    question: "ما هي أعراض التوحد؟",
    answer:
      "تشمل الأعراض صعوبات في التواصل الاجتماعي، سلوكيات متكررة، واهتمامات محدودة.",
  },
  {
    question: "هل هناك علاج للتوحد؟",
    answer:
      "لا يوجد علاج نهائي، ولكن التدخل المبكر يمكن أن يساعد في تحسين المهارات الحياتية.",
  },
  {
    question: "ما أسباب التوحد؟",
    answer:
      "الأسباب غير معروفة بشكل كامل، لكن يعتقد أنها تشمل العوامل الوراثية والبيئية.",
  },
];

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 my-12">
      <h1 className="text-3xl font-bold text-center text-blue-600">
        الأسئلة الشائعة
      </h1>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white shadow-lg rounded-lg p-4 cursor-pointer"
            onClick={() => toggleFAQ(index)}
          >
            <div className="flex justify-between items-center text-gray-800">
              <h2 className="text-lg font-semibold">{faq.question}</h2>
              {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {openIndex === index && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="mt-2 text-gray-600"
              >
                {faq.answer}
              </motion.p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FAQPage;
