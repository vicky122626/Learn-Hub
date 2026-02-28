import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import NavBar from './components/common/NavBar'
import Footer from './components/common/Footer'
import Home from './components/common/Home'
import Login from './components/common/Login'
import Register from './components/common/Register'
import Dashboard from './components/common/Dashboard'
import AllCourses from './components/common/AllCourses'
import CourseDetail from './components/common/CourseDetail'
import UserHome from './components/common/UserHome'
import StudentHome from './components/user/student/StudentHome'
import TeacherHome from './components/user/teacher/TeacherHome'
import AdminHome from './components/admin/AdminHome'
import AdminAllCourses from './components/admin/AllCourses'
import AddCourse from './components/user/teacher/AddCourse'
import ManageCourseContent from './components/user/teacher/ManageCourseContent'
import EnrolledCourses from './components/user/student/EnrolledCourses'
import CourseContent from './components/user/student/CourseContent'

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'))
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  if (allowedRoles && !allowedRoles.includes(user.type)) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

function App() {
  return (
    <div className="app">
      <NavBar />
      <div className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses" element={<AllCourses />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          
          {/* Protected Routes - All Users */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-home"
            element={
              <ProtectedRoute>
                <UserHome />
              </ProtectedRoute>
            }
          />
          
          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <StudentHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/enrolled-courses"
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <EnrolledCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/course-content/:enrollmentId"
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <CourseContent />
              </ProtectedRoute>
            }
          />
          
          {/* Teacher Routes */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={['Teacher']}>
                <TeacherHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-course"
            element={
              <ProtectedRoute allowedRoles={['Teacher']}>
                <AddCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-course/:courseId"
            element={
              <ProtectedRoute allowedRoles={['Teacher']}>
                <ManageCourseContent />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminAllCourses />
              </ProtectedRoute>
            }
          />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <AppFooter />
    </div>
  )
}

function AppFooter() {
  const location = useLocation()
  const hiddenPaths = ['/course-content/', '/login', '/register']
  const shouldHide = hiddenPaths.some(p => location.pathname.startsWith(p))
  if (shouldHide) return null
  return <Footer />
}

export default App
