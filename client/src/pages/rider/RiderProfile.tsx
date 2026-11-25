
import { useEffect, useState, type FormEvent } from "react";
import {
  User,
  Phone,
  Mail,
  Bike,
  Lock,
  Save,
  Loader2,
  ShieldCheck,
  Power,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  riderAPI,
  type RiderProfile as RiderProfileType,
} from "../../services/rider";
import ProfilePicture from "../../components/ProfilePicture";
import { useAuth } from "../../contexts/AuthContext";

export default function RiderProfile() {
  const { user: authUser, updateUser } = useAuth();

  const [profile, setProfile] = useState<RiderProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [plateNumber, setPlateNumber] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function loadProfile() {
    try {
      setLoading(true);

      const data = await riderAPI.getProfile();

      setProfile(data);
      setName(data.user?.name || "");
      setPhone(data.user?.phone || "");
      setVehicleType(data.vehicleType || "");
      setPlateNumber(data.plateNumber || "");
    } catch (error) {
      console.error("Rider profile error:", error);
      toast.error("Failed to load rider profile.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  const handleProfileImageChange = (image: string | null) => {
    setProfile((current) =>
      current
        ? {
            ...current,
            user: current.user
              ? {
                  ...current.user,
                  profileImage: image,
                }
              : undefined,
          }
        : current
    );

    if (authUser) {
      updateUser({
        ...authUser,
        profileImage: image,
      });
    }
  };

  async function handleUpdateProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }

    try {
      setSavingProfile(true);

      await riderAPI.updateProfile({
        name: name.trim(),
        phone: phone.trim() || null,
        vehicleType: vehicleType.trim() || null,
        plateNumber: plateNumber.trim() || null,
      });

      toast.success("Profile updated successfully!");
      await loadProfile();
    } catch (error: any) {
      console.error("Update profile error:", error);

      toast.error(
        error.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAvailability(
    availability: "AVAILABLE" | "OFFLINE"
  ) {
    try {
      setSavingAvailability(true);

      await riderAPI.updateAvailability(availability);

      toast.success(
        availability === "AVAILABLE"
          ? "You are now available for deliveries."
          : "You are now offline."
      );

      await loadProfile();
    } catch (error: any) {
      console.error("Availability error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to update availability."
      );
    } finally {
      setSavingAvailability(false);
    }
  }

  async function handleChangePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please complete all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      setChangingPassword(true);

      await riderAPI.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      toast.success("Password changed successfully!");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Change password error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const availability = profile?.availability || "OFFLINE";

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-blue-600" size={36} />
          <p className="mt-3 text-sm text-slate-500">
            Loading rider profile...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-red-100 bg-white p-8 text-center">
          <p className="font-semibold text-slate-800">
            Unable to load rider profile.
          </p>
          <button
            onClick={loadProfile}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your personal information and rider account.
          </p>
        </div>

        {/* Profile Overview */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-6 text-white sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="shrink-0">
                <ProfilePicture
                  image={profile.user?.profileImage}
                  name={profile.user?.name || "Rider"}
                  onImageChange={handleProfileImageChange}
                  size="lg"
                  editable
                />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold">
                  {profile.user?.name || "Rider"}
                </h2>
                <p className="mt-1 text-sm text-blue-100">
                  {profile.user?.email || "Rider Account"}
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-blue-100">
                  TownExpress Rider
                </p>
              </div>

              <div className="flex items-center gap-2 self-start rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    availability === "AVAILABLE"
                      ? "bg-green-300"
                      : availability === "BUSY"
                        ? "bg-yellow-300"
                        : "bg-slate-300"
                  }`}
                />
                {availability.replace("_", " ")}
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Mail size={19} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Email Address</p>
                <p className="truncate text-sm font-semibold text-slate-800">
                  {profile.user?.email || "Not available"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-green-50 p-3 text-green-600">
                <Bike size={19} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Vehicle Type</p>
                <p className="text-sm font-semibold text-slate-800">
                  {profile.vehicleType || "Not specified"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Availability */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <Power size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">
                Rider Availability
              </h2>
              <p className="text-sm text-slate-500">
                Manage whether you can receive delivery assignments.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              disabled={
                savingAvailability ||
                availability === "AVAILABLE" ||
                availability === "BUSY"
              }
              onClick={() => handleAvailability("AVAILABLE")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                availability === "AVAILABLE"
                  ? "bg-green-600 text-white"
                  : "border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
              }`}
            >
              {savingAvailability && <Loader2 size={17} className="animate-spin" />}
              <ShieldCheck size={18} />
              Available
            </button>

            <button
              type="button"
              disabled={
                savingAvailability ||
                availability === "OFFLINE" ||
                availability === "BUSY"
              }
              onClick={() => handleAvailability("OFFLINE")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                availability === "OFFLINE"
                  ? "bg-slate-700 text-white"
                  : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {savingAvailability && <Loader2 size={17} className="animate-spin" />}
              <Power size={18} />
              Offline
            </button>
          </div>

          {availability === "BUSY" && (
            <p className="mt-4 rounded-xl bg-yellow-50 p-3 text-sm text-yellow-800">
              You currently have an active delivery. Your availability is
              managed automatically until the delivery is completed.
            </p>
          )}
        </section>

        {/* Personal and Vehicle Information */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Personal & Vehicle Information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Keep your rider information up to date.
            </p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`${inputClass} pl-11`}
                    placeholder="Enter your full name"
                    maxLength={100}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`${inputClass} pl-11`}
                    placeholder="Enter your phone number"
                    maxLength={20}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Vehicle Type
                </label>
                <div className="relative">
                  <Bike
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className={`${inputClass} pl-11`}
                  >
                    <option value="">Select vehicle type</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Bicycle">Bicycle</option>
                    <option value="E-bike">E-bike</option>
                    <option value="Tricycle">Tricycle</option>
                    <option value="Car">Car</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Plate Number
                </label>
                <input
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  className={inputClass}
                  placeholder="Enter plate number"
                  maxLength={30}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <input
                  value={profile.user?.email || ""}
                  className={`${inputClass} bg-slate-50`}
                  disabled
                />
                <p className="mt-1 text-xs text-slate-400">
                  Email address cannot be changed here.
                </p>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-5">
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {savingProfile ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                Save Changes
              </button>
            </div>
          </form>
        </section>

        {/* Change Password */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Change Password
              </h2>
              <p className="text-sm text-slate-500">
                Update your account password regularly.
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass}
                placeholder="Enter current password"
                autoComplete="current-password"
                required
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-5">
              <button
                type="submit"
                disabled={changingPassword}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {changingPassword ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Lock size={18} />
                )}
                Change Password
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
