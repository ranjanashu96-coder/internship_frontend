"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type { AxiosError } from "axios";
import { toast } from "sonner";

import {
  Button,
  Input,
  PageHeader,
} from "@/components/ui";

import { collegeService } from "@/lib/services";

import type {
  ApiResponse,
  College,
} from "@/types";

interface CollegeProfileForm {
  id: number;
  name: string;
  code: string;
  university: string;
  principal_name: string;
  coordinator_name: string;
  email: string;
  mobile: string;
  address: string;
  state: string;
  district: string;
  pincode: string;
}

interface ErrorResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

const initialForm: CollegeProfileForm = {
  id: 0,
  name: "",
  code: "",
  university: "",
  principal_name: "",
  coordinator_name: "",
  email: "",
  mobile: "",
  address: "",
  state: "",
  district: "",
  pincode: "",
};

const normalizeCollege = (
  college?: Partial<College> | null,
): CollegeProfileForm => ({
  id: Number(college?.id ?? 0),
  name: String(college?.name ?? ""),
  code: String(college?.code ?? ""),
  university: String(college?.university ?? ""),
  principal_name: String(
    college?.principal_name ?? "",
  ),
  coordinator_name: String(
    college?.coordinator_name ?? "",
  ),
  email: String(college?.email ?? ""),
  mobile: String(college?.mobile ?? ""),
  address: String(college?.address ?? ""),
  state: String(college?.state ?? ""),
  district: String(college?.district ?? ""),
  pincode: String(college?.pincode ?? ""),
});

/**
 * Different response structures ko handle karega:
 *
 * 1. response.data.data
 * 2. response.data.data.college
 * 3. response.data.college
 */
const extractCollege = (
  responseData: ApiResponse<College> | unknown,
): College | null => {
  if (
    !responseData ||
    typeof responseData !== "object"
  ) {
    return null;
  }

  const body = responseData as {
    data?: College | { college?: College };
    college?: College;
  };

  if (
    body.data &&
    typeof body.data === "object" &&
    "college" in body.data
  ) {
    return body.data.college ?? null;
  }

  if (
    body.data &&
    typeof body.data === "object"
  ) {
    return body.data as College;
  }

  if (body.college) {
    return body.college;
  }

  return null;
};

const getErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  const axiosError =
    error as AxiosError<ErrorResponse>;

  return (
    axiosError.response?.data?.message ??
    axiosError.response?.data?.error ??
    axiosError.message ??
    fallback
  );
};

