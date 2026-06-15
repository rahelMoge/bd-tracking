export function PageHeader({ icon, title, subtitle, children }) {
    return (
        <div style={{
            padding: '18px 24px 14px',
            borderBottom: '1px solid #2d3748',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
                <div>
                    <div style={{ fontSize: 20, fontWeight: 600, color: '#e2e8f0' }}>{title}</div>
                    <div style={{ fontSize: 12, color: '#718096' }}>{subtitle}</div>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{children}</div>
        </div>
    )
}

export function Btn({ children, onClick, variant = 'primary', small }) {
    const styles = {
        primary: { background: '#3b5bdb', color: '#fff', border: 'none' },
        secondary: { background: '#1e2433', color: '#a0aec0', border: '1px solid #2d3748' },
        danger: { background: '#e53e3e22', color: '#fc8181', border: '1px solid #e53e3e44' },
    }
    return (
        <button
            onClick={onClick}
            style={{
                ...styles[variant],
                padding: small ? '5px 10px' : '8px 14px',
                borderRadius: 7,
                cursor: 'pointer',
                fontSize: small ? 12 : 13,
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
            }}
        >
            {children}
        </button>
    )
}

export function Badge({ children, color = 'blue' }) {
    const colors = {
        blue: { bg: '#3b5bdb22', color: '#7b9cff' },
        green: { bg: '#48bb7822', color: '#68d391' },
        red: { bg: '#e53e3e22', color: '#fc8181' },
        yellow: { bg: '#ecc94b22', color: '#f6e05e' },
        gray: { bg: '#2d374888', color: '#a0aec0' },
        purple: { bg: '#805ad522', color: '#b794f4' },
    }
    const c = colors[color] || colors.gray
    return (
        <span style={{
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 4,
            background: c.bg,
            color: c.color,
            fontWeight: 500,
            whiteSpace: 'nowrap'
        }}>
            {children}
        </span>
    )
}

export function Modal({ title, onClose, children }) {
    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{
                background: '#141720',
                border: '1px solid #2d3748',
                borderRadius: 12,
                width: 520,
                maxHeight: '85vh',
                overflow: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
            }}>
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #2d3748',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: '#e2e8f0' }}>{title}</div>
                    <button onClick={onClose} style={{
                        background: 'none', border: 'none',
                        color: '#718096', cursor: 'pointer', fontSize: 20
                    }}>✕</button>
                </div>
                <div style={{ padding: 20 }}>{children}</div>
            </div>
        </div>
    )
}

export function Field({ label, children }) {
    return (
        <div style={{ marginBottom: 14 }}>
            <label style={{
                display: 'block', fontSize: 12,
                color: '#a0aec0', marginBottom: 5, fontWeight: 500
            }}>
                {label}
            </label>
            {children}
        </div>
    )
}

export function Input({ value, onChange, placeholder, type = 'text' }) {
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            style={{
                width: '100%',
                background: '#0f1117',
                border: '1px solid #2d3748',
                borderRadius: 7,
                padding: '8px 10px',
                color: '#e2e8f0',
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box'
            }}
        />
    )
}

export function Select({ value, onChange, children, style }) {
    return (
        <select
            value={value}
            onChange={onChange}
            style={{
                background: '#0f1117',
                border: '1px solid #2d3748',
                borderRadius: 7,
                padding: '7px 10px',
                color: '#a0aec0',
                fontSize: 13,
                outline: 'none',
                cursor: 'pointer',
                ...style
            }}
        >
            {children}
        </select>
    )
}

export function EmptyState({ icon, message }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            gap: 12,
            padding: 60
        }}>
            <div style={{ fontSize: 40 }}>{icon}</div>
            <div style={{ fontSize: 14, color: '#718096' }}>{message}</div>
        </div>
    )
}

export function SearchBar({ value, onChange, placeholder }) {
    return (
        <div style={{ position: 'relative' }}>
            <span style={{
                position: 'absolute', left: 10,
                top: '50%', transform: 'translateY(-50%)',
                color: '#4a5568', fontSize: 14
            }}>🔍</span>
            <input
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                style={{
                    background: '#0f1117',
                    border: '1px solid #2d3748',
                    borderRadius: 7,
                    padding: '7px 10px 7px 30px',
                    color: '#e2e8f0',
                    fontSize: 13,
                    outline: 'none',
                    width: 220
                }}
            />
        </div>
    )
}