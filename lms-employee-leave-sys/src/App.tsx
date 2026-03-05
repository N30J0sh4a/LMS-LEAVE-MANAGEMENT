import "./App.css";
import {createRouter} from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen";
import { RouterProvider } from "@tanstack/react-router";
import { Toaster } from "./components/ui/sonner";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

function App() {
    return (
        <>
            <RouterProvider router={router} />
            <Toaster position="top-right" />
        </>
    )
}

export default App;
