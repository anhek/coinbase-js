import PageContainer from "./Items/PageContainer";
import PageContextProvider from "./Items/PageContext";
import {useEffect, useState} from "react";

function App() {
    const proto = window.location.protocol === "http:" ? "ws" : "wss";
    const url = proto+'://'+ window.location.host+"/api/ws";
    const [cTime, setcTime] = useState(new Date());
    const [wsState, setWs] = useState(null);

    useEffect(() => {
        const ws = new WebSocket(url);
        ws.onclose = () => {
            setTimeout(() => setcTime(new Date()), 1000)
        }
        setWs(ws)
        return () => {
            if (ws) ws.close()
        }
    }, [cTime]); // eslint-disable-line

    return (
        <div className="App">
            <PageContextProvider ws={wsState}>
                <PageContainer/>
            </PageContextProvider>
        </div>
    );
}

export default App;
