import { Card } from "@/components/Card";
import { DashboardHeader } from "@/components/DashboardHeader";
import { RecentActivity } from "@/components/RecentActivity";
import { PAGE_SEO, SEO } from "@/components/SEO";
import { TodoFlowchart } from "@/components/TodoFlowchart";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useActivity } from "@/context/ActivityContext";
import { useUser } from "@/context/UserContext";
import { firestore } from "@/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { BarChart3, BookOpen, Home, Loader, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const PERIODS = Array.from({ length: 8 }, (_, i) => `Period ${i + 1}`);
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

interface Quiz {
  id: string;
  title: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
}

interface Timetable {
  [day: string]: TimeSlot[];
}

export default function StudentDashboard() {
  const { user } = useUser();
  const { addActivity } = useActivity();
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [todayQuiz, setTodayQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/student-login");
      return;
    }

    loadTimetableAndQuiz();
  }, [user, navigate]);

  const loadTimetableAndQuiz = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Load timetable
      if (user.class && user.section) {
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

        // Load today's quiz (latest quiz for the student's class and section)
        const quizzesRef = collection(firestore, "quizzes");
        const q = query(
          quizzesRef,
          where("class", "==", user.class),
          where("section", "==", user.section),
          orderBy("createdAt", "desc"),
          limit(1),
        );

        const quizSnapshot = await getDocs(q);
        if (!quizSnapshot.empty) {
          const quizDoc = quizSnapshot.docs[0];
          setTodayQuiz({
            id: quizDoc.id,
            ...quizDoc.data(),
          } as Quiz);
        }
      }
    } catch (error) {
      console.error("Error loading timetable and quiz:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizSubmit = async () => {
    if (!selectedAnswer || !todayQuiz || !user) {
      toast({
        title: "Error",
        description: "Please select an answer before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingQuiz(true);
    try {
      const isCorrect = selectedAnswer === todayQuiz.correctAnswer;

      // Save quiz attempt to Firestore
      const attemptsRef = collection(firestore, "quizAttempts");
      await addDoc(attemptsRef, {
        quizId: todayQuiz.id,
        quizTitle: todayQuiz.title,
        studentEmail: user.email,
        studentName: user.name,
        studentClass: user.class,
        studentSection: user.section,
        selectedAnswer,
        correctAnswer: todayQuiz.correctAnswer,
        isCorrect,
        timestamp: Timestamp.now(),
      });

      // Add activity
      addActivity({
        type: "quiz_attempt",
        title: `Quiz ${isCorrect ? "Passed" : "Attempted"}`,
        description: `${todayQuiz.title} - ${isCorrect ? "✅ Correct" : "❌ Incorrect"}`,
        metadata: {
          quizId: todayQuiz.id,
          isCorrect,
        },
      });

      setQuizSubmitted(true);

      toast({
        title: isCorrect ? "Correct! 🎉" : "Incorrect",
        description: isCorrect
          ? "Great job! You got it right!"
          : `The correct answer was: ${todayQuiz.correctAnswer}`,
        variant: isCorrect ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  if (!user) return null;

  const courses = [
    { id: 1, name: "Mathematics", icon: "📐", lessons: 12 },
    { id: 2, name: "Science", icon: "🔬", lessons: 15 },
    { id: 3, name: "English", icon: "📚", lessons: 8 },
    { id: 4, name: "Social Science", icon: "🌍", lessons: 10 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO {...PAGE_SEO.studentDashboard} />
      <DashboardHeader />

      {/* Mobile First: Responsive spacing and padding */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8">
        {/* Featured Course Banner - Mobile First */}
        <Card
          variant="gradient"
          className="p-4 sm:p-6 md:p-8 lg:p-12 text-white space-y-3 sm:space-y-4"
        >
          <div className="space-y-1 sm:space-y-2">
            <p className="text-xs sm:text-sm font-light opacity-90">
              {user.school && user.place
                ? `${user.school}, ${user.place}`
                : user.school || "Your School"}
            </p>
            <p className="text-xs sm:text-sm font-light opacity-90">
              Class {user.class} - Section {user.section}
            </p>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
              Welcome back, {user.name}!
            </h2>
          </div>
          <div className="h-0.5 bg-white/30 w-full" />
          <p className="text-xs sm:text-sm font-light opacity-90">
            Check your timetable and today's quiz below
          </p>
        </Card>

        {/* My Courses Section - Mobile First */}
        <section className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-bold">My Courses</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="p-4 sm:p-6 md:p-8 flex flex-col items-center gap-2 sm:gap-3 md:gap-4 text-center hover:shadow-lg active:shadow-xl transition-shadow cursor-pointer touch-manipulation"
              >
                <div className="text-3xl sm:text-4xl md:text-5xl">
                  {course.icon}
                </div>
                <div>
                  <h4 className="text-sm sm:text-base md:text-xl font-semibold">
                    {course.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground font-light">
                    {course.lessons} Lessons
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Today's Quiz - Mobile First */}
        {isLoading ? (
          <section className="space-y-3 sm:space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold">Today's Quiz</h3>
            <Card className="p-6 sm:p-8 md:p-12">
              <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 text-muted-foreground">
                <Loader className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
                <p className="font-light text-sm sm:text-base">
                  Loading today's quiz...
                </p>
              </div>
            </Card>
          </section>
        ) : todayQuiz ? (
          <section className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <h3 className="text-xl sm:text-2xl font-bold">Today's Quiz</h3>
              <Link to="/student-quiz">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto touch-manipulation min-h-[44px] sm:min-h-0"
                >
                  View All Quizzes
                </Button>
              </Link>
            </div>

            <Card className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 border-2 border-primary/20 bg-primary/5">
              <div className="space-y-1 sm:space-y-2">
                <h4 className="text-lg sm:text-xl font-semibold">
                  {todayQuiz.title}
                </h4>
                <p className="text-sm sm:text-base text-muted-foreground font-light">
                  {todayQuiz.question}
                </p>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {["A", "B", "C", "D"].map((option) => {
                  const isSelected = selectedAnswer === option;
                  const showCorrect =
                    quizSubmitted && option === todayQuiz.correctAnswer;
                  const showIncorrect =
                    quizSubmitted &&
                    isSelected &&
                    option !== todayQuiz.correctAnswer;

                  return (
                    <div
                      key={option}
                      onClick={() =>
                        !quizSubmitted && setSelectedAnswer(option)
                      }
                      className={`p-3 sm:p-4 rounded-lg border transition-all touch-manipulation min-h-[56px] sm:min-h-0 ${
                        quizSubmitted
                          ? showCorrect
                            ? "border-green-500 bg-green-500/10"
                            : showIncorrect
                              ? "border-red-500 bg-red-500/10"
                              : "border-border"
                          : isSelected
                            ? "border-primary bg-primary/10 cursor-pointer active:bg-primary/20"
                            : "border-border hover:border-primary/50 active:border-primary hover:bg-primary/5 active:bg-primary/10 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div
                          className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center ${
                            quizSubmitted
                              ? showCorrect
                                ? "border-green-500 bg-green-500"
                                : showIncorrect
                                  ? "border-red-500 bg-red-500"
                                  : "border-border"
                              : isSelected
                                ? "border-primary bg-primary"
                                : "border-border"
                          }`}
                        >
                          {isSelected && !quizSubmitted && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                          {showCorrect && (
                            <span className="text-white text-xs">✓</span>
                          )}
                          {showIncorrect && (
                            <span className="text-white text-xs">✗</span>
                          )}
                        </div>
                        <p className="font-medium flex-1 text-sm sm:text-base">
                          <span className="font-semibold">{option}:</span>{" "}
                          {
                            todayQuiz.options[
                              option as keyof typeof todayQuiz.options
                            ]
                          }
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!quizSubmitted ? (
                <Button
                  variant="gradient"
                  size="lg"
                  className="w-full touch-manipulation min-h-[50px] sm:min-h-[44px] text-base"
                  onClick={handleQuizSubmit}
                  disabled={!selectedAnswer || isSubmittingQuiz}
                >
                  {isSubmittingQuiz ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Answer"
                  )}
                </Button>
              ) : (
                <div className="p-3 sm:p-4 bg-muted/50 rounded-lg text-center">
                  <p className="font-medium text-sm sm:text-base">
                    {selectedAnswer === todayQuiz.correctAnswer
                      ? "🎉 Excellent! You got it right!"
                      : `The correct answer was Option ${todayQuiz.correctAnswer}`}
                  </p>
                </div>
              )}
            </Card>
          </section>
        ) : (
          <section className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <h3 className="text-xl sm:text-2xl font-bold">Quizzes</h3>
              <Link to="/student-quiz">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto touch-manipulation min-h-[44px] sm:min-h-0"
                >
                  View All Quizzes
                </Button>
              </Link>
            </div>

            <Card className="p-6 sm:p-8 text-center space-y-3 sm:space-y-4 bg-muted/20 border-dashed">
              <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground opacity-50" />
              <div className="space-y-1 sm:space-y-2">
                <h4 className="text-lg sm:text-xl font-semibold">
                  No Quiz for Today
                </h4>
                <p className="text-sm sm:text-base text-muted-foreground font-light">
                  Catch up on previous quizzes or practice your knowledge
                </p>
              </div>
              <Link to="/student-quiz">
                <Button
                  variant="gradient"
                  className="touch-manipulation min-h-[44px]"
                >
                  Go to Quizzes
                </Button>
              </Link>
            </Card>
          </section>
        )}

        {/* Timetable Section - Mobile First: Horizontal scroll on small screens */}
        {timetable && (
          <section className="space-y-3 sm:space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold">Time Table</h3>

            <Card className="p-3 sm:p-4 md:p-6 overflow-x-auto">
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <table className="w-full border-collapse min-w-[640px] text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border border-border px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold sticky left-0 bg-muted/50 z-10">
                        Period
                      </th>
                      {DAYS.map((day) => (
                        <th
                          key={day}
                          className="border border-border px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold"
                        >
                          <span className="hidden sm:inline">{day}</span>
                          <span className="sm:hidden">
                            {day.substring(0, 3)}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PERIODS.map((period, periodIndex) => (
                      <tr key={period} className="hover:bg-muted/30">
                        <td className="border border-border px-2 sm:px-3 py-1.5 sm:py-2 font-medium bg-muted/20 sticky left-0 z-10">
                          <span className="hidden sm:inline">{period}</span>
                          <span className="sm:hidden">P{periodIndex + 1}</span>
                        </td>
                        {DAYS.map((day) => {
                          const slot = timetable[day]?.[periodIndex];
                          return (
                            <td
                              key={`${day}-${periodIndex}`}
                              className="border border-border px-2 sm:px-3 py-1.5 sm:py-2"
                            >
                              <div className="space-y-0.5 sm:space-y-1">
                                <p className="font-medium text-xs sm:text-sm">
                                  {slot?.subject || "-"}
                                </p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[80px] sm:max-w-none">
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
          </section>
        )}

        {/* Recent Activity */}
        <RecentActivity />

        {/* Daily Schedule Planner */}
        <section className="space-y-4">
          <TodoFlowchart />
        </section>
      </div>

      {/* Bottom Navigation - Mobile First: Touch-optimized */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center justify-around h-16 sm:h-20 overflow-x-auto">
          <NavItem icon={Home} label="Home" to="/student-dashboard" active />
          <NavItem icon={BookOpen} label="Courses" to="/courses" />
          <NavItem icon={Calendar} label="Timetable" to="/student-timetable" />
          <NavItem icon={Bell} label="Announcements" to="/announcements" />
          <NavItem icon={BarChart3} label="Progress" to="/progress" />
          <NavItem icon={User} label="Profile" to="/profile" />
        </div>
      </nav>

      {/* Padding for fixed nav */}
      <div className="h-16 sm:h-20" />
    </div>
  );
}

interface NavItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  to: string;
  active?: boolean;
}

function NavItem({ icon: Icon, label, to, active = false }: NavItemProps) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-0.5 sm:gap-1 px-2 sm:px-4 py-2 text-[10px] sm:text-xs font-light transition-colors touch-manipulation min-w-[60px] sm:min-w-0 ${
        active
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground active:text-primary"
      }`}
    >
      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
      <span className="truncate max-w-full">{label}</span>
    </Link>
  );
}
