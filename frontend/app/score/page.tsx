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
      setMessage('Scoring completed');
    } catch (error) {
      setMessage('Failed to score. Check API.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Score application</h2>
        <p className="text-sm text-muted">Введите параметры заявки и получите PD/EL.</p>
      </div>
      {message && <Toast message={message} />}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Application form</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {Object.entries(form).map(([key, value]) => (
              <label key={key} className="grid gap-1 text-sm">
                {key}
                <input
                  className="rounded-md border bg-background px-3 py-2"
                  value={value}
                  type="number"
                  step="any"
                  onChange={(event) => handleChange(key, event.target.value)}
                />
              </label>
            ))}
            <Button onClick={handleSubmit}>Run scoring</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result ? (
              <>
                <div className="flex items-center gap-2">
                  <Badge variant={result.recommendation === 'approve' ? 'success' : 'warning'}>
                    {result.recommendation}
                  </Badge>
                  <span className="text-sm text-muted">Model decision</span>
                </div>
                <div>
                  <p className="text-sm text-muted">PD</p>
                  <p className="text-2xl font-semibold">{(result.pd * 100).toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Expected loss</p>
                  <p className="text-2xl font-semibold">${result.expected_loss.toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Top factors</p>
                  <div className="flex flex-wrap gap-2">
                    {result.top_factors.map((factor: string) => (
                      <Badge key={factor}>{factor}</Badge>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted">Запустите скоринг для рзультата.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
