
import { useRef, useState } from "react";
import { Camera, Trash2, User, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  profileService,
  getProfileImageUrl,
} from "../services/profile";

interface ProfilePictureProps {
  image?: string | null;
  name: string;
  onImageChange: (image: string | null) => void;
  size?: "sm" | "md" | "lg";
  editable?: boolean;
}

export default function ProfilePicture({
  image,
  name,
  onImageChange,
  size = "lg",
  editable = true,
}: ProfilePictureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const sizes = {
    sm: "h-10 w-10 text-sm",
    md: "h-20 w-20 text-2xl",
    lg: "h-32 w-32 text-4xl",
  };

  const imageUrl = preview || getProfileImageUrl(image);

  console.log("PROFILE IMAGE FROM DATABASE:", image);
  console.log("PROFILE IMAGE URL:", imageUrl);

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPG, PNG, and WEBP images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must not exceed 5 MB.");
      event.target.value = "";
      return;
    }

    const temporaryPreview = URL.createObjectURL(file);

    setPreview(temporaryPreview);
    setImageError(false);
    setLoading(true);

    try {
      const response = await profileService.uploadAvatar(file);

      console.log("UPLOAD RESPONSE:", response);

      onImageChange(response.profileImage);

      toast.success("Profile picture updated!");
    } catch (error: any) {
      setPreview(null);

      console.error("PROFILE UPLOAD ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to upload profile picture."
      );
    } finally {
      URL.revokeObjectURL(temporaryPreview);
      setPreview(null);
      setLoading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    if (!image) return;

    setLoading(true);

    try {
      await profileService.removeAvatar();

      onImageChange(null);
      setImageError(false);

      toast.success("Profile picture removed.");
    } catch (error: any) {
      console.error("PROFILE REMOVE ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to remove profile picture."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div
          className={`${sizes[size]} relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-blue-100 font-bold text-blue-700 shadow-md`}
        >
          {imageUrl && !imageError ? (
            <img
              key={imageUrl}
              src={imageUrl}
              alt={`${name}'s profile`}
              onLoad={() => {
                console.log("PROFILE IMAGE LOADED:", imageUrl);
                setImageError(false);
              }}
              onError={() => {
                console.error("PROFILE IMAGE FAILED TO LOAD:", imageUrl);
                setImageError(true);
              }}
              className="absolute inset-0 block h-full w-full rounded-full object-cover object-center"
            />
          ) : (
            <span className="select-none">
              {initials || <User className="h-8 w-8" />}
            </span>
          )}
        </div>

        {editable && (
          <button
            type="button"
            disabled={loading}
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50"
            title="Change profile picture"
          >
            {loading ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Camera size={17} />
            )}
          </button>
        )}
      </div>

      {editable && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          <p className="text-xs text-gray-500">
            JPG, PNG or WEBP. Maximum 5 MB.
          </p>

          {image && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={loading}
              className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              <Trash2 size={15} />
              Remove picture
            </button>
          )}
        </>
      )}
    </div>
  );
}
