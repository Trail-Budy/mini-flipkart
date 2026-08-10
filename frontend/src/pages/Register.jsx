import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'warning');
      return;
    }

    try {
      await register(name, email, password);
      showToast('Registration successful! Please login.', 'success');
      navigate('/login');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 200px)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '850px', display: 'flex', minHeight: '550px' }}>
        
        {/* Left Visual Area */}
        <div className="hide-on-mobile" style={{ flex: 1, backgroundColor: 'var(--primary)', color: 'white', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'white' }}>Looks like you're new here!</h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: '1.6' }}>
            Sign up with your email to get started
          </p>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/login_img_c4a81e.png" alt="Register" style={{ maxWidth: '100%' }} />
          </div>
        </div>

        {/* Right Form Area */}
        <div style={{ flex: 1, padding: '48px 40px', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-surface)' }}>
          <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="input-field"
                placeholder="Enter Full Name"
                style={{ padding: '16px', fontSize: '1rem', border: 'none', borderBottom: '1px solid var(--border-color)', borderRadius: '0', backgroundColor: 'transparent', boxShadow: 'none' }}
              />
            </div>

            <div className="input-group" style={{ marginBottom: '16px' }}>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="input-field"
                placeholder="Enter Email"
                style={{ padding: '16px', fontSize: '1rem', border: 'none', borderBottom: '1px solid var(--border-color)', borderRadius: '0', backgroundColor: 'transparent', boxShadow: 'none' }}
              />
            </div>
            
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="input-field"
                placeholder="Enter Password"
                style={{ padding: '16px', fontSize: '1rem', border: 'none', borderBottom: '1px solid var(--border-color)', borderRadius: '0', backgroundColor: 'transparent', boxShadow: 'none' }}
              />
            </div>

            <div className="input-group" style={{ marginBottom: '32px' }}>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                className="input-field"
                placeholder="Confirm Password"
                style={{ padding: '16px', fontSize: '1rem', border: 'none', borderBottom: '1px solid var(--border-color)', borderRadius: '0', backgroundColor: 'transparent', boxShadow: 'none' }}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              className="btn btn-secondary"
              style={{ padding: '14px', fontSize: '1rem', width: '100%', marginBottom: '16px', backgroundColor: '#fb641b', color: 'white', borderRadius: '2px', fontWeight: '500' }}
            >
              {loading ? 'Creating account...' : 'Continue'}
            </button>
            
          </form>
          
          <div style={{ textAlign: 'center', marginTop: 'auto', paddingTop: '24px' }}>
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.9rem' }}>Existing User? Log in</Link>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Register;
