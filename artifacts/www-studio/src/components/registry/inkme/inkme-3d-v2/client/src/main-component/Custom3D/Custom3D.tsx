import * as React from 'react';
import { trackStart3DDesign, trackComplete3DDesign } from '../../utils/analytics';

const CUSTOM_PAGE_DEVELOPMENT = import.meta.env.VITE_CUSTOM_PAGE_DEVELOPMENT;
const CUSTOM_PAGE_PRODUCTION = import.meta.env.VITE_CUSTOM_PAGE_PRODUCTION;

const Custom3D = () => {
    const iframeRef = useRef(null);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.userId || '';
    const authorization = localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '';
    const [isProcessing, setIsProcessing] = useState(false);
    const productId = `Inkme-custom-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    useEffect(() => {
        const dataToSend = {
            type: 'initData',
            userId,
            productId,
            authorization
        };

        // Google Analytics tracking - Start 3D Design
        trackStart3DDesign({
            productType: 'tshirt',
            userId: userId || 'anonymous',
            productId: productId
        });

        const sendMessage = () => {
            if (iframeRef.current) {
                iframeRef.current.contentWindow.postMessage(dataToSend, '*');
            }

        };

        //Wait for the iframe to finish loading before sending
        const iframe = iframeRef.current;
        if (iframe) {
            iframe.addEventListener('load', sendMessage);
        }

        return () => {
            if (iframe) {
                iframe.removeEventListener('load', sendMessage);
            }
        };
    }, [userId, productId, authorization]);

    return (
        <div className='custom-3d-popup-section'
            style={{
                width: '110vw',
                height: '110vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                position: 'relative'
            }}>
            {isProcessing && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '10px',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <div className="spinner" style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid #fff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>Processing.</div>
            )}
            <iframe
                ref={iframeRef}
                src={window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                    ? CUSTOM_PAGE_DEVELOPMENT
                    : CUSTOM_PAGE_PRODUCTION}
                width="100%"
                height="100%"
                style={{
                    border: 'none',
                    borderRadius: '18px',
                    boxShadow: '0 8px 32px rgba(40,60,120,0.18)',
                    background: '#fff',
                    minHeight: '400px',
                    minWidth: '320px'
                }}
                title="Custom 3D Preview"
            ></iframe>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

// export default Custom3D;
export { Custom3D as InkMeCustom3D };
