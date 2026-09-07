import * as React from 'react';
import ModalVideo from "react-modal-video";
import "../../../node_modules/react-modal-video/scss/modal-video.scss";

const VideoModal = () => {
  const [isOpen, setOpen] = useState(false);

  return (
    <React.Fragment>
      <ModalVideo
        channel="youtube"
        autoplay
        isOpen={isOpen}
        videoId="dDdiubZjYwM?si=1dmz3IDCPpFQjSzV"
        onClose={() => setOpen(false)}
      />

      <div className="video-btn">
        <button
          className="video-btn ripple video-popup"
          onClick={() => setOpen(true)}
        >
          <i className="fas fa-play"></i>
        </button>
      </div>
    </React.Fragment>
  );
};

// export default VideoModal;
export { VideoModal as InkMeVideoModal };
