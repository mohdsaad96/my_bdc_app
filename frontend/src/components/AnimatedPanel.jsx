import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

const AnimatedPanel = ({ isOpen = true, onClose, children, title }) => {
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    setVisible(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    // start exit animation
    setVisible(false);
    // wait for animation and then call onClose
    setTimeout(() => {
      onClose?.();
    }, 280);
  };

  if (!isOpen && !visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className={`absolute inset-0 bg-black/40 transition-opacity ${visible ? "opacity-100" : "opacity-0"}`} onClick={handleClose} />

      <div
        className={`relative ml-auto w-full max-w-md h-full bg-base-100 shadow-lg transform transition-transform duration-200 ease-in-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 border-b flex items-center gap-3">
          <button onClick={handleClose} className="btn btn-ghost btn-square">
            <ArrowLeft />
          </button>
          <div className="font-semibold text-lg">{title}</div>
        </div>

        <div className="p-4 overflow-auto h-full">{children}</div>
      </div>
    </div>
  );
};

export default AnimatedPanel;
