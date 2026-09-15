import { EventForm } from "@/components/event-form";

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-black text-white">
        Post a New <span className="bt-gradient-text">Event</span>
      </h1>
      <EventForm />
    </div>
  );
}
