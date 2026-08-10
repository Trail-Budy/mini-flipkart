import React from 'react';

export const SkeletonProductCard = () => {
  return (
    <div className="card" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ height: '200px', backgroundColor: '#e0e0e0', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ height: '20px', width: '80%', backgroundColor: '#e0e0e0', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
        <div style={{ height: '16px', width: '40%', backgroundColor: '#e0e0e0', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
        <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
          <div style={{ height: '24px', width: '30%', backgroundColor: '#e0e0e0', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
          <div style={{ height: '24px', width: '20%', backgroundColor: '#e0e0e0', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
        </div>
      </div>
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ height: '40px', width: '100%', backgroundColor: '#e0e0e0', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export const SkeletonProductGrid = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-4">
      {[...Array(count)].map((_, i) => <SkeletonProductCard key={i} />)}
    </div>
  );
};

export const SkeletonCartItem = () => {
  return (
    <div style={{ display: 'flex', padding: '24px 0', borderBottom: '1px solid var(--border-subtle)', gap: '16px' }}>
      <div style={{ width: '80px', height: '80px', backgroundColor: '#e0e0e0', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ height: '20px', width: '60%', backgroundColor: '#e0e0e0', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
        <div style={{ height: '16px', width: '30%', backgroundColor: '#e0e0e0', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
        <div style={{ height: '24px', width: '20%', backgroundColor: '#e0e0e0', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
      </div>
    </div>
  );
};
