import * as React from 'react';
import './Inkme3DPreview.css';
import { trackView3DPreview } from '../../utils/analytics';

const Inkme3DPreview = ({ inkmeFile, onClose }) => {
    const iframeRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!inkmeFile?.url) {
            setError('No file.inkme to load');
            return;
        }

        // Google Analytics tracking - View 3D Preview
        trackView3DPreview({
            sceneName: inkmeFile.sceneName || 'untitled',
            userId: 'anonymous' //Can be retrieved from context if needed
        });

        loadInkmeFile();
    }, [inkmeFile]);

    const loadInkmeFile = async () => {
        try {
            setIsLoading(true);
            setError(null);

            //Fetching file.inkme from Cloudinary
            const response = await fetch(inkmeFile.url);
            if (!response.ok) {
                throw new Error('Unable to load file.inkme');
            }

            const inkmeData = await response.json();

            //Waiting for iframe to finish loading
            const waitForIframe = () => {
                if (iframeRef.current && iframeRef.current.contentWindow) {
                    //Sending data to iframe to load
                    iframeRef.current.contentWindow.postMessage({
                        type: 'LOAD_INKME_FILE',
                        data: inkmeData
                    }, '*');
                } else {
                    setTimeout(waitForIframe, 100);
                }
            };

            waitForIframe();

        } catch (err) {
            console.error('Error loading inkme file:', err);
            setError('Error loading file.inkme:' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleIframeLoad = () => {
        setIsLoading(false);
    };

    const handleIframeError = () => {
        setError('Error loading 3D iframe');
        setIsLoading(false);
    };

    return (
        <div className="inkme-3d-preview-overlay">
            <div className="inkme-3d-preview-modal">
                <div className="preview-header">
                    <h3>Preview 3D - {inkmeFile?.sceneName}</h3>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="preview-content">
                    {isLoading && (
                        <div className="loading-container">
                            <div className="spinner"></div>
                            <p>Loading 3D model.</p>
                        </div>
                    )}

                    {error && (
                        <div className="error-container">
                            <i className="fas fa-exclamation-triangle"></i>
                            <p>{error}</p>
                            <button onClick={loadInkmeFile} className="retry-btn">
                                Thử lại
                            </button>
                        </div>
                    )}

                    {!isLoading && !error && (
                        <div className="iframe-container">
                            <iframe
                                ref={iframeRef}
                                src={`http://0.0.0.0:3000/3dpage/index.html?preview=true&sceneName=${inkmeFile?.sceneName}`}
                                width="100%"
                                height="100%"
                                style={{
                                    border: 'none',
                                    borderRadius: '8px',
                                    background: '#fff'
                                }}
                                title="3D Preview"
                                onLoad={handleIframeLoad}
                                onError={handleIframeError}
                            />
                        </div>
                    )}
                </div>

                <div className="preview-footer">
                    <div className="inkme-info">
                        <div className="info-item">
                            <span className="label">Màu áo:</span>
                            <div
                                className="color-preview"
                                style={{ backgroundColor: inkmeFile?.color }}
                            ></div>
                            <span>{inkmeFile?.color}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Background color:</span>
                            <div
                                className="color-preview"
                                style={{ backgroundColor: inkmeFile?.bgColor }}
                            ></div>
                            <span>{inkmeFile?.bgColor}</span>
                        </div>
                        {inkmeFile?.acidWash > 0 && (
                            <div className="info-item">
                                <span className="label">Acid Wash:</span>
                                <span>{Math.round(inkmeFile.acidWash * 100)}%</span>
                            </div>
                        )}
                        {inkmeFile?.puffPrint > 0 && (
                            <div className="info-item">
                                <span className="label">Puff Print:</span>
                                <span>{Math.round(inkmeFile.puffPrint * 100)}%</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// export default Inkme3DPreview; 
export { Inkme3DPreview as InkMeInkme3DPreview };
