
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PlusIcon } from 'lucide-react';

export function CreateEventModal() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    tags: '',
    visibility: 'public'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventData(prev => ({ ...prev, [name]: value }));
  };

  const handleVisibilityChange = (value: string) => {
    setEventData(prev => ({ ...prev, visibility: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock API call to create event
    console.log('Creating event:', eventData);
    // Reset form and close modal
    setEventData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      tags: '',
      visibility: 'public'
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="w-4 h-4 mr-2" />
          {t('events.create', 'Create Event')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('events.create_title', 'Create a New Event')}</DialogTitle>
            <DialogDescription>
              {t('events.create_description', 'Fill in the details to create your event. Click create when you\'re done.')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">{t('events.form.title', 'Event Title')}</Label>
              <Input
                id="title"
                name="title"
                value={eventData.title}
                onChange={handleChange}
                placeholder={t('events.form.title_placeholder', 'Give your event a name')}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">{t('events.form.description', 'Description')}</Label>
              <Textarea
                id="description"
                name="description"
                value={eventData.description}
                onChange={handleChange}
                placeholder={t('events.form.description_placeholder', 'What\'s this event about?')}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">{t('events.form.date', 'Date')}</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={eventData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">{t('events.form.time', 'Time')}</Label>
                <Input
                  id="time"
                  name="time"
                  type="time"
                  value={eventData.time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">{t('events.form.location', 'Location')}</Label>
              <Input
                id="location"
                name="location"
                value={eventData.location}
                onChange={handleChange}
                placeholder={t('events.form.location_placeholder', 'Where is the event taking place?')}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">{t('events.form.tags', 'Tags')}</Label>
              <Input
                id="tags"
                name="tags"
                value={eventData.tags}
                onChange={handleChange}
                placeholder={t('events.form.tags_placeholder', 'Add comma-separated tags (e.g., tech, networking)')}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('events.form.visibility', 'Event Visibility')}</Label>
              <RadioGroup value={eventData.visibility} onValueChange={handleVisibilityChange}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public">{t('events.form.visibility_public', 'Public')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private">{t('events.form.visibility_private', 'Private')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="invite-only" id="invite-only" />
                  <Label htmlFor="invite-only">{t('events.form.visibility_invite', 'Invite Only')}</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{t('events.form.create_button', 'Create Event')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
