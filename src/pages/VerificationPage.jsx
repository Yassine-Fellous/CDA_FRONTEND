import React, { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const CODE_LENGTH = 6;
const mainColor = "#7CBDF8";

const VerificationPage = () => {
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
  const [message, setMessage] = useState('');
  const location = useLocation();
  const email = location.state?.email || '';
  const inputs = useRef([]);

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 1);
    const newCode = [...code];
    newCode[idx] = val;
    setCode(newCode);
    if (val && idx < CODE_LENGTH - 1) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('Code vérifié ! (simulation)');
  };

  return (
    <div className="verify-container">
      <form className="verify-form" onSubmit={handleSubmit}>
        <h2>Vérification Email</h2>
        <p>
          Un code de vérification a été envoyé à <span className="email">{email}</span>
        </p>
        <div className="code-inputs">
          {code.map((v, idx) => (
            <input
              key={idx}
              ref={el => (inputs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={v}
              onChange={e => handleChange(e, idx)}
              onKeyDown={e => handleKeyDown(e, idx)}
              required
            />
          ))}
        </div>
        <button type="submit" className="btn">Vérifier</button>
        {message && <div className="success-msg">{message}</div>}
      </form>
      <style>{`
        .verify-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f6f8fa;
        }
        .verify-form {
          background: #fff;
          padding: 32px 24px;
          border-radius: 18px;
          box-shadow: 0 0 24px rgba(0,0,0,.08);
          width: 100%;
          max-width: 350px;
          text-align: center;
        }
        .verify-form h2 {
          font-size: 1.6rem;
          margin-bottom: 18px;
          color: #222;
        }
        .verify-form p {
          font-size: 1rem;
          color: #444;
          margin-bottom: 24px;
        }
        .verify-form .email {
          color: ${mainColor};
          font-weight: 600;
        }
        .code-inputs {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 24px;
        }
        .code-inputs input {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid ${mainColor};
          background: #eaf4fd;
          text-align: center;
          font-size: 1.4rem;
          color: #222;
          outline: none;
          transition: border .2s;
        }
        .code-inputs input:focus {
          border: 2px solid #5bb0f7;
        }
        .btn {
          width: 100%;
          height: 44px;
          background: ${mainColor};
          border-radius: 8px;
          border: none;
          color: #fff;
          font-weight: 600;
          font-size: 1rem;
          margin-top: 10px;
          cursor: pointer;
          transition: background .2s;
        }
        .btn:hover { background: #5bb0f7; }
        .success-msg {
          color: #16a34a;
          margin-top: 16px;
        }
      `}</style>
    </div>
  );
};

export default VerificationPage;