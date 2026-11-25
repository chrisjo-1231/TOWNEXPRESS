
import { useEffect, useState, type FormEvent } from "react";
import {
  UserRound,
  Mail,
  Phone,
  LockKeyhole,
  Eye,
  EyeOff,
  Save,
  Loader2,
  ShieldCheck,
  KeyRound,
  Menu,
} from "lucide-react";
import toast from "react-hot-toast";

import StoreOwnerSidebar from "../../components/store-owner/StoreOwnerSidebar";
import { useAuth } from "../../contexts/AuthContext";
import { settingsAPI } from "../../services/settings";

export default function Settings() {
  const { user, updateUser } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // PROFILE FORM
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // PASSWORD FORM
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // PASSWORD VISIBILITY
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  // ============================================
  // UPDATE PROFILE
  // ============================================

  async function handleUpdateProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (name.trim().length < 2) {
      toast.error("Name must contain at least 2 characters.");
      return;
    }

    if (!email.trim()) {
      toast.error("Email address is required.");
      return;
    }

    if (phone.trim() && phone.trim().length < 7) {
      toast.error("Phone number must contain at least 7 characters.");
      return;
    }

    try {
      setSavingProfile(true);

      const response = await settingsAPI.updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
      });

      if (response.user) {
        updateUser(response.user);
      }

      toast.success(response.message || "Profile updated successfully.");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  }

  // ============================================
  // CHANGE PASSWORD
  // ============================================

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

    if (newPassword.length > 72) {
      toast.error("New password must not exceed 72 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different from your current password.");
      return;
    }

    try {
      setSavingPassword(true);

      const response = await settingsAPI.changePassword({
        currentPassword,
        newPassword,
      });

      toast.success(response.message || "Password changed successfully.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to change password."
      );
    } finally {
      setSavingPassword(false);
    }
  }

  // ============================================
  // PASSWORD FIELD
  // ============================================

  function PasswordField({
    label,
    value,
    onChange,
    visible,
    toggleVisibility,
    placeholder,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    visible: boolean;
    toggleVisibility: () => void;
    placeholder: string;
  }) {
    return (
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          {label}
        </label>

        <div className="relative">
          <input
            type={visible ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
          />

          <button
            type="button"
            onClick={toggleVisibility}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <StoreOwnerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="min-h-screen lg:ml-72">
        {/* HEADER */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Settings
              </h1>
              <p className="text-xs text-slate-500">
                Manage your account and security
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full bg-orange-50 px-4 py-2 sm:flex">
            <ShieldCheck size={17} className="text-orange-600" />
            <span className="text-xs font-semibold text-orange-700">
              Account Settings
            </span>
          </div>
        </header>

        {/* CONTENT */}
        <div className="mx-auto max-w-5xl space-y-7 p-5 sm:p-8">
          {/* INTRO */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900">
              Account Settings
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Update your personal information and keep your account secure.
            </p>
          </section>

          {/* ACCOUNT INFORMATION */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
              <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
                <UserRound size={21} />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Account Information
                </h3>
                <p className="text-xs text-slate-500">
                  Update your personal account details.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>

                <div className="relative">
                  <UserRound
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    maxLength={100}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
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
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
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
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    maxLength={20}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-100 pt-5">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* CHANGE PASSWORD */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
              <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                <LockKeyhole size={21} />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Change Password
                </h3>
                <p className="text-xs text-slate-500">
                  Update your password to protect your account.
                </p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-5 p-6">
              <PasswordField
                label="Current Password"
                value={currentPassword}
                onChange={setCurrentPassword}
                visible={showCurrentPassword}
                toggleVisibility={() =>
                  setShowCurrentPassword(!showCurrentPassword)
                }
                placeholder="Enter current password"
              />

              <PasswordField
                label="New Password"
                value={newPassword}
                onChange={setNewPassword}
                visible={showNewPassword}
                toggleVisibility={() =>
                  setShowNewPassword(!showNewPassword)
                }
                placeholder="Enter new password"
              />

              <PasswordField
                label="Confirm New Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                visible={showConfirmPassword}
                toggleVisibility={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                placeholder="Confirm new password"
              />

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <KeyRound
                    size={18}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />

                  <div>
                    <p className="text-sm font-bold text-blue-900">
                      Password Requirements
                    </p>
                    <p className="mt-1 text-xs leading-5 text-blue-700">
                      Use at least 8 characters. Your new password must be
                      different from your current password.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-100 pt-5">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingPassword ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <LockKeyhole size={17} />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* ACCOUNT SECURITY */}
          <section className="rounded-2xl border border-green-200 bg-green-50 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={22}
                className="mt-0.5 shrink-0 text-green-600"
              />

              <div>
                <h3 className="font-bold text-green-900">
                  Account Security
                </h3>
                <p className="mt-1 text-sm leading-6 text-green-800">
                  Your account is protected by password authentication.
                  Keep your password private and never share your login
                  credentials with anyone.
                </p>
              </div>
            </div>
          </section>

          <p className="pb-5 text-center text-xs text-slate-400">
            TownExpress Store Owner Settings
          </p>
        </div>
      </main>
    </div>
  );
}
