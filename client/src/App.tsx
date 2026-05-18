import { createBrowserRouter, RouterProvider } from "react-router"
import Viewing from "./pages/Viewing"
import Admin from "./pages/Admin"
import Login from "./pages/LogIn"
import Register from "./pages/SuperAdminDashBoard"
import ProtectedRoute from "./pages/ProtectedRoutes"
import SuperAdmProtectedRoutes from "./pages/SuperAdmProtectedRoutes"
function App() {


  const router = createBrowserRouter([
    {
      element: <ProtectedRoute />,
      children: [
        {
          path: '/admin',
          element: <Admin />
        },
        {
          path: '/viewing',
          element: <Viewing />
        }
      ]
    },
    {
      path: '/',
      element: <Register />
    }
    // {
    //   element: <SuperAdmProtectedRoutes />,
    //   children: [
    //     {
    //       path: '/',
    //       element: <Register />
    //     }
    //   ]

    // }
    ,
    {
      path: '/login',
      element: <Login />
    },

  ])
  return (
    <RouterProvider router={router} />
  )
}

export default App