export default function CollegeProfilePage() {
  const [form, setForm] =
    useState<CollegeProfileForm>(initialForm);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [saving, setSaving] =
    useState<boolean>(false);

  const [loadError, setLoadError] =
    useState<string>("");

  const handleChange = (
    field: keyof CollegeProfileForm,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError("");

      const response =
        await collegeService.profile();

      console.log(
        "College profile full response:",
        response,
      );

      console.log(
        "College profile response body:",
        response.data,
      );

      const college = extractCollege(
        response.data,
      );

      console.log(
        "Extracted college:",
        college,
      );

      if (!college) {
        throw new Error(
          "Backend response mein college data nahi mila",
        );
      }

      setForm(normalizeCollege(college));
    } catch (error) {
      console.error(
        "Failed to load college profile:",
        error,
      );

      const message = getErrorMessage(
        error,
        "College profile load nahi ho saka",
      );

      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const collegeName = form.name.trim();

    if (!collegeName) {
      toast.error(
        "College name required hai",
      );
      return;
    }

    if (
      form.mobile &&
      form.mobile.length !== 10
    ) {
      toast.error(
        "Mobile number 10 digits ka hona chahiye",
      );
      return;
    }

    if (
      form.pincode &&
      form.pincode.length !== 6
    ) {
      toast.error(
        "Pincode 6 digits ka hona chahiye",
      );
      return;
    }

    try {
      setSaving(true);

      const response =
        await collegeService.updateProfile({
          name: collegeName,
          university:
            form.university.trim(),
          principal_name:
            form.principal_name.trim(),
          coordinator_name:
            form.coordinator_name.trim(),
          email: form.email.trim(),
          mobile: form.mobile.trim(),
          address: form.address.trim(),
          state: form.state.trim(),
          district: form.district.trim(),
          pincode: form.pincode.trim(),
        });

      console.log(
        "College update response:",
        response,
      );

      console.log(
        "College update response body:",
        response.data,
      );

      const updatedCollege =
        extractCollege(response.data);

      if (updatedCollege) {
        setForm(
          normalizeCollege(updatedCollege),
        );
      } else {
        /*
         * Backend updated data return nahi kare,
         * tab profile dobara fetch karenge.
         */
        await loadProfile();
      }

      toast.success(
        response.data.message ??
          "College profile updated successfully",
      );
    } catch (error) {
      console.error(
        "Failed to update college profile:",
        error,
      );

      toast.error(
        getErrorMessage(
          error,
          "College profile update nahi ho saka",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[350px] place-items-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="text-sm text-slate-500">
            College profile loading...
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <PageHeader title="College Profile" />

        <div className="card max-w-2xl p-6">
          <h2 className="text-lg font-semibold text-red-600">
            Profile load nahi hua
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            {loadError}
          </p>

          <Button
            type="button"
            className="mt-4"
            onClick={() => {
              void loadProfile();
            }}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="College Profile" />

      <form
        onSubmit={handleSubmit}
        className="card grid max-w-4xl gap-5 p-6 md:grid-cols-2"
      >
        <div>
          <label
            htmlFor="college-name"
            className="label"
          >
            College name
          </label>

          <Input
            id="college-name"
            value={form.name}
            onChange={(event) =>
              handleChange(
                "name",
                event.target.value,
              )
            }
            placeholder="Enter college name"
            required
          />
        </div>

        <div>
          <label
            htmlFor="college-code"
            className="label"
          >
            College code
          </label>

          <Input
            id="college-code"
            value={form.code}
            placeholder="College code"
            disabled
          />

          <p className="mt-1 text-xs text-slate-500">
            Not editable
          </p>
        </div>

        <div>
          <label
            htmlFor="university"
            className="label"
          >
            University
          </label>

          <Input
            id="university"
            value={form.university}
            onChange={(event) =>
              handleChange(
                "university",
                event.target.value,
              )
            }
            placeholder="Enter university name"
          />
        </div>

        <div>
          <label
            htmlFor="principal-name"
            className="label"
          >
            Principal name
          </label>

          <Input
            id="principal-name"
            value={form.principal_name}
            onChange={(event) =>
              handleChange(
                "principal_name",
                event.target.value,
              )
            }
            placeholder="Enter principal name"
          />
        </div>

        <div>
          <label
            htmlFor="coordinator-name"
            className="label"
          >
            Coordinator name
          </label>

          <Input
            id="coordinator-name"
            value={form.coordinator_name}
            onChange={(event) =>
              handleChange(
                "coordinator_name",
                event.target.value,
              )
            }
            placeholder="Enter coordinator name"
          />
        </div>

        <div>
          <label
            htmlFor="mobile"
            className="label"
          >
            Mobile
          </label>

          <Input
            id="mobile"
            type="tel"
            inputMode="numeric"
            value={form.mobile}
            maxLength={10}
            onChange={(event) =>
              handleChange(
                "mobile",
                event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 10),
              )
            }
            placeholder="Enter 10 digit mobile"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="label"
          >
            Email
          </label>

          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(event) =>
              handleChange(
                "email",
                event.target.value,
              )
            }
            placeholder="Enter college email"
          />
        </div>

        <div>
          <label
            htmlFor="state"
            className="label"
          >
            State
          </label>

          <Input
            id="state"
            value={form.state}
            onChange={(event) =>
              handleChange(
                "state",
                event.target.value,
              )
            }
            placeholder="Enter state"
          />
        </div>

        <div>
          <label
            htmlFor="district"
            className="label"
          >
            District
          </label>

          <Input
            id="district"
            value={form.district}
            onChange={(event) =>
              handleChange(
                "district",
                event.target.value,
              )
            }
            placeholder="Enter district"
          />
        </div>

        <div>
          <label
            htmlFor="pincode"
            className="label"
          >
            Pincode
          </label>

          <Input
            id="pincode"
            type="text"
            inputMode="numeric"
            value={form.pincode}
            maxLength={6}
            onChange={(event) =>
              handleChange(
                "pincode",
                event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 6),
              )
            }
            placeholder="Enter 6 digit pincode"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="address"
            className="label"
          >
            Address
          </label>

          <textarea
            id="address"
            className="input min-h-28 w-full resize-y"
            value={form.address}
            onChange={(event) =>
              handleChange(
                "address",
                event.target.value,
              )
            }
            placeholder="Enter complete address"
          />
        </div>

        <div className="flex justify-end md:col-span-2">
          <Button
            type="submit"
            disabled={saving}
            className="min-w-40"
          >
            {saving
              ? "Saving..."
              : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}