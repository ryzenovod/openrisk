'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { fetchJobs } from '@/lib/api-client';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    fetchJobs()
      .then((data) => setJobs(data))
      .catch(() => setJobs([]));
  }, []);

  return (
    <div className="space-y-6">
      <div className="alpha-gradient rounded-3xl border border-border p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Операции</p>
        <h2 className="mt-3 text-3xl font-semibold">Очередь задач</h2>
        <p className="mt-2 text-sm text-muted-foreground">История оптимизации и retrain.</p>
      </div>
      <Card>
          <CardHeader>
            <CardTitle>Последние job</CardTitle>
          </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Прогресс</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <Link className="text-primary underline" href={`/jobs/${job.id}`}>
                      #{job.id}
                    </Link>
                  </TableCell>
                  <TableCell>{job.job_type}</TableCell>
                  <TableCell>
                    <Badge variant={job.status === 'completed' ? 'success' : 'warning'}>{job.status}</Badge>
                  </TableCell>
                  <TableCell>{Math.round(job.progress * 100)}%</TableCell>
                </TableRow>
              ))}
              {!jobs.length && (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    Пока нет задач. Запустите оптимизацию или retrain.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
