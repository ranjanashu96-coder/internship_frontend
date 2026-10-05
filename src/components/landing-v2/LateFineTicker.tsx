"use client";

import { useEffect, useState } from "react";



/*
|--------------------------------------------------------------------------
| LATE FINE TICKER
|--------------------------------------------------------------------------
| Landing page ke top pe ek scrolling notice.
| Admin ne jo late fine set ki hai, wo yahan dikhegi.
*/
export default function LateFineTicker() {
  const [lateFine, setLateFine] =
    useState<number>(0);
  const [startDate, setStartDate] =
    useState<string | null>(null);
  const [isLate, setIsLate] =
    useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ??
        "http://localhost:5000/api";

      const response = await fetch(
        `${apiUrl}/public/late-fine-info`,
      );

      const data = await response.json();

      if (data?.success && data?.data) {
        setLateFine(
          Number(data.data.late_fine_amount || 0),
        );
        setStartDate(
          data.data.start_date || null,
        );
        setIsLate(
          Boolean(data.data.is_late),
        );
      }
    } catch (error) {
      console.error(
        "Failed to load late fine info:",
        error,
      );
    }
  };

  /*
   * Agar late fine set nahi hai ya active nahi hai,
   * toh ticker hide kar do.
   */
  if (!startDate || lateFine <= 0) {
    return null;
  }

  /*
 * Date ko "11 Oct 2026" format mein badlo
 */
const formatDate = (
  value: string | null,
) => {
  if (!value) return "";

  try {
    const date = new Date(
      `${value}T00:00:00`,
    );

    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      },
    ).format(date);
  } catch {
    return value;
  }
};

const formattedDate =
  formatDate(startDate);

  /*
   * Display text banao
   */
  const message = isLate
  ? `⚠️ Late fine of ₹${lateFine} is now applicable for all new registrations. Register soon to avoid extra charges. / नई रजिस्ट्रेशन पर ₹${lateFine} लेट फाइन लागू है।`
  : `📢 Late fine of ₹${lateFine} will be applicable from ${formattedDate}. Register before the deadline to avoid extra charges. / ${formattedDate} से ₹${lateFine} लेट फाइन लागू होगी।`;

  return (
    <div className="w-full overflow-hidden bg-gradient-to-r from-amber-500 via-red-500 to-amber-500 py-2.5 text-white">
      {/* Scrolling text */}
      <div className="ticker-track flex whitespace-nowrap">
        {[1, 2, 3].map((index) => (
          <span
            key={index}
            className="mx-8 inline-block text-sm font-bold tracking-wide sm:text-base"
          >
            {message}
          </span>
        ))}
      </div>

      {/* Ticker animation CSS */}
      <style jsx>{`
        .ticker-track {
          animation: ticker-scroll 18s linear infinite;
        }

        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.33%);
          }
        }

        /* Hover pe pause */
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}