import { useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useInView } from "framer-motion";
import { FaInfoCircle, FaDna, FaChartBar } from "react-icons/fa";

const AutismPage = () => {
  const refs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  const inView = refs.map((ref) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useInView(ref, { once: true, margin: "-100px" })
  );

  const sectionVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="max-w-6xl mx-auto my-10 px-4 dir-rtl mt-12" dir="rtl">
      {/* Section 1: ما هو التوحد */}
      <motion.section
        ref={refs[0]}
        initial="hidden"
        animate={inView[0] ? "visible" : "hidden"}
        variants={sectionVariants}
        transition={{ duration: 0.8 }}
        className="bg-white shadow-lg rounded-lg p-6 "
      >
        <div className="flex items-center gap-3 text-blue-600">
          <FaInfoCircle className="text-3xl" />
          <h2 className="text-2xl font-bold">ما هو التوحد</h2>
        </div>
        <p className="mt-4 text-gray-700 leading-loose">
          اضطراب طيف التوحد ASD يعود لمجموعة من الحالات التي تتسم بالتحديات أو
          الصعوبات المتعلقة بالمهارات الاجتماعية، والسلوكيات المتكررة، والتواصل
          غير اللفظي، بالإضافة إلى القوى والاختلافات فريدة. فنحن نعلم الآن أن
          التوحد ليس نوع واحد فحسب بل عدة أنواع، والتي يعود سببها لمجموعة من
          العوامل والتأثيرات الوراثية والبيئية المختلفة. هو اضطراب نمائي تشمل
          أعراضه الأساسية على صعوبات في التواصل والتفاعل الاجتماعي وأنماط
          تكرارية ومحدودة من السلوكيات. مصطلح "طيف" يعكس مدى التباين الواسع في
          التحديات والقوى التي يمتلكها كل طفل مصاب بهذا الاضطراب. فسماته الأكثر
          وضوحا تكاد أن تظهر ما بين سن الثانية والثالثة. وفي بعض الحالات، يمكن
          تشخيصه في سن مبكر من 18 شهراً. وفقاً لمنظمة الصحة العالمية: طفل من كل
          ١٦٠ طفل حول العالم مصاب باضطراب طيف التوحد. ووفقاً لمركز التحكم
          بالأمراض والوقاية منها الأمريكي (CDC) فإن معدل انتشار اضطراب طيف
          التوحد في الولايات المتحدة الأمريكية في عام ٢٠٢٠م (طفل من كل ٥٤ طفل)
          مصاب باضطراب طيف التوحد
        </p>
      </motion.section>

      {/* Section 2: مسببات التوحد */}
      <motion.section
        ref={refs[1]}
        initial="hidden"
        animate={inView[1] ? "visible" : "hidden"}
        variants={sectionVariants}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="bg-#061831 p-8 my-8 rounded-xl shadow-md"
      >
        <div className="flex items-center gap-4 mb-8 text-red-600">
          <FaDna className=" size-8" />
          <h2 className="text-3xl font-bold ">مسببات التوحد</h2>
        </div>

        <p className="text-gray-700 mb-8 leading-relaxed">
          مما نعرفه الآن فإنه لا يوجد مسبب متفرد للإصابة باضطراب طيف التوحد.
          وتقترح الأبحاث أن التوحد ينشأ من تواجد هذه العوامل الجينية وغير
          الجينية والبيئية مجتمعة، ويجدر التنويه أن تأثير هذه العوامل على
          احتمالية الإصابة بالتوحد لا يجعل منها مسببًا بحد ذاتها. فعلى سبيل
          المثال، من الممكن تواجد بعض التغييرات الجينية المرتبطة بالتوحد لدى غير
          المصابين به. وكذلك، ليس من الضروري أن يؤدي تعرض أحدهم لإحدى هذه
          العوامل إلى الإصابة باضطراب طيف التوحد، بل على الأرجح أن الغالبية
          العظمى لن يصابوا.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              title: "عوامل وراثية",
              content:
                "توصلت الأبحاث أن الإصابة بالتوحد ترجح إلى أن تكون وراثية في الأسر، فالتغييرات التي قد تحدث في جينات معينة تزيد من احتمالية الإصابة. فإذا كان أحد الوالدين يحمل إحدى هذه الجينات المتغيرة أو عدة منها، فإن احتمالية إنجاب طفل ذو اضطراب طيف توحد تزداد حتى وإن لم يكن إحدى الوالدين أو كلاهما مصابين به. وفي أحيان أخرى، تنشأ هذه التغييرات الجينية من تلقاء نفسها في الجنين (المضغة) مبكرًا أو في الحيوان المنوي و/أو في البويضة التي تكونان الجنين. مجددًا فإن غالبية التغييرات الجينية لا تسبب التوحد بمفردها، لكنها ببساطه تزيد من احتمالية الإصابة بهذا الاضطراب",
            },
            {
              title: "أسباب نفسية",
              content:
                "أشارت آخر الأبحاث الأمريكية إلى أن الإصابة بالتوحد يعود إلى عدم تطور ونضج ” الأنا ” خلال السنوات الثلاث الأولى من عمر الطفل، وقد يرجع ذلك إلى المناخ النفسي القاسي الذى قد يتعرض له الطفل فى مراحل نشأته الأولى أو بسبب شخصية الأبوين غير السوية نفسيا.",
            },
            {
              title: "أسباب اجتماعية",
              content:
                "أوضحت أيضا بعض الدراسات أن أحد أسباب الإصابة بالتوحد هو إحساس الطفل بالرفض من والديه أو الحرمان العاطفى والعزلة الاجتماعية والإهمال ، فقد أشارت هذه الدراسات إلى أن الأطفال الذين يعانون من التوحد عادة ما يكونوا أبناء لأباء من مستوى تعليمى مرتفع وهؤلاء الأشخاص يهتمون بشكل كبير بأعمالهم على حساب التزاماتهم الأسرية، كما تتسم علاقاتهم بأبنائهم بالشدة والصرامة .",
            },
            {
              title: "أسباب فسيولوجية",
              content:
                "أرجع بعض العلماء الإصابة بالتوحد إلى وجود خلل فى الكروموزومات الموروثة من الأم خاصة ” الكروموزوم إكس” ، وهو ما يفسر إصابة أغلب الأطفال من الذكور ، بالإضافة إلى تناول الأم لبعض الأدوية خلال فترة الحمل خاصة أدوية الصرع، أو تعرض الجنين لبعض الفيروسات أثناء فترة الحمل أو إصابته ببعض الأمراض الجينية.",
            },
          ].map((cause, index) => (
            <motion.div
              key={index}
              className="p-6 rounded-lg shadow-lg transition-all hover:shadow-xl bg-gradient-to-r from-blue-500 to-indigo-500"
              // style={{ background: "#0e2544" }}
              whileHover={{ y: -5 }}
            >
              <h3 className="text-xl font-bold mb-4">{cause.title}</h3>
              <p className="text-gray-200 leading-relaxed">{cause.content}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Statistics Section */}
      <motion.section
        ref={refs[2]}
        initial="hidden"
        animate={inView[2] ? "visible" : "hidden"}
        variants={sectionVariants}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="bg-white shadow-lg rounded-lg p-6"
      >
        <div className="flex items-center gap-3 text-green-600">
          <FaChartBar className="text-3xl" />
          <h2 className="text-2xl font-bold">أبرز الأرقام حول مرض التوحد</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-blue-100 p-4 rounded-lg text-center">
            <h3 className="text-xl font-bold">50%</h3>
            <p className="text-gray-600">يعانون إعاقات ذهنية</p>
          </div>
          <div className="bg-red-100 p-4 rounded-lg text-center">
            <h3 className="text-xl font-bold">44%</h3>
            <p className="text-gray-600">ذكاء أعلى من المتوسط</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg text-center">
            <h3 className="text-xl font-bold">35%</h3>
            <p className="text-gray-600">تواصل غير لفظي</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg text-center">
            <h3 className="text-xl font-bold">18%</h3>
            <p className="text-gray-600">احتمالية إصابة طفل ثان</p>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default AutismPage;
