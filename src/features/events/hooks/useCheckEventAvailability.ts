import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/axiosInstance.ts'
import { format } from 'date-fns'
import { EventAvailability } from '@/features/events/types.ts'

export function useCheckEventAvailability(eventId: string, date: Date | null) {
  return useQuery({
    queryKey: ['event', eventId, 'availability', date],
    enabled: !!date,
    queryFn: () =>
      api.get<EventAvailability>('/events/' + eventId + '/availability', {data: {date: format(date as Date, "yyyy-MM-DD")}}).then((res) => res.data),
  })
}
