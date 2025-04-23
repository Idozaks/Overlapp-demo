import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

interface AnalyticsSummary {
  viewCount: number;
  scanCount: number;
  overlapCount: number;
  chatClickCount: number;
  scanRate: number;
  overlapRate: number;
  chatRate: number;
  averageScore: number;
  totalSessions: number;
  completedSessions: number;
}

interface OverviewTabProps {
  analytics: AnalyticsSummary;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ analytics }) => {
  // Calculate funnel steps
  const steps = [
    { name: 'Widget Views', count: analytics.viewCount, color: 'bg-blue-500' },
    { name: 'QR Scans', count: analytics.scanCount, color: 'bg-green-500' },
    { name: 'Overlap Results', count: analytics.overlapCount, color: 'bg-yellow-500' },
    { name: 'Chat Clicks', count: analytics.chatClickCount, color: 'bg-red-500' },
  ];

  // Calculate percentage for each step relative to the previous step
  const percentages = steps.map((step, index) => {
    if (index === 0) return 100; // First step is always 100%
    const previousStepCount = steps[index - 1].count;
    return previousStepCount > 0 ? (step.count / previousStepCount) * 100 : 0;
  });

  // Calculate max width of funnel bars relative to first step
  const maxWidths = steps.map((step) => {
    return analytics.viewCount > 0 ? (step.count / analytics.viewCount) * 100 : 0;
  });

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>
            Track how users move through your widget experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{step.name}</span>
                  <span className="text-muted-foreground">{step.count} users</span>
                </div>
                <div className="h-3 rounded-full bg-secondary overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${step.color}`} 
                    style={{ width: `${maxWidths[index]}%` }}
                  />
                </div>
                {index > 0 && (
                  <div className="text-xs text-muted-foreground text-right">
                    {percentages[index].toFixed(1)}% conversion from previous step
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>
            Key performance indicators for your widget
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Average Overlap Score</span>
                <span className="text-sm font-medium">{analytics.averageScore}%</span>
              </div>
              <Progress value={analytics.averageScore} />
              <p className="text-xs text-muted-foreground">
                Average compatibility score between your community profile and visitors
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">QR Scan Rate</span>
                <span className="text-sm font-medium">{analytics.scanRate}%</span>
              </div>
              <Progress value={analytics.scanRate} />
              <p className="text-xs text-muted-foreground">
                Percentage of widget views that result in a QR code scan
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Chat Conversion Rate</span>
                <span className="text-sm font-medium">{analytics.chatRate}%</span>
              </div>
              <Progress value={analytics.chatRate} />
              <p className="text-xs text-muted-foreground">
                Percentage of overlap results that lead to a chat initiation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions Summary</CardTitle>
          <CardDescription>
            Overview of recent widget activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Total Sessions</TableCell>
                  <TableCell className="text-right">{analytics.totalSessions}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Completed Sessions</TableCell>
                  <TableCell className="text-right">{analytics.completedSessions}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Completion Rate</TableCell>
                  <TableCell className="text-right">
                    {analytics.totalSessions > 0
                      ? ((analytics.completedSessions / analytics.totalSessions) * 100).toFixed(1)
                      : 0}%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Average Overlap Score</TableCell>
                  <TableCell className="text-right">{analytics.averageScore}%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;