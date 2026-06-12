import { Card } from "@/components/Card";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useUser } from "@/context/UserContext";
import { firestore } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Calendar, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface TimeSlot {
  subject: string;
  teacher: string;
}

interface Timetable {
  [day: string]: TimeSlot[];
}

export default function StudentTimetable() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/student-login");
      return;
    }

    if (user.userType !== "student") {
      navigate("/student-login");
      return;
    }

    loadTimetable();
  }, [user, navigate]);

  const loadTimetable = async () => {
    if (!user || !user.class || !user.section) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const timetableRef = doc(
        firestore,
        "timetables",
        `class_${user.class}_section_${user.section}`,
      );
      const timetableSnap = await getDoc(timetableRef);

      if (timetableSnap.exists()) {
        const data = timetableSnap.data();
        const loadedTimetable: Timetable = {};
        DAYS.forEach((day) => {
          loadedTimetable[day] = data[day] || [];
        });
        setTimetable(loadedTimetable);
      }
    } catch (error) {
      console.error("Error loading timetable:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  // Get time slots based on day index
  const getTimeSlots = (dayIndex: number) => {
    const baseSlots = [
      { time: "8:00 - 8:40", label: "Period 1" },
      { time: "8:40 - 9:20", label: "Period 2" },
      { time: "9:20 - 10:00", label: "Period 3" },
      { time: "10:00 - 10:40", label: "Period 4" },
    ];

    if (dayIndex % 2 === 0) {
      return [
        ...baseSlots,
        { time: "10:40 - 11:40", label: "Lunch Break", isLunch: true },
        { time: "11:40 - 12:20", label: "Period 5" },
        { time: "12:20 - 1:00", label: "Period 6" },
      ];
    } else {
      return [
        ...baseSlots.slice(0, 3),
        { time: "9:20 - 10:20", label: "Lunch Break", isLunch: true },
        { time: "10:20 - 11:00", label: "Period 4" },
        { time: "11:00 - 11:40", label: "Period 5" },
        { time: "11:40 - 12:20", label: "Period 6" },
      ];
    }
  };

  const PERIODS = getTimeSlots(0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            My Timetable
          </h1>
          <p className="text-muted-foreground font-light">
            Class {user.class}-{user.section} Schedule
          </p>
        </div>

        {/* Timetable Content */}
        {isLoading ? (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
              <Loader className="h-8 w-8 animate-spin" />
              <p className="font-light">Loading your timetable...</p>
            </div>
          </Card>
        ) : timetable ? (
          <Card className="p-6 overflow-x-auto">
            <div className="overflow-x-auto -mx-6">
              <table className="w-full border-collapse min-w-[800px] text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border px-4 py-3 text-left font-semibold sticky left-0 bg-muted/50 z-10">
                      Time
                    </th>
                    {DAYS.map((day) => (
                      <th
                        key={day}
                        className="border border-border px-4 py-3 text-left font-semibold"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERIODS.map((period, periodIndex) => (
                    <tr
                      key={period.label}
                      className={`hover:bg-muted/30 ${
                        period.isLunch ? "bg-muted/20" : ""
                      }`}
                    >
                      <td
                        className={`border border-border px-4 py-3 font-medium sticky left-0 z-10 ${
                          period.isLunch
                            ? "bg-muted/20 text-muted-foreground italic"
                            : "bg-background"
                        }`}
                      >
                        <div>
                          <p className="font-semibold">{period.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {period.time}
                          </p>
                        </div>
                      </td>
                      {DAYS.map((day, dayIndex) => {
                        const slot = timetable[day]?.[periodIndex];
                        return (
                          <td
                            key={`${day}-${periodIndex}`}
                            className={`border border-border px-4 py-3 ${
                              period.isLunch ? "bg-muted/20" : ""
                            }`}
                          >
                            <div className="space-y-1">
                              <p className="font-semibold text-base">
                                {slot?.subject || "-"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {slot?.teacher || ""}
                              </p>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-light">No timetable available yet</p>
              <p className="text-sm mt-2">
                Your teacher will upload the timetable soon
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
