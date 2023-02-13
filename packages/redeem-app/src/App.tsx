import {
    createBrowserRouter,
    RouterProvider,
    Navigate,
} from "react-router-dom";

import RegisterPage from "./pages/register";
import IndexPage from "./pages/index";
import NAVMetricsPage from "./pages/nav-metrics";

const router = createBrowserRouter([
    {
        path: "/register",
        element: <RegisterPage />,
    },
    {
        path: "/nav",
        element: <NAVMetricsPage />,
    },
    {
        path: "*",
        element: <OldRedirects />,
    },
]);

function OldRedirects() {
    const params = new URLSearchParams(window.location.search);

    const page = params.get("page");

    console.log({ page });

    if (page === "register") {
        return <Navigate to="/register" />;
    }

    if (page === "nav") {
        return <Navigate to="/nav" />;
    }

    return <IndexPage />;
}

export function App() {
    return <RouterProvider router={router} />;
}
