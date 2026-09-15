import { notFound } from "next/navigation";
import { getEventById } from "@/lib/db";
import { EventForm } from "@/components/event-form";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-black text-white">
        Edit <span className="bt-gradient-text">Event</span>
      </h1>
      <EventForm eventId={event.id} initial={event} />
    </div>
  );
}
