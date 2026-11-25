
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  Save,
  Loader2,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  customerProfileAPI,
  type CustomerProfile as CustomerProfileType,
} from "../../services/customer-profile";

import ProfilePicture from "../../components/ProfilePicture";
import { useAuth } from "../../contexts/AuthContext";

export default function CustomerProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState<
    (CustomerProfileType & { profileImage?: string | null }) | null
  >(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const data = await customerProfileAPI.getProfile();

      setProfile(data);
      setName(data.name);
      setPhone(data.phone || "");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProfileImageChange = (image: string | null) => {
    if (user) {
      updateUser({
        ...user,
        profileImage: image,
      });
    }

    setProfile((current) =>
      current ? { ...current, profileImage: image } : current
    );
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (name.trim().length < 2) {
      toast.error("Name must be at least 2 characters.");
      return;
    }

    try {
      setSavingProfile(true);

      const updated = await customerProfileAPI.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
      });

      setProfile((current) => ({
        ...updated,
        profileImage: current?.profileImage ?? null,
      }));

      setName(updated.name);
      setPhone(updated.phone || "");

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
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
      setSavingPassword(true);

      await customerProfileAPI.changePassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success("Password changed successfully!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to change password."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-orange-500" size={36} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <p className="text-slate-600">Unable to load your profile.</p>
        <button
          onClick={loadProfile}
          className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate("/customer/customerdashboard")}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-orange-500"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wider text-orange-500">
            Account Settings
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">
            My Profile
          </h1>
          <p className="mt-2 text-slate-500">
            Manage your personal information and account security.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Summary */}
          <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <ProfilePicture
                image={profile.profileImage}
                name={profile.name}
                onImageChange={handleProfileImageChange}
                size="lg"
                editable
              />

              <h2 className="mt-4 text-xl font-bold text-slate-900">
                {profile.name}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {profile.email}
              </p>

              <span className="mt-4 rounded-full bg-orange-50 px-4 py-1.5 text-xs font-bold text-orange-600">
                CUSTOMER
              </span>
            </div>

            <div className="mt-6 space-y-4 border-t border-slate-100 pt-5">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <ShieldCheck size={18} className="text-green-500" />
                Active Account
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Calendar size={18} className="text-orange-500" />
                Joined{" "}
                {new Date(profile.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-6 lg:col-span-2">
            {/* Personal Information */}
            <form
              onSubmit={handleUpdateProfile}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Personal Information
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Update your customer account details.
                </p>
              </div>

              <div className="space-y-5">
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
                      required
                      minLength={2}
                      className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={profile.email}
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-500"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Email address cannot be changed here.
                  </p>
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
                      className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingProfile ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                Save Changes
              </button>
            </form>

            {/* Change Password */}
            <form
              onSubmit={handleChangePassword}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Change Password
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Keep your account secure with a strong password.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      placeholder="Enter current password"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      placeholder="Enter new password"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingPassword ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Lock size={18} />
                )}
                Change Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
