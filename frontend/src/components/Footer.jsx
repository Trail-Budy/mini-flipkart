import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#172337', color: '#fff', paddingTop: '40px' }}>
      <div className="page-container">
        <div className="grid grid-cols-4" style={{ gap: '40px', paddingBottom: '40px' }}>
          
          <div>
            <h4 style={{ color: '#878787', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '16px' }}>About</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="#" style={{ color: '#fff', fontSize: '0.9rem' }}>Contact Us</a>
              <a href="#" style={{ color: '#fff', fontSize: '0.9rem' }}>About Us</a>
              <a href="#" style={{ color: '#fff', fontSize: '0.9rem' }}>Careers</a>
              <a href="#" style={{ color: '#fff', fontSize: '0.9rem' }}>Mini Flipkart Stories</a>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#878787', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '16px' }}>Help</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="#" style={{ color: '#fff', fontSize: '0.9rem' }}>Payments</a>
              <a href="#" style={{ color: '#fff', fontSize: '0.9rem' }}>Shipping</a>
              <a href="#" style={{ color: '#fff', fontSize: '0.9rem' }}>Cancellation & Returns</a>
              <a href="#" style={{ color: '#fff', fontSize: '0.9rem' }}>FAQ</a>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#878787', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '16px' }}>Consumer Policy</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="#" style={{ color: '#fff', fontSize: '0.9rem' }}>Return Policy</a>
              <a href="#" style={{ color: '#fff', fontSize: '0.9rem' }}>Terms of Use</a>
              <a href="#" style={{ color: '#fff', fontSize: '0.9rem' }}>Security</a>
              <a href="#" style={{ color: '#fff', fontSize: '0.9rem' }}>Privacy</a>
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
            <span>🛍️ Sell On Mini Flipkart</span>
            <span>⭐ Advertise</span>
            <span>🎁 Gift Cards</span>
            <span>❓ Help Center</span>
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
