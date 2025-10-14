import React, { useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { Button, Textarea, Label } from "flowbite-react";
import { HiXCircle } from "react-icons/hi";
import { useNotification } from "../../components/Notification/NotificationContext";
import { Spinner } from "flowbite-react";

interface ProductReviewFormProps {
  productId: number;
  onSubmit: (data: { rating: number; comment: string }) => Promise<void>;
}

const ProductReviewForm: React.FC<ProductReviewFormProps> = ({
  productId,
  onSubmit,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { notify } = useNotification();

  const MAX_COMMENT_LENGTH = 500;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating < 0.5) {
      notify("error", "Vui lòng chọn số sao đánh giá");
      return;
    }

    if (!comment.trim()) {
      notify("error", "Vui lòng nhập bình luận");
      return;
    }

    if (comment.length > MAX_COMMENT_LENGTH) {
      notify(
        "error",
        `Bình luận không được vượt quá ${MAX_COMMENT_LENGTH} ký tự`
      );
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ rating, comment });
      setRating(0);
      setHoverRating(0);
      setComment("");
    } catch (err) {
      console.error(err);
      notify("error", "Gửi đánh giá thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setRating(0);
    setHoverRating(0);
    setComment("");
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => {
      const displayRating = hoverRating || rating;
      let StarComponent = FaRegStar;
      if (displayRating >= star) StarComponent = FaStar;
      else if (displayRating >= star - 0.5) StarComponent = FaStarHalfAlt;

      return (
        <button
          key={star}
          type="button"
          className="text-2xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded"
          onMouseMove={(e) => {
            const { left, width } = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - left) / width;
            setHoverRating(star - 1 + (percent >= 0.5 ? 1 : 0.5));
          }}
          onMouseLeave={() => setHoverRating(0)}
          onClick={(e) => {
            const { left, width } = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - left) / width;
            setRating(star - 1 + (percent >= 0.5 ? 1 : 0.5));
          }}
          aria-label={`Đánh giá ${star} sao`}>
          <StarComponent
            className={`${
              displayRating >= star - 0.5 ? "text-yellow-500" : "text-gray-300"
            } hover:scale-110 transition-transform duration-200`}
          />
        </button>
      );
    });
  };

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800">
        Viết đánh giá của bạn
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Label>
          <Label className="mb-2 block font-semibold">Đánh giá</Label>
          <div
            className="flex items-center gap-1 mb-4"
            role="radiogroup"
            aria-label="Đánh giá sao">
            {renderStars()}
            {rating > 0 && (
              <span className="ml-3 text-sm text-gray-600">
                {rating.toFixed(1)} / 5
              </span>
            )}
          </div>
        </Label>

        <div>
          <Label className="mb-2 block font-semibold">Bình luận</Label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ cảm nhận của bạn về món ăn..."
            rows={4}
            maxLength={MAX_COMMENT_LENGTH}
            className="w-full !text-black border-stone-300 !bg-white focus:border-green-500 focus:ring-green-500"
            aria-describedby="comment-count"
          />
          <div className="flex justify-between items-center mt-1">
            <p
              id="comment-count"
              className={`text-sm ${
                comment.length > MAX_COMMENT_LENGTH
                  ? "text-red-600"
                  : "text-gray-500"
              }`}>
              {comment.length}/{MAX_COMMENT_LENGTH} ký tự
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            color="success"
            disabled={submitting}
            className="bg-gradient-to-r text-white from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            aria-label="Gửi đánh giá">
            {submitting ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" /> Đang gửi...
              </span>
            ) : (
              "Gửi đánh giá"
            )}
          </Button>
          <Button
            type="button"
            color="red"
            onClick={handleReset}
            disabled={submitting}
            className="border-stone-300 hover:bg-stone-100"
            aria-label="Hủy đánh giá">
            <HiXCircle className="mr-2 h-5 w-5" />
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductReviewForm;
