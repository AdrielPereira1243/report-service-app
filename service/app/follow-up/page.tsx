import { Suspense } from "react";
import { FollowUpPage } from "../_components/PlannerApp";

export default function FollowUpRoute() {
  return (
    <Suspense fallback={<div className="text-sm text-zinc-500">Carregando...</div>}>
      <FollowUpPage />
    </Suspense>
  );
}

