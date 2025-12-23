'use client';

import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toast } from '@/components/ui/toast';
import { scoreApplication } from '@/lib/api-client';

const initialForm = {
  age: 35,
  income: 75000,
  employment_years: 6,
  debt_to_income: 0.32,
  credit_history_months: 60,
  delinquencies: 0,
  loan_amount: 20000,
  loan_term_months: 36,
  interest_rate: 11.5
};

const fieldLabels: Record<string, string> = {
  age: 'Возраст',
  income: 'Доход',
  employment_years: 'Стаж (лет)',
  debt_to_income: 'Долг/доход',
  credit_history_months: 'Кредитная история (мес.)',
  delinquencies: 'Просрочки',
  loan_amount: 'Сумма кредита',
  loan_term_months: 'Срок (мес.)',
  interest_rate: 'Ставка (%)'
};

export default function ScorePage() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState<any>(null);
  const [message, setMessage] = useState('');

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: Number(value) });
  };

  const handleSubmit = async () => {
    try {
      const data = await scoreApplication(form);
      setResult(data);
      setMessage('Скоринг завершён');
    } catch (error) {
      setMessage('Не удалось выполнить скоринг. Проверьте API.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="alpha-gradient rounded-3xl border border-border p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">AI скоринг</p>
        <h2 className="mt-3 text-3xl font-semibold">Оценка заявки</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Введите параметры клиента и получите PD/EL с объяснением факторов.
        </p>
      </div>
      {message && <Toast message={message} />}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Форма заявки</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {Object.entries(form).map(([key, value]) => (
              <label key={key} className="grid gap-1 text-sm">
                {fieldLabels[key] ?? key}
                <input
                  className="rounded-2xl border border-border bg-background px-4 py-2"
                  value={value}
                  type="number"
                  step="any"
                  onChange={(event) => handleChange(key, event.target.value)}
                />
              </label>
            ))}
            <Button className="h-12 px-6 text-base" onClick={handleSubmit}>
              Запустить скоринг
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Результат</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result ? (
              <>
                <div className="flex items-center gap-2">
                  <Badge variant={result.recommendation === 'approve' ? 'success' : 'warning'}>
                    {result.recommendation}
                  </Badge>
                  <span className="text-sm text-muted-foreground">Решение модели</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">PD</p>
                  <p className="text-2xl font-semibold">{(result.pd * 100).toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ожидаемые потери</p>
                  <p className="text-2xl font-semibold">${result.expected_loss.toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Топ факторы</p>
                  <div className="flex flex-wrap gap-2">
                    {result.top_factors.map((factor: string) => (
                      <Badge key={factor}>{factor}</Badge>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Запустите скоринг для результата.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
