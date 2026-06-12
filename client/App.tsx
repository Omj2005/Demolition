import "./global.css";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ActivityProvider } from "./context/ActivityContext";
import { FileProvider } from "./context/FileContext";
import { UserProvider } from "./context/UserContext";
import Announcements from "./pages/Announcements";
import Courses from "./pages/Courses";
import CreateQuiz from "./pages/CreateQuiz";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Placeholder from "./pages/Placeholder";
import Profile from "./pages/Profile";
import StudentDashboard from "./pages/StudentDashboard";
import StudentLogin from "./pages/StudentLogin";
import StudentPerformance from "./pages/StudentPerformance";
import StudentQuiz from "./pages/StudentQuiz";
import StudentSignup from "./pages/StudentSignup";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherLogin from "./pages/TeacherLogin";
import TeacherSignup from "./pages/TeacherSignup";
import Timetable from "./pages/Timetable";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <UserProvider>
          <ActivityProvider>
            <FileProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/teacher-login" element={<TeacherLogin />} />
                  <Route path="/student-login" element={<StudentLogin />} />
                  <Route path="/teacher-signup" element={<TeacherSignup />} />
                  <Route path="/student-signup" element={<StudentSignup />} />
                  <Route
                    path="/teacher-dashboard"
                    element={<TeacherDashboard />}
                  />
                  <Route
                    path="/student-dashboard"
                    element={<StudentDashboard />}
                  />
                  <Route
                    path="/student-timetable"
                    element={<StudentTimetable />}
                  />
                  <Route path="/timetable" element={<Timetable />} />
                  <Route path="/create-quiz" element={<CreateQuiz />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route
                    path="/student-performance"
                    element={<StudentPerformance />}
                  />
                  <Route path="/announcements" element={<Announcements />} />
                  <Route path="/student-quiz" element={<StudentQuiz />} />
                  <Route path="/progress" element={<Placeholder />} />
                  <Route path="/schedule" element={<Placeholder />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </FileProvider>
          </ActivityProvider>
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
