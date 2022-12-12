import { RegisterPage } from "./pages/register";
import { IndexPage } from "./pages/index";

export function App() {
    const params = new URLSearchParams(window.location.search);

    const page = params.get("page");

    if (page === "register") {
        return <RegisterPage />;
    }

    // Default to index page
    return <IndexPage />;
}
