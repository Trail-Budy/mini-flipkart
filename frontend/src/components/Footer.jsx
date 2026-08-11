import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const Footer = () => {
  const { showToast } = useToast();

  const handleComingSoon = (e) => {
    e.preventDefault();
    showToast('This page is coming soon!', 'info');
  };

  return (
    <footer style={{ backgroundColor: '#172337', color: '#fff', paddingTop: '40px' }}>
      <div className="page-container">
        <div className="grid grid-cols-4" style={{ gap: '40px', paddingBottom: '40px' }}>
          
          <div>
            <h4 style={{ color: '#878787', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '16px' }}>About</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="/" onClick={handleComingSoon} style={{ color: '#fff', fontSize: '0.9rem', textDecoration: 'none' }}>Contact Us</a>
              <a href="/" onClick={handleComingSoon} style={{ color: '#fff', fontSize: '0.9rem', textDecoration: 'none' }}>About Us</a>
              <a href="/" onClick={handleComingSoon} style={{ color: '#fff', fontSize: '0.9rem', textDecoration: 'none' }}>Careers</a>
              <a href="/" onClick={handleComingSoon} style={{ color: '#fff', fontSize: '0.9rem', textDecoration: 'none' }}>Mini Flipkart Stories</a>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#878787', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '16px' }}>Help</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="/" onClick={handleComingSoon} style={{ color: '#fff', fontSize: '0.9rem', textDecoration: 'none' }}>Payments</a>
              <a href="/" onClick={handleComingSoon} style={{ color: '#fff', fontSize: '0.9rem', textDecoration: 'none' }}>Shipping</a>
              <a href="/" onClick={handleComingSoon} style={{ color: '#fff', fontSize: '0.9rem', textDecoration: 'none' }}>Cancellation & Returns</a>
              <a href="/" onClick={handleComingSoon} style={{ color: '#fff', fontSize: '0.9rem', textDecoration: 'none' }}>FAQ</a>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#878787', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '16px' }}>Consumer Policy</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="/" onClick={handleComingSoon} style={{ color: '#fff', fontSize: '0.9rem', textDecoration: 'none' }}>Return Policy</a>
              <a href="/" onClick={handleComingSoon} style={{ color: '#fff', fontSize: '0.9rem', textDecoration: 'none' }}>Terms of Use</a>
              <a href="/" onClick={handleComingSoon} style={{ color: '#fff', fontSize: '0.9rem', textDecoration: 'none' }}>Security</a>
              <a href="/" onClick={handleComingSoon} style={{ color: '#fff', fontSize: '0.9rem', textDecoration: 'none' }}>Privacy</a>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#878787', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '16px' }}>Registered Office</h4>
            <div style={{ color: '#fff', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Mini Flipkart Internet Private Limited,<br />
              Buildings Alyssa, Begonia &<br />
              Clove Embassy Tech Village,<br />
              Outer Ring Road, Devarabeesanahalli Village,<br />
              Bengaluru, 560103,<br />
              Karnataka, India
            </div>
          </div>

        </div>

        <div style={{ borderTop: '1px solid #454d5e', padding: '24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ fontSize: '0.9rem', display: 'flex', gap: '24px' }}>
            <Link to="/seller" style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}>🛍️ Sell On Mini Flipkart</Link>
            <span onClick={handleComingSoon} style={{ cursor: 'pointer' }}>⭐ Advertise</span>
            <span onClick={handleComingSoon} style={{ cursor: 'pointer' }}>🎁 Gift Cards</span>
            <span onClick={handleComingSoon} style={{ cursor: 'pointer' }}>❓ Help Center</span>
          </div>
          <div style={{ fontSize: '0.9rem' }}>
            &copy; 2007-{new Date().getFullYear()} MiniFlipkart.com
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
