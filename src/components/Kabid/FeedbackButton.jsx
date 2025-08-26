import { Send } from "lucide-react";
import FeedbackForm from "./FeedbackForm";
import { useState } from "react";

const FeedbackButton = ({ disposisi, onSuccess }) => {
  const [showModal, setShowModal] = useState(false);
  
  const handleSuccess = (feedbackData) => {
    setShowModal(false);
    onSuccess && onSuccess();
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <Send className="w-4 h-4" />
        Kirim Feedback
      </button>

      {showModal && (
        <FeedbackForm
          disposisi={disposisi}
          onCancel={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};
export default FeedbackButton