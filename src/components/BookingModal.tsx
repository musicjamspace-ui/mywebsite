import { ROOMS, formatHour, formatRs, type Booking } from "@/lib/bookingStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  booking: Booking | null;
  onClose: () => void;
  hidePrivateDetails?: boolean;
}

export default function BookingModal({ booking, onClose, hidePrivateDetails = false }: Props) {
  if (!booking) return null;
  const room = ROOMS.find((r) => r.id === booking.room);

  return (
    <Dialog open={!!booking} onOpenChange={() => onClose()}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-full sm:max-w-sm max-h-[min(85dvh,28rem)] overflow-y-auto overscroll-y-contain gap-3 p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🎸 Booking Details
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Band</span>
            <span className="font-semibold text-foreground">
              {hidePrivateDetails ? "Booked" : booking.bandName}
            </span>
          </div>
          {!hidePrivateDetails && booking.contactDetails ? (
            <div className="flex justify-between gap-2 items-start">
              <span className="text-muted-foreground shrink-0">Contact</span>
              <span className="font-medium text-foreground text-right break-words">{booking.contactDetails}</span>
            </div>
          ) : null}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Room</span>
            <span className="text-foreground">
              {room?.name} ({formatRs(room?.price ?? 0)}/hr)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span className="font-mono text-foreground">{booking.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time</span>
            <span className="font-mono text-foreground">
              {formatHour(booking.hour)} – {formatHour(booking.hour + 1)}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
