import { notFound } from "next/navigation";

// Any address that isn't a real page shows the "not found" page in the right language.
export default function CatchAll() {
  notFound();
}
