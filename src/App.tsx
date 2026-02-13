import { HealthWidget } from "./modules/health/ui/HealthWidget";

function App() {
  return (
    <main style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>BG Hub</h1>
      <p>Web Platform – v1</p>
      <HealthWidget />
    </main>
  );
}

export default App
