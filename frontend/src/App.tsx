import { AppRouter } from "./router/AppRouter";
import { Toaster } from "react-hot-toast";
import "./styles/global.css";

function App() {
    return (
        <>
            <AppRouter />
            <Toaster position="top-right" />
        </>
    );
}

export default App;
