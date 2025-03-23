import React from 'react';
import './Stats.css';

const Stats = () => {
  return (
    <div className="stats-container">
      <h1 className="stats-main-title">إحصائيات الجمعية</h1>

      <div className="stats-grid">
        {/* First Stat Card */}
        <div className="stat-card">
          <h2 className="stat-value">7,000+ أسرة</h2>
          <div className="stat-subsection">
            <span className="stat-label">ماليا</span>
            <span className="stat-percentage">20.7%</span>
          </div>
        </div>

        {/* Second Stat Card */}
        <div className="stat-card">
          <h2 className="stat-value">7,000 أسماء</h2>
          <div className="stat-subsection">
            <span className="stat-label">إحصائياً قام من</span>
            <span className="stat-percentage">1.0%</span>
          </div>
        </div>
      </div>

      {/* Points Section */}
      <div className="points-section">
        <h3 className="section-title">النقاط المتمثلي بالتوفد غير فادرين على السنوي</h3>
        <div className="points-grid">
          <div className="point-item">
            <span className="point-bullet"></span>
            <span>الإحصائي من حيث النقاط</span>
          </div>
          <div className="point-item">
            <span className="point-bullet"></span>
            <span>الإحصائي من حيث الفندي</span>
          </div>
          <div className="point-item">
            <span className="point-bullet"></span>
            <span>الإحصائي من حيث الجسم</span>
          </div>
          <div className="point-item">
            <span className="point-bullet"></span>
            <span>الإحصائي من حيث العصر</span>
          </div>
        </div>
      </div>

      {/* Divider with Text */}
      <div className="divider-section">
        <span className="divider-text">
          الاختر أكثر عرضة للإضافة بالتوفد عن الإنتاج، أو مع أصحاف
        </span>
      </div>

      {/* Highlight Fact */}
      <div className="highlight-fact">
        <span className="fact-text">
          واحد من كل 59 خطأ، يعاني من إخطارات التوفد
        </span>
      </div>
    </div>
  );
};

export default Stats;