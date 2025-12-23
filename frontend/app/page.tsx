'use client';

import { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchDashboard } from '@/lib/api-client';

const fallbackMetrics = {
  total_applications: 0,
  approved_rate: 0,
  average_pd: 0,
  portfolio_el: 0
};

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch(() => {
        setData({
          metrics: fallbackMetrics,
          recent_jobs: [],
          pd_distribution: [0.1, 0.2, 0.15, 0.3],
          el_over_time: [1200, 900, 1400, 1100],
          job_durations: [0.4, 0.7, 0.9]
        });
      });
  }, []);

  if (!data) {
    return <Skeleton className="h-64 w-full" />;
  }

  const metrics = data.metrics;

  return (
    <div className="space-y-6">
      <div className="alpha-gradient rounded-3xl border border-border p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Кредитный риск</p>
        <h2 className="mt-3 text-3xl font-semibold">Дашборд портфеля</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Реальные метрики и мониторинг качества выдачи.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Всего заявок</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{metrics.total_applications}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Доля одобрений</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{(metrics.approved_rate * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Средняя PD</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{(metrics.average_pd * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ожидаемые потери</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{metrics.portfolio_el.toFixed(0)} ₽</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Распределение PD</CardTitle>
            <Badge>аналитика</Badge>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.pd_distribution.map((value: number, index: number) => ({ index, value }))}>
                <XAxis dataKey="index" hide />
                <YAxis hide />
                <Tooltip />
                <Area dataKey="value" stroke="#2563eb" fill="#93c5fd" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>EL во времени</CardTitle>
            <Badge variant="success">стабильно</Badge>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.el_over_time.map((value: number, index: number) => ({ index, value }))}>
                <XAxis dataKey="index" hide />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="value" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
