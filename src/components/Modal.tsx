import TruckingApp from "./TruckingApp";

const Modal = ({
  showPopup,
  setShowPopup,
}: {
  showPopup: boolean;
  setShowPopup: (value: boolean) => void;
}) => {
  return (
    <>
      {showPopup && (
        <div className="fixed z-50 user-menu inset-0 flex items-center justify-center w-full bg-gray-50/75	 ">
          <div className="bg-white p-6 rounded-md w-full max-w-xl mx-auto shadow-2xl">
            <TruckingApp setShowPopup={setShowPopup} />
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
