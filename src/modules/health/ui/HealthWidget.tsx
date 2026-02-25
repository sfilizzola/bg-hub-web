import { useEffect, useMemo, useState } from "react";
import type { HealthStatus } from "../domain/HealthStatus";
import { getHealthStatus } from "../application/getHealthStatus";
import { useAppContainer } from "../../../app/providers/useAppContainer";

export function HealthWidget() {
  const container = useAppContainer();
  const load = useMemo(() => getHealthStatus(container.health.repository), [container.health.repository]);

  const [status, setStatus] = useState<HealthStatus | null>(null);

  useEffect(() => {
    load().then(setStatus);
  }, [load]);

  if (!status) return <p>Checking status…</p>;

  return (
    <div
      style={{
        marginTop: 16,
        padding: 12,
        border: "1px solid #ddd",
        borderRadius: 8,
      }}
    >
      <strong>{status.ok ? "✅ OK" : "❌ DOWN"}</strong>
      <div>{status.message}</div>
    </div>
  );
}
