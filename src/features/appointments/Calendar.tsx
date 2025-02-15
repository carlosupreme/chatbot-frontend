import { useEffect, useMemo, useState } from 'react'
import { format, isSameDay } from 'date-fns'
import { CalendarHeader } from '@/features/appointments/CalendarHeader.tsx'
import { CalendarSidebar } from '@/features/appointments/CalendarSidebar.tsx'
import { DayView } from '@/features/appointments/DayView.tsx'
import { useGetAppointments } from '@/features/appointments/hooks/useGetAppointments.ts'
import { useGetEmployees } from '@/features/appointments/hooks/useGetEmployees.ts'

export function Calendar() {
  const { data: employees } = useGetEmployees()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [view, setView] = useState<'day' | 'week'>('day')
  const { data: events } = useGetAppointments(
    format(selectedDate, 'yyyy-MM-dd')
  )
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(
    new Set()
  )

  useEffect(() => {
    setSelectedEmployees(new Set(employees?.map((emp) => emp.id) ?? []))
  }, [employees])

  const filteredEvents = useMemo(() => {
    if(!events) return []

    return events.filter(
      (event) =>
        selectedEmployees.has(event.employeeId) &&
        isSameDay(event.date, selectedDate)
    )
  }, [events, selectedEmployees, selectedDate])

  return (
    <div className='h-screen w-full flex bg-background text-foreground'>
      <CalendarSidebar
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        employees={employees}
        selectedEmployees={selectedEmployees}
        setSelectedEmployees={setSelectedEmployees}
      />

      <div className='flex-1 flex flex-col overflow-hidden'>
        <CalendarHeader
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          view={view}
          setView={setView}
        />

        <div className='flex-1 overflow-y-auto'>
          <DayView appointments={filteredEvents} date={selectedDate} />
        </div>
      </div>
    </div>
  )
}
