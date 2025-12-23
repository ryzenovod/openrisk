'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Toast } from '@/components/ui/toast';
import { createJob } from '@/lib/api-client';

const sampleApplications = [
  {
    age: 32,
    income: 68000,
    employment_years: 5,
    debt_to_income: 0.28,
    credit_history_months: 72,
    delinquencies: 0,
    loan_amount: 20000,
    loan_term_months: 36,
    interest_rate: 10.5
  },
  {
    age: 45,
    income: 90000,
    employment_years: 12,
    debt_to_income: 0.4,
    credit_history_months: 120,
    delinquencies: 1,
    loan_amount: 35000,
    loan_term_months: 60,
    interest_rate: 13.2
  }
];

export default function OptimizePage() {
  const [applications] = useState(sampleApplications);
  const [budget, setBudget] = useState(100000);
  const [message, setMessage] = useState('');

  const handleOptimize = async () => {
    try {
      const job = await createJob({
        job_type: 'optimize',
        applications,
        budget
      });
      setMessage(`Optimization job created: #${job.id}`);
    } catch (error) {
      setMessage('Failed to start optimization job.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Portfolio optimize</h2>
        <p className="text-sm text-muted">Запуск job для оптимального портфеля по бюджету.</p>
      </div>
      {message && <Toast message={message} />}
      <Card>
        <CardHeader>
          <CardTitle>Input applications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="text-sm">
            Budget
            <input
              className="mt-1 w-full rounded-md border bg-background px-3 py-2"
              type="number"
              value={budget}
              onChange={(event) => setBudget(Number(event.target.value))}
            />
          </label>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Age</TableHead>
                <TableHead>Income</TableHead>
                <TableHead>DTI</TableHead>
                <TableHead>Loan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app, index) => (
                <TableRow key={index}>
                  <TableCell>{app.age}</TableCell>
                  <TableCell>{app.income}</TableCell>
                  <TableCell>{app.debt_to_income}</TableCell>
                  <TableCell>{app.loan_amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button onClick={handleOptimize}>Run optimization job</Button>
        </CardContent>
      </Card>
    </div>
  );
}
