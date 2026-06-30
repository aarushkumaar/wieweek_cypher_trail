import '../styles/TabletFrame.css';

export default function TabletFrame({ children }) {
  return (
    <div className="tablet-frame">
      <div className="tablet-camera">
        <span className="tablet-camera-dot" />
        <span className="tablet-camera-dot" />
      </div>
      <div className="tablet-screen">
        {children}
      </div>
    </div>
  );
}
