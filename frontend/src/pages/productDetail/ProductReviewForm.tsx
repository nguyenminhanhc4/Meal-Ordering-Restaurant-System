import React, { useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { Button, Textarea, Label, Spinner } from "flowbite-react";
import { HiXCircle } from "react-icons/hi";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../components/Notification/NotificationContext";

interface ProductReviewFormProps {
  productId: number;
  onSubmit: (data: { rating: number; comment: string }) => Promise<void>;
}

const ProductReviewForm: React.FC<ProductReviewFormProps> = ({ onSubmit }) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { notify } = useNotification();

  const MAX_COMMENT_LENGTH = 500;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating < 0.5) {
      notify("error", t("review.error.noRating"));
      return;
    }

    if (!comment.trim()) {
      notify("error", t("review.error.emptyComment"));
      return;
    }

    if (comment.length > MAX_COMMENT_LENGTH) {
      notify("error", t("review.error.tooLong", { max: MAX_COMMENT_LENGTH }));
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
      notify("error", t("review.error.submitFailed"));
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
          aria-label={t("review.aria.rateStar", { star })}>
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
      <h2 className="text-3xl font-bold mb-4 text-gray-800">
        {t("review.title")}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Label>
          <Label className="mb-2 text-xl block !text-gray-800 font-semibold">
            {t("review.rating")}
          </Label>
          <div
            className="flex items-center gap-1 mb-4"
            role="radiogroup"
            aria-label={t("review.aria.ratingGroup")}>
            {renderStars()}
            {rating > 0 && (
              <span className="ml-3 text-sm text-gray-600">
                {rating.toFixed(1)} / 5
              </span>
            )}
          </div>
        </Label>

        <div>
          <Label className="mb-2 text-xl block !text-gray-800 font-semibold">
            {t("review.comment")}
          </Label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("review.placeholder")}
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
              {comment.length}/{MAX_COMMENT_LENGTH} {t("review.characters")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            color="success"
            disabled={submitting}
            className="bg-gradient-to-r text-white from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            aria-label={t("review.aria.submit")}>
            {submitting ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" /> {t("review.sending")}
              </span>
            ) : (
              t("review.submit")
            )}
          </Button>
          <Button
            type="button"
            color="red"
            onClick={handleReset}
            disabled={submitting}
            className="border-stone-300 hover:bg-stone-100"
            aria-label={t("review.aria.cancel")}>
            <HiXCircle className="mr-2 h-5 w-5" />
            {t("review.cancel")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductReviewForm;
