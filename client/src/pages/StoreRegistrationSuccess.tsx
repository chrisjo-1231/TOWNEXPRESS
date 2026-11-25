
import { Link } from "react-router-dom";
import { CheckCircle2, Clock, Store } from "lucide-react";

export default function StoreRegistrationSuccess() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">

        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 size={36} />
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          Application Submitted!
        </h1>

        <p className="mt-3 text-gray-600">
          Your store registration has been successfully submitted to TownExpress.
        </p>

        <div className="my-7 rounded-xl bg-amber-50 p-5 text-left">
          <div className="flex items-center gap-2 font-semibold text-amber-800">
            <Clock size={20} />
            Waiting for Approval
          </div>

          <p className="mt-2 text-sm text-amber-700">
            Our administrator will review your store application.
            You will be able to access store management features once approved.
          </p>
        </div>

        <Link
          to="/login"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          <Store size={18} />
          Go to Login
        </Link>

        <Link
          to="/"
          className="mt-4 inline-block text-sm text-gray-500 hover:text-blue-600"
        >
          Back to Home
        </Link>

      </div>
    </div>
  );
}
