import * as React from 'react';
import './Cart.css';

const VideoGuidePopup = ({ isVisible, onClose, inkmeFile }) => {
    const [mounted, setMounted] = useState(false);
    const [shareableLink, setShareableLink] = useState(null);
    const CUSTOM_PAGE_PRODUCTION = import.meta.env.VITE_CUSTOM_PAGE_PRODUCTION;
    const CUSTOM_PAGE_DEVELOPMENT = import.meta.env.VITE_CUSTOM_PAGE_DEVELOPMENT;

    useEffect(() => {
        if (isVisible) {
            setMounted(true);

            //Create shareable link from inkmeFile.url
            if (inkmeFile?.url) {
                const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                    ? CUSTOM_PAGE_DEVELOPMENT
                    : CUSTOM_PAGE_PRODUCTION;
                const link = `${baseUrl}?layout=${encodeURIComponent(inkmeFile.url)}`;
                setShareableLink(link);
            }
        } else {
            const timer = setTimeout(() => setMounted(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isVisible, inkmeFile]);

    if (!mounted) return null;

    return (
        <div
            className={`video-guide-popup ${isVisible ? 'popup-visible' : 'popup-hidden'}`}
            onMouseLeave={onClose}
        >
            <div className="popup-content">


                <div className="popup-header">
                    <h6 className="header-title">{shareableLink? '🎨 Preview 3D Model': '🎥 3D file user guide'}             </div>

                {shareableLink ? (
                    <div className="model-preview-container">
                        <iframe
                            src={shareableLink}
                            className="model-preview-iframe"
                            frameBorder="0"
                            allowFullScreen
                            title="Model 3D Preview"
                        />
                        <div className="model-preview-overlay">
                            <div className="preview-info">
                                <p className="preview-description">✨ Your 3D design</p>
                                <div className="preview-buttons">
                                    <button
                                        className="download-file-button"
                                        onClick={() => window.open(inkmeFile.url, '_blank')}
                                        title="Download .sav file"
                                    >
                                        <i className="fas fa-download"></i>Download file</button>
                                    <button
                                        className="open-full-button"
                                        onClick={() => window.open(shareableLink, '_blank')}
                                    >
                                        <i className="fas fa-external-link-alt"></i>
                                        Toàn màn hình
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="video-container">
                        <video
                            className="video-player"
                            autoPlay
                            muted
                            loop
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.classList.add('fallback-visible');
                            }}
                        >
                            <source src="/videos/inkme-guide.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>

                        <div className="video-fallback">
                            <i className="fas fa-play-circle fallback-icon"></i>
                            <div className="fallback-content">
                                <strong className="fallback-title">User guide:</strong><br />
                                <div className="fallback-steps">1. Press the "Download 3D Model" buttonodel"<br />2. The .sav file will be downloaded<br />3. Open the file with 3D software<br />4. Print or edit as desired</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="popup-arrow" />
            <div className="popup-arrow-inner" />
        </div>
    );
};

// export default VideoGuidePopup; 
export { VideoGuidePopup as InkMeVideoGuidePopup };
