import React from 'react';

/* ══════════════════════════════════════════════════════════════════════════
 *  TypeForge Email Templates — React-based, Premium Design
 *  These render as HTML emails via Resend's React rendering engine
 * ══════════════════════════════════════════════════════════════════════════ */

// Shared styles
const containerStyle: React.CSSProperties = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  backgroundColor: '#030305',
  color: '#ffffff',
  padding: '40px 20px',
  maxWidth: '600px',
  margin: '0 auto',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#0a0a0f',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  padding: '40px',
  textAlign: 'center' as const,
};

const buttonStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '14px 36px',
  backgroundColor: '#6366f1',
  color: '#ffffff',
  borderRadius: '9999px',
  fontSize: '14px',
  fontWeight: 700,
  textDecoration: 'none',
  letterSpacing: '0.05em',
  textTransform: 'uppercase' as const,
};

const footerStyle: React.CSSProperties = {
  marginTop: '32px',
  padding: '20px',
  textAlign: 'center' as const,
  color: '#52525b',
  fontSize: '12px',
  lineHeight: 1.6,
};

/* ════════════════════════════════════════════════════════════
 *  Welcome Email — Sent on new user registration
 * ════════════════════════════════════════════════════════════ */
export function WelcomeEmail({ name, loginUrl }: { name: string; loginUrl?: string }) {
  const url = loginUrl || process.env.NEXTAUTH_URL || 'https://typeforge.com';

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Logo / Brand */}
        <div style={{ marginBottom: '24px' }}>
          <span style={{
            fontSize: '32px',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            TypeForge
          </span>
        </div>

        {/* Welcome Text */}
        <h1 style={{
          fontSize: '24px',
          fontWeight: 800,
          color: '#ffffff',
          marginBottom: '8px',
          letterSpacing: '-0.02em',
        }}>
          Welcome, {name}! 🎉
        </h1>

        <p style={{
          fontSize: '15px',
          color: '#a1a1aa',
          lineHeight: 1.7,
          marginBottom: '32px',
        }}>
          Your TypeForge account is ready. You now have access to the world&apos;s most
          advanced typing platform — 10 unique challenge modes, real-time community,
          and AI-powered practice.
        </p>

        {/* CTA Button */}
        <a href={`${url}/login`} style={buttonStyle}>
          Start Typing →
        </a>

        {/* Features Grid */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '32px',
          flexWrap: 'wrap' as const,
          justifyContent: 'center',
        }}>
          {['⚡ 10 Challenge Modes', '🏆 ELO Rankings', '💬 Live Community'].map((item) => (
            <span key={item} style={{
              fontSize: '11px',
              color: '#71717a',
              backgroundColor: 'rgba(255,255,255,0.04)',
              padding: '6px 14px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={footerStyle}>
        <p>This email was sent by TypeForge. If you didn&apos;t create an account, you can safely ignore this email.</p>
        <p style={{ marginTop: '8px', color: '#3f3f46' }}>
          © {new Date().getFullYear()} TypeForge. All rights reserved.
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
 *  Password Reset Email — Template ready for future OTP flow
 * ════════════════════════════════════════════════════════════ */
export function PasswordResetEmail({ 
  name, 
  resetUrl, 
  otp 
}: { 
  name: string; 
  resetUrl?: string; 
  otp?: string;
}) {
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ marginBottom: '24px' }}>
          <span style={{
            fontSize: '32px',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #f43f5e, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            TypeForge
          </span>
        </div>

        <h1 style={{
          fontSize: '24px',
          fontWeight: 800,
          color: '#ffffff',
          marginBottom: '8px',
        }}>
          Password Reset Request
        </h1>

        <p style={{
          fontSize: '15px',
          color: '#a1a1aa',
          lineHeight: 1.7,
          marginBottom: '24px',
        }}>
          Hi {name}, we received a request to reset your password.
          {otp ? ' Use the code below to proceed:' : ' Click the button below to set a new password:'}
        </p>

        {otp ? (
          <div style={{
            backgroundColor: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
          }}>
            <span style={{
              fontSize: '36px',
              fontWeight: 900,
              letterSpacing: '0.3em',
              color: '#f43f5e',
              fontFamily: 'monospace',
            }}>
              {otp}
            </span>
            <p style={{ fontSize: '11px', color: '#71717a', marginTop: '8px' }}>
              This code expires in 15 minutes.
            </p>
          </div>
        ) : resetUrl ? (
          <a href={resetUrl} style={{ ...buttonStyle, backgroundColor: '#f43f5e' }}>
            Reset Password →
          </a>
        ) : null}

        <p style={{
          fontSize: '12px',
          color: '#52525b',
          marginTop: '24px',
        }}>
          If you didn&apos;t request this, you can safely ignore this email.
          Your password will remain unchanged.
        </p>
      </div>

      <div style={footerStyle}>
        <p>© {new Date().getFullYear()} TypeForge. All rights reserved.</p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
 *  Achievement Unlocked Email — Gamification notification
 * ════════════════════════════════════════════════════════════ */
export function AchievementEmail({ 
  name, 
  achievement, 
  xpReward 
}: { 
  name: string; 
  achievement: string; 
  xpReward: number;
}) {
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>

        <h1 style={{
          fontSize: '24px',
          fontWeight: 800,
          color: '#ffffff',
          marginBottom: '8px',
        }}>
          Achievement Unlocked!
        </h1>

        <p style={{
          fontSize: '15px',
          color: '#a1a1aa',
          lineHeight: 1.7,
          marginBottom: '24px',
        }}>
          Congratulations {name}! You&apos;ve earned the <strong style={{ color: '#fbbf24' }}>{achievement}</strong> achievement
          and received <strong style={{ color: '#6366f1' }}>+{xpReward} XP</strong>.
        </p>

        <a href={`${process.env.NEXTAUTH_URL || 'https://typeforge.com'}/achievements`} style={buttonStyle}>
          View All Achievements →
        </a>
      </div>

      <div style={footerStyle}>
        <p>© {new Date().getFullYear()} TypeForge. All rights reserved.</p>
      </div>
    </div>
  );
}
