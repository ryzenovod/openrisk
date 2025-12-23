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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Job #{params.jobId}</h2>
          <p className="text-sm text-muted">Realtime log streaming via SSE.</p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          {job ? (
            <div className="text-sm">
              <p>Type: {job.job_type}</p>
              <p>Status: {job.status}</p>
              <p>Progress: {Math.round(job.progress * 100)}%</p>
            </div>
          ) : (
            <p className="text-sm text-muted">Loading...</p>
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
                <div key={event.id} className="rounded-md border bg-muted/40 px-3 py-2">
                  <span className="font-semibold">[{event.level}]</span> {event.message}
                </div>
              ))
            ) : (
              <p className="text-muted">Waiting for events...</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
