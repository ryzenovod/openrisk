'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createJobEventSource, fetchJob } from '@/lib/api-client';

export default function JobDetailPage({ params }: { params: { jobId: string } }) {
  const [job, setJob] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const id = Number(params.jobId);
    fetchJob(id).then(setJob).catch(() => setJob(null));

    const source = createJobEventSource(id);
    source.addEventListener('log', (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      setEvents((prev) => [...prev, data]);
    });
    return () => source.close();
  }, [params.jobId]);

  return (
    <div className="space-y-6">
      <div className="alpha-gradient rounded-3xl border border-border p-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Realtime</p>
          <h2 className="mt-2 text-3xl font-semibold">Задача #{params.jobId}</h2>
          <p className="mt-2 text-sm text-muted-foreground">Лог стримится через SSE.</p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Обновить
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          {job ? (
            <div className="text-sm space-y-1">
              <p>Тип: {job.job_type}</p>
              <p>Статус: {job.status}</p>
              <p>Прогресс: {Math.round(job.progress * 100)}%</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Загрузка...</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Live log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {events.length ? (
              events.map((event) => (
                <div key={event.id} className="rounded-2xl border border-border bg-muted/50 px-4 py-3">
                  <span className="font-semibold">[{event.level}]</span> {event.message}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Ожидаем события...</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
