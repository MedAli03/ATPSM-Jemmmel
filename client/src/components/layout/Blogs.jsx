import "./BlogSection.css";
import { useNavigate } from "react-router-dom";
const blogPosts = [
  {
    id: 1,
    image: "aut2.jpg",
    title:
      "جمعية أسر التوحد تطلق أعمال الملتقى الأول للخدمات المقدمة لذوي التوحد",
    description:
      "برعاية صاحب السمو الملكي الأمير فيصل بن خالد بن سلطان آل سعود",
  },
  {
    id: 2,
    image: "aut3.jpg",
    title: "جمعية أسر التوحد تفتتح نادي التميز الرياضي لذوي التوحد",
    description:
      "بحضور سمو رئيس مجلس إدارة الجمعية الأمير سعود بن عبدالعزيز آل سعود",
  },
  {
    id: 3,
    image: "aut1.jpg",
    title: "جمعية أسر التوحد تقيم مزاد ريشة طيف لدعم المواهب الفنية",
    description:
      "برعاية وزير الثقافة سمو الأمير بدر بن عبدالله بن فرحان آل سعود",
  },
];

const BlogSection = () => {
  const navigate = useNavigate();
  return (
    <section className="blog-section">
      <h2 className="title">الأخبار</h2>

      <div className="blog-container">
        {blogPosts.map((post) => (
          <div key={post.id} className="blog-card">
            <img src={post.image} alt={post.title} className="blog-image" />
            <div className="blog-content">
              <h3 className="blog-title">{post.title}</h3>
              <p className="blog-description">{post.description}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="view-all-btn" onClick={() => navigate("/news")}>
        كل الأخبار
      </button>
    </section>
  );
};

export default BlogSection;
