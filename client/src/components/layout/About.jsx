import "./About.css"; // Create this CSS file for styling
import { useNavigate } from 'react-router-dom';
const About = () => {
  const navigate = useNavigate();
  return (
    <div className="about-container">
      <section className="about-section">
        <h1 className="Aboutsection-title">عن الجمعية</h1>

        <div className="content-wrapper">
          <p className="about-text">
            جميع أسرار التوحد هي جمعية تاريخه أساسا، ما مجموعة أولياء ذوي
            إصداريا، طيف التوحد عام 2018، وبأنشأتها أعضاء المجتمع كافة واضحة من
            نبيه أطفال بعانون من التوحد.
          </p>

          <p className="about-text">
            وعند إنشائها صفات الجمعية على عالقها رؤية واضحة في مساندة بالسر
            لعمان حصولهم على خدمات عالية الجودة، كما عملت الجمعية على إتصال
            بسابقها الساخنة، كل وجهود لدعم أسرار التوحد مع تساهيل من خلال
            التدريب والدعم المعنوي وإجمال معرفهم المجتمع.
          </p>
        </div>

        <div className="more-about-section">
          <button className="modern-button-rtl"
          onClick={() => navigate('/about')}
          >المزيد عن الجمعية</button>

          <div className="cards-container">
            <div className="info-card">
              <h3 className="card-title">الرؤية</h3>
              <ul className="card-list">
                <li>مجتمع داعم وواعي باحتياجات أفراد طيف التوحد</li>
                <li>تحقيق الإندماج الكامل في المجتمع</li>
              </ul>
            </div>

            <div className="info-card">
              <h3 className="card-title">الرسالة</h3>
              <ul className="card-list">
                <li>تقديم الدعم الشامل لأسر التوحد</li>
                <li>تحسين جودة الخدمات المقدمة</li>
                <li>نشر الوعي المجتمعي</li>
              </ul>
            </div>

            <div className="info-card">
              <h3 className="card-title">الأهداف</h3>
              <ul className="card-list">
                <li>التدريب والتأهيل المهني</li>
                <li>الدعم النفسي والإجتماعي</li>
                <li>أنشطة الدمج المجتمعي</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
