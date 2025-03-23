import React from 'react';
import { TextField, Button } from '@mui/material';
import { FaPhone, FaMapMarkerAlt, FaEnvelope, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  return (
    <div className="contact-container">
      <h1 className="Contactsection-title">اتصل بنا</h1>
      
      <div className="contact-content">
        {/* Contact Form */}
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <TextField
              label="الاسم الكامل"
              variant="outlined"
              required
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              sx={{ direction: 'rtl' }}
            />
            
            <TextField
              label="البريد الإلكتروني"
              variant="outlined"
              type="email"
              required
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              sx={{ direction: 'rtl' }}
            />
          </div>

          <TextField
            label="الموضوع"
            variant="outlined"
            fullWidth
            required
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
            sx={{ margin: '1rem 0', direction: 'rtl' }}
          />

          <TextField
            label="الرسالة"
            variant="outlined"
            multiline
            rows={4}
            fullWidth
            required
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            sx={{ direction: 'rtl' }}
          />

          <Button 
            variant="contained" 
            type="submit"
            className="submit-button"
          >
            إرسال الرسالة
          </Button>
        </form>

        {/* Contact Info */}
        <div className="contact-info">
          <div className="info-item">
            <FaMapMarkerAlt className="info-icon" />
            <div>
              <h3>العنوان</h3>
              <p>شارع الملك عبدالعزيز، الرياض 12345، المملكة العربية السعودية</p>
            </div>
          </div>

          <div className="info-item">
            <FaPhone className="info-icon" />
            <div>
              <h3>الهاتف</h3>
              <p>+966 11 123 4567</p>
            </div>
          </div>

          <div className="info-item">
            <FaEnvelope className="info-icon" />
            <div>
              <h3>البريد الإلكتروني</h3>
              <p>info@autism-support.org</p>
            </div>
          </div>

          <div className="social-media">
            <a href="#"><FaFacebook /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaInstagram /></a>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="map-section">
        <iframe 
          title="office-location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3622.650442502127!2d46.67291131500188!3d24.77406258409224!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2ee3e5c95dbf5d%3A0xc4d8a83a1993d065!2sKing%20Abdulaziz%20Rd%2C%20Riyadh%2012345!5e0!3m2!1sen!2ssa!4v1659023456789!5m2!1sen!2ssa"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default Contact;