import { Button } from '@/components/ui/button'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { addHours } from 'date-fns'
import * as React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { FileUpload } from '../../components/file-upload'
import { CreatableEvent, creatableEventSchema, Currency, EndConditionType, RecurrenceFrequency } from './types'
import { useUploadMedia } from '../chats/hooks/useUploadMedia'
import { toast } from 'sonner'
import { useEventMutations } from './hooks/useEventMutations'

interface CreateEventModelProps {
  open: boolean
  onClose: () => void
}

export function EventCreateModal({ open, onClose }: CreateEventModelProps) {
  const [photos, setPhotos] = React.useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { createEvent } = useEventMutations()
  const { uploadFile, validateFile, isUploading } = useUploadMedia()
  const defaultValues = React.useMemo(() => ({
    name: '',
    description: '',
    price: { amount: 0, currency: Currency.MXN },
    capacity: { isLimited: false, maxCapacity: null },
    duration: {
      startAt: addHours(new Date(), 1).toISOString(),
      endAt: addHours(new Date(), 2).toISOString(),
    },
    recurrence: { frequency: RecurrenceFrequency.NEVER, endCondition: null },
    location: '',
    photos: [],
  }), [])

  const form = useForm<CreatableEvent>({
    resolver: zodResolver(creatableEventSchema),
    defaultValues,
  })

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
  } = form

  // Reset form when modal is opened/closed
  React.useEffect(() => {
    if (open) {
      reset(defaultValues)
      setPhotos([])
    }
  }, [open, reset, defaultValues])

  // Watch recurrence to conditionally render end condition inputs
  const recurrenceFrequency = watch('recurrence.frequency')
  const recurrenceEndCondition = watch('recurrence.endCondition')
  const isLimitedCapacity = watch('capacity.isLimited')

  // Determine the end condition type
  const endConditionType = recurrenceEndCondition?.type || EndConditionType.NULL

  const handleImageUpload = React.useCallback(
    async (file: File) => {
      const { isValid } = validateFile(file)
      if (!isValid) {
        form.setError("photos", { message: "Algun archivo no es válido" })
        toast.error("El archivo no es válido")
        return
      }

      try {
        const url = await uploadFile(file)
        form.setValue("photos", [...form.getValues("photos"), url])
      } catch (error) {
        toast.error("Hubo un error al subir la imagen")
      }
    },
    [uploadFile, validateFile, form],
  )

  const onSubmit = React.useCallback(async (_data: CreatableEvent) => {
    setIsSubmitting(true)

    if (photos.length > 0) {
      for (const photo of photos) {
        await handleImageUpload(photo)
      }
    }

    createEvent(form.getValues())
    setIsSubmitting(false)
    setPhotos([])
    onClose()
  }, [photos, createEvent, onClose, handleImageUpload, form])

  // Handle capacity value changes
  React.useEffect(() => {
    if (!isLimitedCapacity) {
      setValue('capacity.maxCapacity', null)
    }
  }, [isLimitedCapacity, setValue])

  // Handle frequency changes
  React.useEffect(() => {
    if (recurrenceFrequency === RecurrenceFrequency.NEVER) {
      setValue('recurrence.endCondition', null)
    }
  }, [recurrenceFrequency, setValue])

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Crear Evento</DialogTitle>
              <DialogDescription>Completa los detalles para crear un nuevo evento</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="general" className="w-full mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="capacity">Capacidad</TabsTrigger>
                <TabsTrigger value="schedule">Horario</TabsTrigger>
              </TabsList>

              {/* General Tab */}
              <TabsContent value="general" className="space-y-4 pt-4">
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Evento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Clase de Yoga" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe tu evento..."
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Virtual o dirección física"
                          {...field}
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="price.amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />




                  <FormField
                    control={control}
                    name="price.currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Moneda</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar moneda" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(Currency).map((currency) => (
                                <SelectItem key={currency} value={currency}>
                                  {currency}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mb-2">
                  <FileUpload
                    maxFiles={5}
                    maxSize={100 * 1024 * 1024}
                    value={photos}
                    onChange={setPhotos}
                  />
                </div>

              </TabsContent>

              {/* Capacity Tab */}
              <TabsContent value="capacity" className="space-y-4 pt-4">
                <FormField
                  control={control}
                  name="capacity.isLimited"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Capacidad Limitada</FormLabel>
                        <FormDescription className="text-sm text-muted-foreground">
                          Establece un límite máximo de participantes
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {isLimitedCapacity && (
                  <FormField
                    control={control}
                    name="capacity.maxCapacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacidad Máxima</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Número de participantes"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule" className="space-y-4 pt-4">
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name="duration.startAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inicio</FormLabel>
                          <FormControl>
                            <Controller
                              control={control}
                              name="duration.startAt"
                              render={({ field: controllerField }) => (
                                <DateTimePicker
                                  htmlId="startAt"
                                  defaultValue={new Date(controllerField.value)}
                                  aria-label="Fecha y hora de inicio"
                                  onChange={(date: Date) => {
                                    controllerField.onChange(date.toISOString())

                                    // Update end time if it's before the new start time
                                    const endTime = new Date(watch('duration.endAt'))
                                    if (endTime <= date) {
                                      setValue('duration.endAt', addHours(date, 1).toISOString())
                                    }
                                  }}
                                />
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="duration.endAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fin</FormLabel>
                          <FormControl>
                            <Controller
                              control={control}
                              name="duration.endAt"
                              render={({ field: controllerField }) => (
                                <DateTimePicker
                                  htmlId="endAt"
                                  defaultValue={new Date(controllerField.value)}
                                  aria-label="Fecha y hora de fin"
                                  onChange={(date: Date) =>
                                    controllerField.onChange(date.toISOString())
                                  }
                                />
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={control}
                    name="recurrence.frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recurrencia</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              if (value === RecurrenceFrequency.NEVER) {
                                setValue('recurrence.endCondition', null)
                              } else {
                                setValue('recurrence.endCondition', {
                                  type: EndConditionType.OCCURRENCES,
                                  occurrences: 1,
                                });
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar frecuencia" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(RecurrenceFrequency).map(([key, value]) => (
                                <SelectItem key={key} value={value}>
                                  {value === 'never' ? 'Nunca' :
                                    value === 'daily' ? 'Diario' :
                                      value === 'weekly' ? 'Semanal' :
                                        value === 'monthly' ? 'Mensual' : 'Anual'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {recurrenceFrequency !== RecurrenceFrequency.NEVER && (
                    <>
                      <FormField
                        control={control}
                        name="recurrence.endCondition"
                        render={() => (
                          <FormItem>
                            <FormLabel>Finalización</FormLabel>
                            <FormControl>
                              <Select
                                value={endConditionType}
                                onValueChange={(value) => {
                                  if (value === EndConditionType.OCCURRENCES) {
                                    setValue('recurrence.endCondition', {
                                      type: EndConditionType.OCCURRENCES,
                                      occurrences: 1,
                                    });
                                  } else if (value === EndConditionType.DATE) {
                                    setValue('recurrence.endCondition', {
                                      type: EndConditionType.DATE,
                                      until: new Date(Date.now() + 86400000), // tomorrow
                                    });
                                  } else {
                                    setValue('recurrence.endCondition', null);
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar tipo de finalización" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={EndConditionType.OCCURRENCES}>Después de varias ocurrencias</SelectItem>
                                  <SelectItem value={EndConditionType.DATE}>En fecha específica</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {endConditionType === EndConditionType.OCCURRENCES && (
                        <FormField
                          control={control}
                          name="recurrence.endCondition.occurrences"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número de Ocurrencias</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  placeholder="Ej: 10"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {endConditionType === EndConditionType.DATE && (
                        <FormField
                          control={control}
                          name="recurrence.endCondition.until"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fecha Final</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  min={new Date().toISOString().slice(0, 10)}
                                  value={
                                    field.value
                                      ? new Date(field.value).toISOString().slice(0, 10)
                                      : ''
                                  }
                                  onChange={(e) => {
                                    const date = new Date(e.target.value);
                                    date.setHours(23, 59, 59, 999); // Set to end of day
                                    field.onChange(date);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6 gap-2">
              <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting || isUploading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || isUploading}>Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}