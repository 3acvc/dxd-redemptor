import { RegisterPage } from "./pages/register";
import { IndexPage } from "./pages/index";
import { NAVMetricsPage } from "./pages/nav-metrics";

export function App() {
    const params = new URLSearchParams(window.location.search);

    const page = params.get("page");

    if (page === "register") {
        return <RegisterPage />;
    }

    if (page === "nav") {
        return <NAVMetricsPage />;
    }

    // Default to index page
    return <IndexPage />;
}
