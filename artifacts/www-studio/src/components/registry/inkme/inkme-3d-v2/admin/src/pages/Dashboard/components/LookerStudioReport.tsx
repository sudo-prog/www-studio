import React from 'react';

const LookerStudioReport = () => {
    return (
        <div className="looker-studio-container" style={{
            width: '100%',
            height: '600px',
            margin: '20px 0',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
            <iframe
                width="100%"
                height="100%"
                src="https://lookerstudio.google.com/embed/reporting/c4804093-6225-41c5-9c5c-5eb8b075ded6/page/kIV1C"
                frameBorder="0"
                style={{ border: 0 }}
                allowFullScreen
                sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                title="Looker Studio Report"
            />
        </div>
    );
};

// export default LookerStudioReport; 
export { LookerStudioReport as InkMeLookerStudioReport };
