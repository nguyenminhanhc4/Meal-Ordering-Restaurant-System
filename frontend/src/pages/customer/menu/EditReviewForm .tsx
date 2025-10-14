import { useState } from "react";
import { FaStar } from "react-icons/fa";

// ✅ Gợi ý thêm type rõ ràng (nếu bạn dùng TypeScript)
interface EditReviewFormProps {
  review: {
    id: number;
    rating: number;
    comment: string;
  };
  onSave: (updatedData: { rating: number; comment: string }) => void;
  onCancel: () => void;
}

const EditReviewForm = ({ review, onSave, onCancel }: EditReviewFormProps) => {
  const [newComment, setNewComment] = useState(review.comment);
  const [newRating, setNewRating] = useState(review.rating);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Gửi dữ liệu đã chỉnh sửa lên parent
    onSave({
      rating: newRating,
      comment: newComment.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-3">
      {/* ⭐ Rating chỉnh sửa */}
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`h-4 w-4 cursor-pointer transition ${
              i < newRating
                ? "text-yellow-500"
                : "text-gray-300 hover:text-yellow-400"
            }`}
            onClick={() => setNewRating(i + 1)}
          />
        ))}
      </div>

      {/* 💬 Comment chỉnh sửa */}
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        className="w-full p-3 text-sm text-gray-700 border border-stone-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition"
        required
      />

      {/* ⚙️ Nút hành động */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition">
          Hủy
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50"
          disabled={
            newComment.trim() === review.comment.trim() &&
            newRating === review.rating
          }>
          Lưu
        </button>
      </div>
    </form>
  );
};

export default EditReviewForm;
