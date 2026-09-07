import * as React from 'react'

const InkMeFile = ({ inkmeFile }) => {
    const CUSTOM_PAGE_PRODUCTION = import.meta.env.VITE_CUSTOM_PAGE_PRODUCTION;
    const CUSTOM_PAGE_DEVELOPMENT = import.meta.env.VITE_CUSTOM_PAGE_DEVELOPMENT;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const previewModel = () => {
        if (inkmeFile?.url) {
            // Create shareable link
            const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? CUSTOM_PAGE_DEVELOPMENT
                : CUSTOM_PAGE_PRODUCTION;
            const shareableLink = `${baseUrl}?layout=${encodeURIComponent(inkmeFile.url)}`;

            window.open(shareableLink, '_blank');
        }
    };

    if (!inkmeFile) return null;

    return (
        <div style={{ display: 'inline-block', position: 'relative' }}>
            <button
                onClick={previewModel}
                title={`Xem model 3D: ${inkmeFile.sceneName || 'Custom Design'}`}
                style={{
                    fontSize: '12px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontWeight: '500',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: 'rgba(0, 123, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0, 123, 255, 0.3)',
                    color: '#0056b3',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0, 123, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}
                onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 8px 20px rgba(0, 123, 255, 0.3)';
                    e.target.style.background = 'rgba(0, 123, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.2)';
                    e.target.style.background = 'rgba(0, 123, 255, 0.1)';
                }}
            >
                <i className="fas fa-eye" style={{ fontSize: '10px' }}></i>
                Xem Model 3D
            </button>
        </div>
    )
}

// export default InkMeFile 
export { InkMeFile as InkMeInkMeFile };
